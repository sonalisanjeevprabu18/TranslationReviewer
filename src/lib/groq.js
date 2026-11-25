/**
 * Optional Groq integration.
 *
 * Groq hosts open-weight Llama models behind an OpenAI-compatible endpoint and
 * offers a free API key. It is used for two opt-in jobs only:
 *
 *   1. translating the English source when a reviewer asks for a machine draft
 *   2. judging faithfulness, hallucination rate and answer relevancy
 *
 * The key is entered by the user, kept in this browser's localStorage, and sent
 * only to api.groq.com. Nothing is proxied through another server. Without a key
 * the deterministic review engine and the local metrics still work unchanged.
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const KEY_STORAGE = 'eduterm.groq.key';
const REQUEST_TIMEOUT_MS = 45000;

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

export const GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B' },
  { id: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B' },
  { id: 'qwen/qwen3.8-27b', label: 'Qwen 3.8 27B' },
];

export class GroqError extends Error {}

export const getGroqKey = () => {
  try {
    return window.localStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
};

export const setGroqKey = (key) => {
  try {
    window.localStorage.setItem(KEY_STORAGE, String(key || '').trim());
  } catch {
    /* storage is optional */
  }
};

export const clearGroqKey = () => {
  try {
    window.localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* storage is optional */
  }
};

export const hasGroqKey = () => getGroqKey().length > 10;

const readJson = (content) => {
  try {
    return JSON.parse(content);
  } catch {
    /* fall through to a brace slice */
  }
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(content.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
};

const clampScore = (value, fallback = 0) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(100, number));
};

const friendlyError = (status, detail) => {
  if (status === 401 || status === 403) {
    return new GroqError('Groq rejected the API key. Check it in console.groq.com/keys.');
  }
  if (status === 429) {
    return new GroqError('Groq rate limit reached for this key. Wait a moment and try again.');
  }
  if (status === 404) {
    return new GroqError('That Groq model is not available on this key. Pick another model.');
  }
  return new GroqError(`Groq returned HTTP ${status}${detail ? `: ${detail}` : '.'}`);
};

async function groqChat({
  messages,
  model = DEFAULT_GROQ_MODEL,
  json = false,
  temperature = 0.1,
  maxTokens = 2000,
  signal,
  apiKey,
}) {
  const key = apiKey || getGroqKey();
  if (!key) throw new GroqError('Add your Groq API key first.');

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  if (signal) signal.addEventListener('abort', abort, { once: true });

  try {
    const send = (jsonMode) =>
      fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: controller.signal,
      });

    let response = await send(json);
    // Some Groq models reject JSON mode; retry once without it and parse the text.
    if (!response.ok && json && response.status === 400) {
      response = await send(false);
    }

    if (!response.ok) {
      let detail = '';
      try {
        const error = await response.json();
        detail = error?.error?.message || '';
      } catch {
        /* body was not JSON */
      }
      throw friendlyError(response.status, detail);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    if (!content.trim()) {
      throw new GroqError('Groq returned an empty response.');
    }

    return {
      content,
      parsed: json ? readJson(content) : null,
      model: data?.model || model,
      usage: data?.usage || null,
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new GroqError('Groq did not answer within 45 seconds.');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', abort);
  }
}

/** Translate the English source into the target language with Groq. */
export async function groqTranslate({ text, targetLanguage, targetName, model, signal }) {
  const source = String(text || '').trim();
  if (!source) throw new GroqError('Add an English source passage first.');

  const result = await groqChat({
    model,
    signal,
    temperature: 0.2,
    maxTokens: 2400,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional educational translator. Translate faithfully, keep every number, unit and proper noun exactly as written in the source, and use one consistent technical term for each concept. Return only the translation, with no notes, headings or quotation marks.',
      },
      {
        role: 'user',
        content: `Translate this English passage into ${targetName || targetLanguage}. Preserve all digits, units and names exactly.\n\n${source}`,
      },
    ],
  });

  const translated = result.content.trim().replace(/^["“]|["”]$/g, '');
  if (!translated) throw new GroqError('Groq returned an empty translation.');
  return translated;
}

const JUDGE_SYSTEM = `You are a strict bilingual reviewer of educational translation. You receive an English source passage, two translated versions, a terminology glossary, and the findings a rule-based checker flagged.

Score three things and nothing else:
- faithfulness: 0-100, how much of the translated content is supported by the source. Penalise invented facts, dropped meaning, and wrong terminology.
- hallucination_rate: 0-100, the share of checked claims that fabricate terminology, numbers, names or facts absent from the source. 0 means none.
- answer_relevancy: 0-100, how relevant the flagged findings are to genuine problems in this passage.

Return JSON only, with these keys:
{"faithfulness": number, "hallucination_rate": number, "answer_relevancy": number, "hallucinations": [{"term": string, "detail": string}], "relevant_issue_ids": [string], "unsupported_claims": [string], "rationale": string}

Only use issue ids that were supplied. Be conservative: if you cannot verify a claim, say so in rationale rather than inventing a score.`;

/** Judge faithfulness, hallucination rate and relevancy for one analysis. */
export async function judgeAnalysis({ analysis, model = DEFAULT_GROQ_MODEL, signal }) {
  if (!analysis) throw new GroqError('Run an analysis first.');

  const issues = (analysis.issues || []).slice(0, 40).map((issue) => ({
    id: issue.id,
    category: issue.category,
    severity: issue.severity,
    term: issue.term,
    detected: issue.detected,
    reason: issue.reason,
  }));

  const payload = {
    english_source: analysis.source,
    target_language: analysis.targetLanguage,
    translations: (analysis.translations || []).map((translation) => ({
      label: translation.label,
      text: translation.text,
    })),
    glossary: (analysis.glossary || []).map((entry) => ({
      english: entry.english,
      translation_1: entry.translation1,
      translation_2: entry.translation2,
      consistency: entry.consistency,
    })),
    flagged_issues: issues,
  };

  const result = await groqChat({
    model,
    signal,
    json: true,
    temperature: 0.1,
    maxTokens: 1400,
    messages: [
      { role: 'system', content: JUDGE_SYSTEM },
      { role: 'user', content: JSON.stringify(payload) },
    ],
  });

  if (!result.parsed) {
    throw new GroqError('Groq returned an unreadable evaluation. Try again or pick another model.');
  }

  const parsed = result.parsed;
  const issueIds = new Set(issues.map((issue) => issue.id));
  const relevantIssueIds = Array.isArray(parsed.relevant_issue_ids)
    ? [...new Set(parsed.relevant_issue_ids.filter((id) => issueIds.has(id)))]
    : [];

  const answerRelevancy = issues.length
    ? Math.round((relevantIssueIds.length / issues.length) * 100)
    : clampScore(parsed.answer_relevancy);

  const hallucinations = Array.isArray(parsed.hallucinations)
    ? parsed.hallucinations
        .filter((item) => item && (item.term || item.detail))
        .slice(0, 12)
        .map((item) => ({
          term: String(item.term || 'Unspecified'),
          detail: String(item.detail || ''),
        }))
    : [];

  const unsupportedClaims = Array.isArray(parsed.unsupported_claims)
    ? parsed.unsupported_claims.filter(Boolean).slice(0, 12).map(String)
    : [];

  return {
    faithfulness: clampScore(parsed.faithfulness),
    hallucinationRate: clampScore(parsed.hallucination_rate),
    answerRelevancy,
    hallucinations,
    unsupportedClaims,
    relevantIssueIds,
    evaluatedIssues: issues.length,
    rationale: String(parsed.rationale || '').trim(),
    model: result.model,
  };
}

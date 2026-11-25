/**
 * Review quality metrics.
 *
 * Two families live here:
 *
 * 1. Local, deterministic metrics — always available, no network:
 *    - BERTScore-style semantic preservation between the two translated versions
 *
 * 2. Model-judged metrics (faithfulness, hallucination rate, answer relevancy)
 *    which live in `groq.js` because they require the optional Groq key.
 *
 * The BERTScore implementation follows the published BERTScore formulation
 * (greedy token matching, precision/recall/F1) but supplies its own token
 * embedding: character-trigram hashing instead of a downloaded BERT encoder.
 * It is reproducible and offline; the UI labels it as a proxy so the number is
 * never mistaken for a full multilingual BERTScore run.
 */

import { goldLabelsFor } from './groundTruth.js';

export const METRIC_DEFINITIONS = [
  {
    id: 'bertscore',
    label: 'BERTScore',
    definition:
      'Semantic preservation between Translation 1 and Translation 2, reported as a similarity score over greedy token matches.',
    source: 'Local · deterministic',
  },
  {
    id: 'faithfulness',
    label: 'Faithfulness',
    definition:
      'How much of each translated claim is supported by the English source passage, scored 0–100.',
    source: 'Groq · hosted LLM judge',
  },
  {
    id: 'hallucination',
    label: 'Hallucination Rate',
    definition:
      'Share of checked claims that introduce fabricated terminology, values or facts not present in the source.',
    source: 'Groq · hosted LLM judge',
  },
  {
    id: 'relevancy',
    label: 'Answer Relevancy',
    definition:
      'Share of flagged findings that point at a genuine problem in the passage rather than noise.',
    source: 'Groq · hosted LLM judge',
  },
];

/* ------------------------------------------------------------------ */
/* BERTScore-style semantic similarity                                 */
/* ------------------------------------------------------------------ */

const NGRAM_SIZE = 3;
const EMBEDDING_DIM = 512;

const tokenize = (text = '') =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

const charNgrams = (token) => {
  const padded = ` ${token} `;
  const grams = [];
  const size = Math.min(NGRAM_SIZE, padded.length);
  for (let index = 0; index <= padded.length - size; index += 1) {
    grams.push(padded.slice(index, index + size));
  }
  return grams;
};

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const embedToken = (token, cache) => {
  const cached = cache.get(token);
  if (cached) return cached;

  const vector = new Float64Array(EMBEDDING_DIM);
  charNgrams(token).forEach((gram) => {
    vector[hashString(gram) % EMBEDDING_DIM] += 1;
  });

  let norm = 0;
  for (let index = 0; index < vector.length; index += 1) norm += vector[index] ** 2;
  norm = Math.sqrt(norm) || 1;
  for (let index = 0; index < vector.length; index += 1) vector[index] /= norm;

  cache.set(token, vector);
  return vector;
};

const cosine = (left, right) => {
  let sum = 0;
  for (let index = 0; index < left.length; index += 1) sum += left[index] * right[index];
  return sum;
};

const mean = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;

/**
 * Semantic preservation of `candidate` against the reference translation.
 * Returns null when either side is empty.
 */
export function bertScore(referenceText, candidateText) {
  const reference = tokenize(referenceText);
  const candidate = tokenize(candidateText);
  if (!reference.length || !candidate.length) return null;

  const cache = new Map();
  const referenceVectors = reference.map((token) => embedToken(token, cache));
  const candidateVectors = candidate.map((token) => embedToken(token, cache));

  const bestMatches = (from, to) =>
    from.map((vector) => Math.max(...to.map((other) => cosine(vector, other))));

  const recall = mean(bestMatches(referenceVectors, candidateVectors));
  const precision = mean(bestMatches(candidateVectors, referenceVectors));
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    precision,
    recall,
    f1,
    referenceTokens: reference.length,
    candidateTokens: candidate.length,
  };
}

/* ------------------------------------------------------------------ */
/* Detection accuracy against the annotated ground truth               */
/* ------------------------------------------------------------------ */

const TERMINOLOGY_CATEGORIES = new Set([
  'Terminology',
  'Missing terminology',
  'Cross-passage terminology',
]);

const normalizeValue = (value) =>
  String(value ?? '')
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const detectedValues = (issue) =>
  (issue?.detected || []).map(normalizeValue).filter(Boolean);

const issueMatchesLabel = (issue, label) => {
  const values = detectedValues(issue);
  if (!values.length) return false;

  if (label.type === 'terminology') {
    return (
      TERMINOLOGY_CATEGORIES.has(issue.category) &&
      issue.term === label.term &&
      label.expected.filter((variant) => values.includes(normalizeValue(variant))).length >= 2
    );
  }

  return (
    issue.category === 'Numerical value' &&
    label.expected.every((value) => values.includes(normalizeValue(value)))
  );
};

/**
 * One-to-one comparison of detected findings against annotated labels.
 * Every detected finding that is not annotated counts as a false positive;
 * every annotated finding the engine missed counts as a false negative.
 */
export function evaluateDetection(issues = [], labels = []) {
  if (!labels.length) return null;

  const claimed = new Set();
  const matched = [];
  const missed = [];

  labels.forEach((label) => {
    const index = issues.findIndex(
      (issue, issueIndex) => !claimed.has(issueIndex) && issueMatchesLabel(issue, label)
    );
    if (index === -1) {
      missed.push(label);
      return;
    }
    claimed.add(index);
    matched.push({ label, issue: issues[index] });
  });

  const truePositives = matched.length;
  const falsePositives = issues.length - truePositives;
  const falseNegatives = labels.length - truePositives;
  const precision = truePositives + falsePositives ? truePositives / (truePositives + falsePositives) : 0;
  const recall = truePositives + falseNegatives ? truePositives / (truePositives + falseNegatives) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    labels,
    matched,
    missed,
    falsePositiveIssues: issues.filter((_, index) => !claimed.has(index)),
    truePositives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1,
  };
}

/* ------------------------------------------------------------------ */
/* Bundle for one analysis                                             */
/* ------------------------------------------------------------------ */

export function computeMetrics(analysis) {
  if (!analysis) return { semantic: null, detection: null };

  const labels = goldLabelsFor(analysis.passageId, analysis.targetLanguage);
  const [reference, candidate] = analysis.translations || [];
  const semantic =
    reference?.text && candidate?.text ? bertScore(reference.text, candidate.text) : null;

  return {
    labels,
    semantic,
    detection: evaluateDetection(analysis.issues || [], labels),
    referenceLabel: reference?.label || 'Translation 1',
    candidateLabel: candidate?.label || 'Translation 2',
  };
}

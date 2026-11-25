import { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  Gauge,
  KeyRound,
  ListChecks,
  PlayCircle,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { METRIC_DEFINITIONS, computeMetrics } from '../../lib/metrics.js';
import {
  DEFAULT_GROQ_MODEL,
  GROQ_MODELS,
  clearGroqKey,
  hasGroqKey,
  judgeAnalysis,
  setGroqKey,
} from '../../lib/groq.js';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Spinner,
  StatCard,
  inputClass,
  labelClass,
} from '../ui.jsx';

const asPercent = (value = 0) => `${Math.round(value * 100)}%`;
const asPoints = (value = 0) => `${Math.round(value)}`;

export default function MetricsTab({ analysis }) {
  const { semantic } = useMemo(() => computeMetrics(analysis), [analysis]);

  const [keyPresent, setKeyPresent] = useState(hasGroqKey);
  const [keyDraft, setKeyDraft] = useState('');
  const [model, setModel] = useState(DEFAULT_GROQ_MODEL);
  const [judge, setJudge] = useState({ status: 'idle' });

  useEffect(() => {
    setJudge({ status: 'idle' });
  }, [analysis?.id]);

  const saveKey = () => {
    if (keyDraft.trim().length < 10) return;
    setGroqKey(keyDraft);
    setKeyDraft('');
    setKeyPresent(hasGroqKey());
  };

  const forgetKey = () => {
    clearGroqKey();
    setKeyPresent(false);
    setJudge({ status: 'idle' });
  };

  const runJudge = async () => {
    setJudge({ status: 'loading' });
    try {
      const result = await judgeAnalysis({ analysis, model });
      setJudge({ status: 'done', result });
    } catch (error) {
      setJudge({ status: 'error', message: error.message });
    }
  };

  const judged = judge.status === 'done' ? judge.result : null;

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardHeader
            icon={Gauge}
            title="BERTScore — semantic preservation"
            description="Translation 2 scored against Translation 1 as the reference."
            action={<Badge tone={semantic ? 'success' : 'outline'}>{semantic ? asPercent(semantic.f1) : 'n/a'}</Badge>}
          />
          <div className="space-y-4 px-5 py-4">
            {semantic ? (
              <>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                      BERTScore
                    </p>
                    <p className="mt-1 text-[30px] font-semibold leading-none tracking-tight text-slate-900">
                      {semantic.f1.toFixed(2)}
                    </p>
                  </div>
                  <p className="max-w-[160px] text-right text-[10.5px] leading-relaxed text-slate-500">
                    {semantic.referenceTokens} reference tokens · {semantic.candidateTokens} candidate
                    tokens
                  </p>
                </div>
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10.5px] leading-relaxed text-slate-500">
                  Greedy token matching in the BERTScore formulation. Token embeddings are hashed
                  character trigrams computed locally, so this is a reproducible proxy rather than a
                  downloaded multilingual BERT encoder.
                </p>
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-200 px-3.5 py-4 text-[11.5px] leading-relaxed text-slate-500">
                Two filled translated versions are needed: Translation 1 is the reference and
                Translation 2 is scored against it.
              </p>
            )}
          </div>
        </Card>

      </div>

      <Card>
        <CardHeader
          icon={BrainCircuit}
          title="Faithfulness · Hallucination Rate · Answer Relevancy"
          description="Model-judged metrics, run only when you ask for them with your own Groq key."
          action={
            <Badge tone={keyPresent ? 'success' : 'outline'}>
              {keyPresent ? 'Groq key saved' : 'Optional'}
            </Badge>
          }
        />
        <div className="space-y-4 px-5 py-4">
          {!keyPresent ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-slate-700">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                Add a free Groq API key to judge this review
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                Create a key at console.groq.com/keys. It is stored in this browser only and sent
                directly to api.groq.com; the deterministic review and the two metrics above never
                need it.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[220px] flex-1">
                  <label className={labelClass} htmlFor="groq-key">
                    Groq API key
                  </label>
                  <input
                    id="groq-key"
                    type="password"
                    autoComplete="off"
                    className={`${inputClass} mt-1.5 font-mono text-[12px]`}
                    placeholder="gsk_…"
                    value={keyDraft}
                    onChange={(event) => setKeyDraft(event.target.value)}
                  />
                </div>
                <Button size="md" onClick={saveKey} disabled={keyDraft.trim().length < 10}>
                  Save key
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[200px]">
                <label className={labelClass} htmlFor="groq-model">
                  Judge model
                </label>
                <select
                  id="groq-model"
                  className={`${inputClass} mt-1.5`}
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                >
                  {GROQ_MODELS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={runJudge} disabled={judge.status === 'loading'}>
                {judge.status === 'loading' ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" strokeWidth={2.2} />
                )}
                {judge.status === 'loading' ? 'Judging…' : judged ? 'Re-run evaluation' : 'Evaluate with Groq'}
              </Button>
              <Button variant="ghost" size="md" onClick={forgetKey}>
                <Trash2 className="h-4 w-4" strokeWidth={2.1} />
                Forget key
              </Button>
            </div>
          )}

          {judge.status === 'error' ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" strokeWidth={2.2} />
              <p className="text-[11px] leading-relaxed text-rose-700">{judge.message}</p>
            </div>
          ) : null}

          {judged ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard
                  icon={ShieldAlert}
                  label="Faithfulness"
                  value={asPoints(judged.faithfulness)}
                  hint="Source support for the translated claims, 0–100"
                  accent="emerald"
                />
                <StatCard
                  icon={TriangleAlert}
                  label="Hallucination rate"
                  value={`${asPoints(judged.hallucinationRate)}%`}
                  hint="Fabricated terminology, values or facts · lower is better"
                  accent="rose"
                />
                <StatCard
                  icon={Target}
                  label="Answer relevancy"
                  value={`${asPoints(judged.answerRelevancy)}%`}
                  hint={`${judged.relevantIssueIds.length} of ${judged.evaluatedIssues} flagged findings judged relevant`}
                  accent="indigo"
                />
              </div>

              {judged.hallucinations.length || judged.unsupportedClaims.length ? (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-900">
                    <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Suspected fabrications
                  </p>
                  <ul className="mt-2 space-y-1">
                    {judged.hallucinations.map((item) => (
                      <li key={`${item.term}-${item.detail}`} className="text-[10.5px] leading-relaxed text-amber-900/80">
                        <span className="font-medium">{item.term}</span>
                        {item.detail ? ` — ${item.detail}` : ''}
                      </li>
                    ))}
                    {judged.unsupportedClaims.map((claim) => (
                      <li key={claim} className="text-[10.5px] leading-relaxed text-amber-900/80">
                        {claim}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {judged.rationale ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                    <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                    Judge rationale · {judged.model}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">{judged.rationale}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-[10.5px] leading-relaxed text-slate-400">
              {keyPresent
                ? 'Scores are produced by the selected Groq-hosted model on this passage only. Re-running may produce slightly different numbers; that is expected for a judgement metric.'
                : 'Until a key is added, these three metrics stay unavailable — no review data ever leaves the browser otherwise.'}
            </p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={ListChecks}
          title="How each metric is produced"
          description="Same definitions as the review report."
        />
        <ul className="divide-y divide-slate-100">
          {METRIC_DEFINITIONS.map((metric) => (
            <li key={metric.id} className="flex flex-wrap items-start justify-between gap-2 px-5 py-3">
              <div className="min-w-0 max-w-2xl">
                <p className="text-[12px] font-medium text-slate-800">{metric.label}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">{metric.definition}</p>
              </div>
              <Badge tone="outline">{metric.source}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

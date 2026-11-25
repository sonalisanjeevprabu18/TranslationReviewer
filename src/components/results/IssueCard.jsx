import { CheckCheck, Lightbulb, Sparkles } from 'lucide-react';
import Highlight from '../Highlight.jsx';
import { Badge, SeverityBadge, cx } from '../ui.jsx';

const railTone = {
  Critical: 'bg-rose-500',
  Warning: 'bg-amber-500',
  Review: 'bg-sky-500',
};

function SentenceRow({ label, text, needles, emptyLabel }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2.5">
      <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="text-[12px] leading-relaxed text-slate-700">
        <Highlight text={text} needles={needles} emptyLabel={emptyLabel} />
      </p>
    </div>
  );
}

export default function IssueCard({ issue, reviewed = false, onToggleReviewed, className = '' }) {
  const minLength = issue.category === 'Numerical value' ? 1 : 2;
  const needlesFor = (text) => {
    if (!text) return [];
    const candidates = [issue.term, ...(issue.detected || [])]
      .filter(Boolean)
      .map(String)
      .filter((value) => value.length >= minLength);
    return [...new Set(candidates)].filter((value) =>
      text.toLowerCase().includes(value.toLowerCase())
    );
  };

  return (
    <article
      className={cx(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        className
      )}
    >
      <span
        className={cx('absolute inset-y-0 left-0 w-[3px]', railTone[issue.severity] || 'bg-slate-300')}
        aria-hidden="true"
      />
      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={issue.severity} withIcon />
            <Badge tone="outline" className="font-mono">
              {issue.passageId || 'Passage'}
            </Badge>
            <Badge>{issue.category}</Badge>
            <Badge tone="indigo">{issue.term}</Badge>
          </div>
          {onToggleReviewed ? (
            <button
              type="button"
              onClick={() => onToggleReviewed(issue.id)}
              title="This note is stored locally and does not change the finding."
              className={cx(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition',
                reviewed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              <CheckCheck className="h-3 w-3" strokeWidth={2.4} />
              {reviewed ? 'Verified by reviewer' : 'Mark as reviewed'}
            </button>
          ) : null}
        </div>

        <div className="mt-3.5 grid gap-2 lg:grid-cols-3">
          <SentenceRow
            label="English source"
            text={issue.sourceSentence}
            needles={needlesFor(issue.sourceSentence)}
            emptyLabel="No single source sentence linked to this finding."
          />
          <SentenceRow
            label="Translation 1"
            text={issue.translation1Sentence}
            needles={needlesFor(issue.translation1Sentence)}
            emptyLabel="No aligned Translation 1 sentence."
          />
          <SentenceRow
            label="Translation 2"
            text={issue.translation2Sentence}
            needles={needlesFor(issue.translation2Sentence)}
            emptyLabel="No aligned Translation 2 sentence."
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
            Detected
          </span>
          {(issue.detected || []).filter(Boolean).length ? (
            (issue.detected || []).filter(Boolean).map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-600"
              >
                {value}
              </span>
            ))
          ) : (
            <span className="text-[11px] italic text-slate-400">
              No verified equivalent detected
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-3">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
          <div>
            <p className="text-[12px] leading-relaxed text-slate-700">{issue.reason}</p>
            {issue.recommendation ? (
              <p className="mt-1 text-[11px] leading-relaxed text-indigo-900/70">
                {issue.recommendation}
              </p>
            ) : null}
          </div>
        </div>

        {issue.severity === 'Review' ? (
          <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-sky-700">
            <Sparkles className="h-3 w-3" strokeWidth={2.2} />
            Ambiguous finding — requires human verification before any change is made.
          </p>
        ) : null}
      </div>
    </article>
  );
}

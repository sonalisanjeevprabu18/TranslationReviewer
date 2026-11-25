import { useMemo, useState } from 'react';
import { Filter, Info, ShieldAlert } from 'lucide-react';
import IssueCard from './IssueCard.jsx';
import { useReviewer } from '../../state/ReviewContext.jsx';
import { severityCounts } from '../../lib/analysis.js';
import { Badge, Card, CardHeader, EmptyState, cx } from '../ui.jsx';

export default function IssuesTab({ analysis }) {
  const { reviewedIssueIds, toggleReviewed } = useReviewer();
  const [severity, setSeverity] = useState('All');

  const counts = severityCounts(analysis.issues);
  const issues = useMemo(
    () =>
      severity === 'All'
        ? analysis.issues
        : analysis.issues.filter((issue) => issue.severity === severity),
    [analysis.issues, severity]
  );

  const options = ['All', 'Critical', 'Warning', 'Review'];

  return (
    <Card>
      <CardHeader
        icon={ShieldAlert}
        title="Inconsistency report"
        description="Each finding links the English source sentence to both translations."
        action={
          <Badge tone="outline">
            {analysis.issues.length} finding{analysis.issues.length === 1 ? '' : 's'}
          </Badge>
        }
      />
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-5 py-3.5">
        <span className="mr-1 flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
          <Filter className="h-3 w-3" strokeWidth={2.2} />
          Severity
        </span>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSeverity(option)}
            className={cx(
              'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition',
              severity === option
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            )}
          >
            {option}
            <span className="ml-1.5 text-[10px] text-slate-400">
              {option === 'All' ? analysis.issues.length : counts[option] || 0}
            </span>
          </button>
        ))}
        <span className="ml-auto text-[10.5px] text-slate-400">
          {reviewedIssueIds.filter((id) =>
            analysis.issues.some((issue) => issue.id === id)
          ).length}{' '}
          marked reviewed
        </span>
      </div>

      <div className="space-y-3 px-4 py-4 sm:px-5">
        {issues.length ? (
          issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={{ ...issue, passageId: issue.passageId || analysis.passageId }}
              reviewed={reviewedIssueIds.includes(issue.id)}
              onToggleReviewed={toggleReviewed}
            />
          ))
        ) : (
          <EmptyState
            icon={ShieldAlert}
            title="No findings at this severity"
            description="Try another severity filter. Findings are evidence to verify, not automatic corrections."
            className="py-10"
          />
        )}
      </div>

      <div className="flex items-start gap-2 border-t border-slate-100 px-5 py-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
        <p className="text-[10.5px] leading-relaxed text-slate-500">
          Critical = meaning or value mismatch · Warning = terminology inconsistency · Review =
          potential ambiguity. Stylistic wording differences are intentionally not flagged.
        </p>
      </div>
    </Card>
  );
}

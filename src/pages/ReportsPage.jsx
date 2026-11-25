import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Download,
  FileSpreadsheet,
  Filter,
  History,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useReviewer } from '../state/ReviewContext.jsx';
import IssueCard from '../components/results/IssueCard.jsx';
import { downloadCsv } from '../lib/csv.js';
import { severityCounts } from '../lib/analysis.js';
import { languageName } from '../lib/termLibrary.js';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  SeverityBadge,
  StatCard,
  cx,
  inputClass,
} from '../components/ui.jsx';

export default function ReportsPage({ navigate }) {
  const { analysis, history, viewAnalysis, reviewedIssueIds, toggleReviewed } = useReviewer();
  const [severity, setSeverity] = useState('All');
  const [search, setSearch] = useState('');

  const review = analysis || history[0] || null;
  const counts = severityCounts(review?.issues || []);

  const issues = useMemo(() => {
    if (!review) return [];
    const query = search.trim().toLowerCase();
    return (review.issues || []).filter((issue) => {
      const matchesSeverity = severity === 'All' || issue.severity === severity;
      const matchesQuery =
        !query ||
        [issue.term, issue.reason, issue.category, issue.sourceSentence, issue.translation1Sentence, issue.translation2Sentence]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      return matchesSeverity && matchesQuery;
    });
  }, [review, severity, search]);

  if (!review) {
    return (
      <Card>
        <EmptyState
          icon={ShieldAlert}
          title="No review reports yet"
          description="Complete a review in the Translation Workspace to generate an inconsistency report you can export."
          action={
            <Button onClick={() => navigate('workspace')}>
              Open Workspace
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Inconsistency reports
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-500">
            Terminology, missing-term and numerical findings for the active review. Every finding
            is evidence for human verification.
          </p>
        </div>
        <Button variant="secondary" onClick={() => downloadCsv(review)}>
          <Download className="h-4 w-4" strokeWidth={2.2} />
          Export active review
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="indigo">{languageName(review.targetLanguage)}</Badge>
              <Badge tone="outline" className="font-mono">
                {review.passageId}
              </Badge>
              <Badge tone="outline">
                {new Date(review.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Badge>
            </div>
            <h3 className="mt-2 text-[16px] font-semibold text-slate-900">{review.title}</h3>
            <p className="mt-1 max-w-2xl text-[11.5px] leading-relaxed text-slate-500">
              {review.metrics?.consistencyPct ?? 0}% term consistency ·{' '}
              {review.metrics?.terms ?? 0} terms extracted ·{' '}
              {review.metrics?.numericMismatches ?? 0} numerical findings
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <SeverityBadge severity="Critical" withIcon />
            <span className="self-center text-[12px] font-semibold text-slate-900">
              {counts.Critical}
            </span>
            <SeverityBadge severity="Warning" withIcon />
            <span className="self-center text-[12px] font-semibold text-slate-900">
              {counts.Warning}
            </span>
            <SeverityBadge severity="Review" withIcon />
            <span className="self-center text-[12px] font-semibold text-slate-900">
              {counts.Review}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileSpreadsheet}
          label="Flagged findings"
          value={review.issues.length}
          hint="Across all categories"
        />
        <StatCard
          icon={ShieldAlert}
          label="Critical"
          value={counts.Critical}
          hint="Meaning or value mismatch"
          accent="rose"
        />
        <StatCard
          icon={History}
          label="Human review"
          value={counts.Review}
          hint="Ambiguous findings to verify"
          accent="sky"
        />
        <StatCard
          icon={Filter}
          label="Marked reviewed"
          value={reviewedIssueIds.filter((id) => review.issues.some((issue) => issue.id === id)).length}
          hint="Local reviewer notes"
          accent="emerald"
        />
      </div>

      <Card>
        <CardHeader
          icon={Search}
          title="Findings"
          description="Filter by severity or search the evidence."
          action={<Badge tone="outline">{issues.length} shown</Badge>}
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center">
          <div className="relative lg:max-w-md lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className={cx(inputClass, 'pl-9')}
              placeholder="Search term, sentence or explanation…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search findings"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Critical', 'Warning', 'Review'].map((option) => (
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
                  {option === 'All' ? review.issues.length : counts[option] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3 px-4 py-4 sm:px-5">
          {issues.length ? (
            issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={{ ...issue, passageId: issue.passageId || review.passageId }}
                reviewed={reviewedIssueIds.includes(issue.id)}
                onToggleReviewed={toggleReviewed}
              />
            ))
          ) : (
            <EmptyState
              icon={Search}
              title="No findings match"
              description="Clear the search or choose another severity."
              className="py-10"
            />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={History}
          title="Review history"
          description="Saved locally in this browser."
          action={<Badge tone="outline">{history.length} runs</Badge>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.07em] text-slate-500">
                <th className="px-5 py-2.5 font-semibold">Passage</th>
                <th className="px-4 py-2.5 font-semibold">Language</th>
                <th className="px-4 py-2.5 font-semibold">Reviewed</th>
                <th className="px-4 py-2.5 font-semibold">Consistency</th>
                <th className="px-4 py-2.5 font-semibold">Findings</th>
                <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-medium text-slate-900">{entry.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">{entry.passageId}</p>
                  </td>
                  <td className="px-4 py-3 text-[11.5px] text-slate-600">
                    {languageName(entry.targetLanguage)}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">
                    {new Date(entry.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] font-semibold text-slate-900">
                      {entry.metrics?.consistencyPct ?? 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {entry.metrics?.critical ? (
                        <Badge tone="critical">{entry.metrics.critical}</Badge>
                      ) : null}
                      {entry.metrics?.warning ? (
                        <Badge tone="warning">{entry.metrics.warning}</Badge>
                      ) : null}
                      {entry.metrics?.review ? (
                        <Badge tone="review">{entry.metrics.review}</Badge>
                      ) : null}
                      {!entry.metrics?.totalIssues ? <Badge tone="success">Clean</Badge> : null}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCsv(entry)}
                        aria-label={`Export ${entry.passageId}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          viewAnalysis(entry);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-[10.5px] leading-relaxed text-slate-400">
            CSV columns: Passage ID, original technical term, translation equivalents, consistency
            status, numerical mismatches, issue explanation and severity.
          </p>
        </div>
      </Card>
    </div>
  );
}

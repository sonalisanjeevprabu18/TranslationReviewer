import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Clock3,
  Database,
  FileSpreadsheet,
  FlaskConical,
  Languages,
  PenLine,
  PlayCircle,
  ShieldAlert,
  Sigma,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useReviewer } from '../state/ReviewContext.jsx';
import { aggregateHistory } from '../lib/analysis.js';
import { languageName } from '../lib/termLibrary.js';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ProgressBar,
  SeverityBadge,
  StatCard,
  cx,
} from '../components/ui.jsx';

const WORKFLOW_STEPS = [
  {
    icon: Database,
    title: 'Select a sample passage',
    detail: 'Choose a FLORES-200 devtest passage or paste your own English source.',
  },
  {
    icon: PenLine,
    title: 'Add two team translations',
    detail: 'Add two translated versions to compare, or request one from the free API.',
  },
  {
    icon: Workflow,
    title: 'Run the rule-based review',
    detail: 'Extract terminology, compare verified variants and validate numeric tokens.',
  },
  {
    icon: ClipboardList,
    title: 'Review and verify findings',
    detail: 'Check glossary status, flagged sentences and human-review items.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Export the review report',
    detail: 'Download a structured CSV with terms, values, reasons and severity.',
  },
];

export default function Dashboard({ navigate }) {
  const { history, selectedIds, dataset, loadSample, viewAnalysis } = useReviewer();
  const stats = aggregateHistory(history);
  const latest = history[0] || null;
  const flagged = stats.critical + stats.warning + stats.review;
  const language = latest ? languageName(latest.targetLanguage) : null;

  const openHistory = (entry) => {
    viewAnalysis(entry);
    navigate('workspace');
  };

  const runSample = () => {
    loadSample('FLORES-159-162');
    navigate('workspace');
  };

  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden border-indigo-100 bg-gradient-to-br from-white via-white to-indigo-50/80 p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-100/70 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge tone="indigo">
              <Sparkles className="h-3 w-3" strokeWidth={2.2} />
              Educational translation QA
            </Badge>
            <h1 className="mt-3 text-[28px] font-semibold leading-[1.12] tracking-tight text-slate-900 sm:text-[33px]">
              EduTerm Reviewer
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Ensuring consistency and accuracy in multilingual educational content.
            </p>
            <p className="mt-3 max-w-xl text-[12.5px] leading-relaxed text-slate-500">
              Review team translations against an English source, protect technical terminology
              and numeric values, and export a structured review report.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <Button size="lg" onClick={() => navigate('dataset')}>
                Start New Review
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('workspace')}>
                Open Workspace
              </Button>
              <button
                type="button"
                onClick={runSample}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-indigo-600 hover:text-indigo-800"
              >
                <PlayCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
                Run the Mars sample
              </button>
            </div>
          </div>

          <div className="w-full max-w-[330px] rounded-2xl border border-slate-200/90 bg-white/85 p-4 shadow-[0_8px_24px_-16px_rgba(30,41,59,0.3)] backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-medium text-slate-600">Latest review quality</span>
              {language ? <Badge tone="indigo">{language}</Badge> : <Badge>No runs yet</Badge>}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-[34px] font-semibold leading-none tracking-tight text-slate-900">
                {latest?.metrics?.consistencyPct ?? 0}%
              </span>
              <span className="pb-1 text-[11.5px] text-slate-500">term consistency</span>
            </div>
            <ProgressBar value={latest?.metrics?.consistencyPct ?? 0} className="mt-3" />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Critical', value: latest?.metrics?.critical ?? 0, tone: 'text-rose-600' },
                { label: 'Warning', value: latest?.metrics?.warning ?? 0, tone: 'text-amber-600' },
                { label: 'Review', value: latest?.metrics?.review ?? 0, tone: 'text-sky-600' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-50 py-2">
                  <p className={cx('text-[15px] font-semibold', item.tone)}>{item.value}</p>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[10.5px] text-slate-400">
              <FlaskConical className="h-3 w-3" strokeWidth={2} />
              FLORES-200 · deterministic rules
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Database}
          label="Sample passages selected"
          value={selectedIds.length}
          hint={`${dataset.length} available in the passage library`}
          accent="indigo"
        />
        <StatCard
          icon={Languages}
          label="Translations reviewed"
          value={stats.translations}
          hint={`${stats.reviews} completed review run${stats.reviews === 1 ? '' : 's'}`}
          accent="slate"
        />
        <StatCard
          icon={BookOpen}
          label="Technical terms extracted"
          value={stats.uniqueTerms}
          hint="Matched against the verified term library"
          accent="emerald"
        />
        <StatCard
          icon={ShieldAlert}
          label="Terminology inconsistencies"
          value={stats.terminologyIssues}
          hint="Variant mismatches and missing terms"
          accent="amber"
        />
        <StatCard
          icon={Sigma}
          label="Numerical mismatches"
          value={stats.numericMismatches}
          hint="Changed, missing or unit-altered values"
          accent="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.12fr_1fr]">
        <Card>
          <CardHeader
            icon={Workflow}
            title="How the review works"
            description="Every run follows the same five deterministic steps."
            action={<Badge tone="outline">5 steps</Badge>}
          />
          <div className="px-5 py-4">
            <ol className="relative space-y-4">
              <span
                className="absolute left-[15px] top-2 h-[calc(100%-24px)] w-px bg-slate-200"
                aria-hidden="true"
              />
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="relative flex gap-3">
                    <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-[12.5px] font-medium text-slate-900">
                        <span className="mr-1.5 text-[10.5px] font-semibold text-indigo-500">
                          0{index + 1}
                        </span>
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
              <p className="text-[11.5px] leading-relaxed text-indigo-900/80">
                The engine does not generate or rewrite translations. It only flags what a human
                reviewer should verify.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={Clock3}
            title="Recent review history"
            description="Saved locally in this browser."
            action={
              history.length ? (
                <Button variant="ghost" size="sm" onClick={() => navigate('reports')}>
                  All reports
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : null
            }
          />
          {history.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No reviews yet"
              description="Load a FLORES-200 sample and run the review to populate your history."
              action={
                <Button size="sm" onClick={runSample}>
                  <PlayCircle className="h-3.5 w-3.5" />
                  Load Mars sample
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.slice(0, 5).map((entry) => (
                <li key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-slate-900">
                      {entry.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="font-mono text-[10px] text-slate-400">
                        {entry.passageId}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{languageName(entry.targetLanguage)}</span>
                      <span className="text-slate-300">·</span>
                      <span>
                        {new Date(entry.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {entry.metrics?.critical ? (
                        <SeverityBadge severity="Critical" />
                      ) : null}
                      {entry.metrics?.warning ? <SeverityBadge severity="Warning" /> : null}
                      {entry.metrics?.review ? <SeverityBadge severity="Review" /> : null}
                      <span className="text-[10.5px] text-slate-400">
                        {entry.metrics?.totalIssues ?? 0} flagged ·{' '}
                        {entry.metrics?.consistencyPct ?? 0}% consistent
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openHistory(entry)}
                    className="shrink-0"
                  >
                    Open
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={ShieldAlert}
          title="Translation quality overview"
          description="Aggregated severity across all saved review runs."
          action={<Badge tone="outline">Based on {stats.reviews} runs</Badge>}
        />
        <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {[
              {
                severity: 'Critical',
                label: 'Meaning or value mismatch',
                count: stats.critical,
                bar: 'bg-rose-500',
              },
              {
                severity: 'Warning',
                label: 'Terminology inconsistency',
                count: stats.warning,
                bar: 'bg-amber-500',
              },
              {
                severity: 'Review',
                label: 'Ambiguity needing a human check',
                count: stats.review,
                bar: 'bg-sky-500',
              },
            ].map((row) => (
              <div key={row.severity}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={row.severity} />
                    <span className="text-[11.5px] text-slate-500">{row.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-slate-900">{row.count}</span>
                </div>
                <ProgressBar
                  value={flagged ? (row.count / flagged) * 100 : 0}
                  tone={row.bar}
                  className="h-1.5"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                Average consistency
              </p>
              <p className="mt-1.5 text-[24px] font-semibold leading-none text-slate-900">
                {stats.avgConsistency}%
              </p>
              <p className="mt-1.5 text-[10.5px] leading-snug text-slate-500">
                Share of extracted terms with identical verified equivalents.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-slate-400">
                Flagged findings
              </p>
              <p className="mt-1.5 text-[24px] font-semibold leading-none text-slate-900">
                {flagged}
              </p>
              <p className="mt-1.5 text-[10.5px] leading-snug text-slate-500">
                Across terminology and numerical checks.
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] font-medium text-slate-700">Human review queue</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {stats.review} finding{stats.review === 1 ? '' : 's'} marked{' '}
                <span className="font-medium text-sky-700">Review</span> need a subject expert.
                The engine never rewrites or corrects the translation.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

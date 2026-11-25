import {
  BookOpen,
  Check,
  FileText,
  Flag,
  Info,
  Languages,
  ListChecks,
  Percent,
  ShieldAlert,
  Sigma,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardHeader,
  ProgressBar,
  SeverityBadge,
  StatCard,
  cx,
} from '../ui.jsx';

const severityRows = [
  {
    severity: 'Critical',
    label: 'Meaning or value mismatch',
    description: 'Numeric values or technical meaning may have changed.',
    bar: 'bg-rose-500',
  },
  {
    severity: 'Warning',
    label: 'Terminology inconsistency',
    description: 'Verified equivalents differ between the two translations.',
    bar: 'bg-amber-500',
  },
  {
    severity: 'Review',
    label: 'Human verification needed',
    description: 'Ambiguous, unverified or missing terminology.',
    bar: 'bg-sky-500',
  },
];

export default function SummaryTab({ analysis }) {
  const { metrics, glossary, numeric } = analysis;
  const consistent = glossary.filter((entry) => entry.consistency === 'Consistent').length;
  const inconsistent = glossary.filter((entry) => entry.consistency === 'Inconsistent').length;
  const needsReview = glossary.filter((entry) => entry.consistency === 'Needs Review').length;
  const verifiedVariants = glossary.filter((entry) => entry.variants?.length).length;

  const checks = [
    { icon: BookOpen, label: 'Technical terms extracted', value: metrics.terms },
    { icon: Languages, label: 'Terms with a verified mapping', value: verifiedVariants },
    { icon: Sigma, label: 'Numeric source values checked', value: metrics.numericChecks },
    { icon: Flag, label: 'Findings flagged for review', value: metrics.totalIssues },
    { icon: FileText, label: 'Translations compared', value: analysis.translations.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Passages reviewed"
          value={metrics.passages}
          hint={`${analysis.translations.length} team translations compared`}
        />
        <StatCard
          icon={BookOpen}
          label="Terms extracted"
          value={metrics.terms}
          hint={`${consistent} consistent · ${inconsistent} inconsistent`}
          accent="emerald"
        />
        <StatCard
          icon={Percent}
          label="Term consistency"
          value={`${metrics.consistencyPct}%`}
          hint="Identical verified equivalents in both translations"
          accent="indigo"
        />
        <StatCard
          icon={ShieldAlert}
          label="Total flagged issues"
          value={metrics.totalIssues}
          hint={`${metrics.critical} critical · ${metrics.warning} warning · ${metrics.review} review`}
          accent="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <Card>
          <CardHeader
            icon={ShieldAlert}
            title="Findings by severity"
            description="How the flagged evidence is distributed."
            action={<Badge tone="outline">{metrics.totalIssues} total</Badge>}
          />
          <div className="space-y-4 px-5 py-4">
            {severityRows.map((row) => {
              const count = metrics[row.severity.toLowerCase()] || 0;
              return (
                <div key={row.severity}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={row.severity} />
                      <span className="text-[11.5px] text-slate-600">{row.label}</span>
                    </div>
                    <span className="text-[13px] font-semibold text-slate-900">{count}</span>
                  </div>
                  <ProgressBar
                    value={metrics.totalIssues ? (count / metrics.totalIssues) * 100 : 0}
                    tone={row.bar}
                    className="mt-2 h-1.5"
                  />
                  <p className="mt-1 text-[10.5px] text-slate-400">{row.description}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={ListChecks}
            title="Checks performed"
            description="Each check is deterministic and repeatable."
          />
          <ul className="divide-y divide-slate-100">
            {checks.map((check) => {
              const Icon = check.icon;
              return (
                <li key={check.label} className="flex items-center gap-3 px-5 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
                  </span>
                  <Icon className="hidden h-3.5 w-3.5 text-slate-400 sm:block" strokeWidth={2} />
                  <span className="flex-1 text-[12px] text-slate-600">{check.label}</span>
                  <span className="text-[12px] font-semibold text-slate-900">{check.value}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader
            icon={BookOpen}
            title="Glossary health"
            description="Status of every extracted technical term."
          />
          <div className="space-y-3 px-5 py-4">
            <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
              <span
                className="bg-emerald-500"
                style={{ width: `${metrics.terms ? (consistent / metrics.terms) * 100 : 0}%` }}
              />
              <span
                className="bg-amber-500"
                style={{ width: `${metrics.terms ? (inconsistent / metrics.terms) * 100 : 0}%` }}
              />
              <span
                className="bg-sky-400"
                style={{ width: `${metrics.terms ? (needsReview / metrics.terms) * 100 : 0}%` }}
              />
            </div>
            <ul className="space-y-2">
              {[
                { label: 'Consistent', value: consistent, dot: 'bg-emerald-500' },
                { label: 'Inconsistent', value: inconsistent, dot: 'bg-amber-500' },
                { label: 'Needs Review', value: needsReview, dot: 'bg-sky-400' },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <span className={cx('h-2 w-2 rounded-full', item.dot)} />
                  <span className="flex-1 text-[12px] text-slate-600">{item.label}</span>
                  <span className="text-[12px] font-semibold text-slate-900">{item.value}</span>
                </li>
              ))}
            </ul>
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-[10.5px] leading-relaxed text-slate-500">
              {numeric.rows.length} numeric source value
              {numeric.rows.length === 1 ? '' : 's'} validated · {metrics.numericMismatches}{' '}
              numerical finding{metrics.numericMismatches === 1 ? '' : 's'}.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={Info}
            title="Scope and limitations"
            description="What this review can and cannot prove."
          />
          <ul className="space-y-2.5 px-5 py-4">
            {analysis.limitations.map((limitation) => (
              <li key={limitation} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                <span className="text-[11.5px] leading-relaxed text-slate-500">{limitation}</span>
              </li>
            ))}
          </ul>
          <div className="mx-5 mb-4 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3.5 py-3">
            <p className="text-[11px] leading-relaxed text-amber-900/80">
              <span className="font-semibold">Wording differences are not errors.</span> A flag
              means the evidence needs a human decision — the engine never replaces a technical
              term or a numeric value.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

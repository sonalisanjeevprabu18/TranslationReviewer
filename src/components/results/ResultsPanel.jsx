import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCheck,
  Download,
  Gauge,
  ShieldAlert,
  Sigma,
} from 'lucide-react';
import SummaryTab from './SummaryTab.jsx';
import GlossaryTab from './GlossaryTab.jsx';
import IssuesTab from './IssuesTab.jsx';
import NumbersTab from './NumbersTab.jsx';
import MetricsTab from './MetricsTab.jsx';
import { downloadCsv } from '../../lib/csv.js';
import { languageName } from '../../lib/termLibrary.js';
import { Badge, Button, Card, cx } from '../ui.jsx';

const TABS = [
  { id: 'summary', label: 'Review Summary', icon: BarChart3 },
  { id: 'glossary', label: 'Terminology Glossary', icon: BookOpen },
  { id: 'issues', label: 'Inconsistency Report', icon: ShieldAlert },
  { id: 'numbers', label: 'Numerical Validation', icon: Sigma },
  { id: 'metrics', label: 'Quality Metrics', icon: Gauge },
];

export default function ResultsPanel({ analysis }) {
  const [tab, setTab] = useState('summary');
  const [exported, setExported] = useState(false);

  if (!analysis) return null;

  const { metrics } = analysis;
  const failedValues = (analysis.numeric?.rows || []).filter((row) => row.status === 'fail').length;

  const tabCounts = {
    summary: metrics.totalIssues,
    glossary: analysis.glossary.length,
    issues: metrics.totalIssues,
    numbers: analysis.numeric?.rows.length || 0,
    metrics: analysis.issues.length,
  };

  const handleExport = () => {
    if (downloadCsv(analysis)) {
      setExported(true);
      window.setTimeout(() => setExported(false), 2200);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone="success">
                <CheckCheck className="h-3 w-3" strokeWidth={2.6} />
                Analysis complete
              </Badge>
              <Badge tone="outline" className="font-mono">
                {analysis.passageId}
              </Badge>
              <Badge tone="indigo">{languageName(analysis.targetLanguage)}</Badge>
              <Badge tone="outline">Rule-based</Badge>
            </div>
            <h2 className="mt-2 text-[18px] font-semibold tracking-tight text-slate-900">
              {analysis.title}
            </h2>
            <p className="mt-1 text-[11.5px] text-slate-500">
              {new Date(analysis.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · {analysis.translations.length} team translations · {analysis.glossary.length}{' '}
              terms · {failedValues} numeric mismatch{failedValues === 1 ? '' : 'es'}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2.5 sm:items-end">
            <Button onClick={handleExport} variant={exported ? 'soft' : 'primary'}>
              <Download className="h-4 w-4" strokeWidth={2.2} />
              {exported ? 'CSV downloaded' : 'Export CSV report'}
            </Button>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="critical">{metrics.critical} Critical</Badge>
              <Badge tone="warning">{metrics.warning} Warning</Badge>
              <Badge tone="review">{metrics.review} Review</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3">
          {TABS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cx(
                  'relative inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-[12px] font-medium transition',
                  active
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                {item.label}
                <span
                  className={cx(
                    'rounded-full px-1.5 py-0.5 text-[10px]',
                    active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tabCounts[item.id]}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <div key={tab} className="animate-fade-up">
        {tab === 'summary' ? <SummaryTab analysis={analysis} /> : null}
        {tab === 'glossary' ? <GlossaryTab analysis={analysis} /> : null}
        {tab === 'issues' ? <IssuesTab analysis={analysis} /> : null}
        {tab === 'numbers' ? <NumbersTab analysis={analysis} /> : null}
        {tab === 'metrics' ? <MetricsTab analysis={analysis} /> : null}
      </div>
    </div>
  );
}

import { BookOpen } from 'lucide-react';
import { Badge, ConsistencyBadge, EmptyState } from './ui.jsx';

export default function GlossaryTable({
  entries = [],
  emptyTitle = 'No terms to display',
  emptyDescription = 'Run a review or adjust the search filters to see glossary entries.',
}) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.07em] text-slate-500">
            <th className="px-5 py-2.5 font-semibold">English term</th>
            <th className="px-4 py-2.5 font-semibold">Translation 1</th>
            <th className="px-4 py-2.5 font-semibold">Translation 2</th>
            <th className="px-4 py-2.5 text-center font-semibold">Frequency</th>
            <th className="px-5 py-2.5 font-semibold">Consistency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <tr key={entry.id} className="align-top transition hover:bg-slate-50/60">
              <td className="px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[12.5px] font-medium text-slate-900">{entry.english}</span>
                  {entry.domain ? <Badge tone="outline">{entry.domain}</Badge> : null}
                </div>
                {entry.definition ? (
                  <p className="mt-1 max-w-[280px] text-[11px] leading-relaxed text-slate-500">
                    {entry.definition}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3.5">
                {entry.translation1 ? (
                  <span className="text-[13px] font-medium leading-relaxed text-slate-800">
                    {entry.translation1}
                  </span>
                ) : (
                  <span className="text-[11px] italic text-slate-400">
                    {entry.variants?.length ? 'Not detected' : 'No verified mapping'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5">
                {entry.translation2 ? (
                  <span className="text-[13px] font-medium leading-relaxed text-slate-800">
                    {entry.translation2}
                  </span>
                ) : (
                  <span className="text-[11px] italic text-slate-400">
                    {entry.variants?.length ? 'Not detected' : 'No verified mapping'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5 text-center">
                <span className="inline-flex min-w-8 items-center justify-center rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                  {entry.frequency}×
                </span>
              </td>
              <td className="px-5 py-3.5">
                <ConsistencyBadge status={entry.consistency} />
                <p className="mt-1.5 max-w-[220px] text-[10.5px] leading-relaxed text-slate-400">
                  {entry.note}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

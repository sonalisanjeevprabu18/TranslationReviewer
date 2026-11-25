import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import GlossaryTable from '../GlossaryTable.jsx';
import { Badge, Card, CardHeader, cx, inputClass } from '../ui.jsx';
import { languageName } from '../../lib/termLibrary.js';

const FILTERS = ['All', 'Consistent', 'Inconsistent', 'Needs Review'];

export default function GlossaryTab({ analysis }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (analysis.glossary || []).filter((entry) => {
      const matchesStatus = status === 'All' || entry.consistency === status;
      const matchesQuery =
        !query ||
        entry.english.toLowerCase().includes(query) ||
        entry.translation1.toLowerCase().includes(query) ||
        entry.translation2.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [analysis.glossary, search, status]);

  const counts = {
    All: analysis.glossary.length,
    Consistent: analysis.glossary.filter((entry) => entry.consistency === 'Consistent').length,
    Inconsistent: analysis.glossary.filter((entry) => entry.consistency === 'Inconsistent').length,
    'Needs Review': analysis.glossary.filter((entry) => entry.consistency === 'Needs Review').length,
  };

  return (
    <Card>
      <CardHeader
        icon={Search}
        title="Multilingual terminology glossary"
        description={`Extracted educational terms with verified ${languageName(
          analysis.targetLanguage
        )} equivalents. Unmapped terms are never invented.`}
        action={<Badge tone="outline">{entries.length} shown</Badge>}
      />
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            className={cx(inputClass, 'pl-9')}
            placeholder="Search English term or translated equivalent…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search glossary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              className={cx(
                'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition',
                status === filter
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
              )}
            >
              {filter}
              <span className="ml-1.5 text-[10px] text-slate-400">{counts[filter]}</span>
            </button>
          ))}
        </div>
      </div>
      <GlossaryTable
        entries={entries}
        emptyTitle="No glossary entries match"
        emptyDescription="Adjust the search text or status filter."
      />
      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-[10.5px] leading-relaxed text-slate-400">
          Frequency counts occurrences in the English source passage. “Needs Review” means the
          term library has no verified equivalent — not that the translation is wrong.
        </p>
      </div>
    </Card>
  );
}

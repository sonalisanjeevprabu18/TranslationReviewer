import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Layers, Library, Search, ShieldCheck } from 'lucide-react';
import { useReviewer } from '../state/ReviewContext.jsx';
import GlossaryTab from '../components/results/GlossaryTab.jsx';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  cx,
  inputClass,
} from '../components/ui.jsx';
import {
  LANGUAGES,
  TERM_DOMAINS,
  TERM_LIBRARY,
  languageName,
} from '../lib/termLibrary.js';

function CrossPassageTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.07em] text-slate-500">
            <th className="px-5 py-2.5 font-semibold">English term</th>
            <th className="px-4 py-2.5 font-semibold">Language</th>
            <th className="px-4 py-2.5 font-semibold">Variants observed</th>
            <th className="px-4 py-2.5 font-semibold">Passages</th>
            <th className="px-5 py-2.5 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={`${row.term}-${row.lang}`} className="align-top hover:bg-slate-50/60">
              <td className="px-5 py-3 text-[12.5px] font-medium text-slate-900">{row.term}</td>
              <td className="px-4 py-3 text-[11.5px] text-slate-600">
                {languageName(row.lang)}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {row.variants.map((variant) => (
                    <span
                      key={variant}
                      className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-700"
                    >
                      {variant}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-[10.5px] text-slate-500">
                  {row.passages.join(', ')}
                </span>
              </td>
              <td className="px-5 py-3">
                {row.variants.length > 1 ? (
                  <Badge tone="warning">Mixed usage</Badge>
                ) : (
                  <Badge tone="success">
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
                    Stable
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GlossaryPage({ navigate }) {
  const { analysis, history } = useReviewer();
  const [librarySearch, setLibrarySearch] = useState('');
  const [domain, setDomain] = useState('All');

  const crossRows = useMemo(() => {
    const map = new Map();
    history.forEach((run) => {
      (run.glossary || []).forEach((entry) => {
        const key = `${entry.english}::${run.targetLanguage}`;
        const row =
          map.get(key) || {
            term: entry.english,
            lang: run.targetLanguage,
            variants: new Set(),
            passages: new Set(),
          };
        [entry.translation1, entry.translation2].filter(Boolean).forEach((value) => {
          row.variants.add(value);
        });
        row.passages.add(run.passageId);
        map.set(key, row);
      });
    });
    return [...map.values()]
      .map((row) => ({
        term: row.term,
        lang: row.lang,
        variants: [...row.variants],
        passages: [...row.passages],
      }))
      .filter((row) => row.variants.length)
      .sort((a, b) => b.variants.length - a.variants.length || a.term.localeCompare(b.term))
      .slice(0, 12);
  }, [history]);

  const libraryTerms = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    return TERM_LIBRARY.filter((term) => {
      const matchesDomain = domain === 'All' || term.domain === domain;
      const matchesQuery =
        !query ||
        term.en.toLowerCase().includes(query) ||
        term.definition.toLowerCase().includes(query) ||
        LANGUAGES.some((language) =>
          (term.variants?.[language.code] || []).some((variant) =>
            variant.toLowerCase().includes(query)
          )
        );
      return matchesDomain && matchesQuery;
    });
  }, [librarySearch, domain]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Terminology glossary
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-500">
            Verified Tamil, Hindi, Kannada, Telugu and Malayalam equivalents for the scientific
            and technical terms in the FLORES-200 passage set. Unmapped terms are reported as
            “Needs Review”, never invented.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="indigo">{TERM_LIBRARY.length} verified terms</Badge>
          <Badge tone="outline">5 languages</Badge>
        </div>
      </div>

      {analysis ? (
        <GlossaryTab analysis={analysis} />
      ) : (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="No active review glossary"
            description="Run a review in the Translation Workspace to generate a glossary for your passage. The verified term library is available below."
            action={
              <Button onClick={() => navigate('workspace')}>
                Open Workspace
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Button>
            }
          />
        </Card>
      )}

      <Card>
        <CardHeader
          icon={Layers}
          title="Terminology consistency across reviewed passages"
          description="Variant usage recorded in this browser's review history."
          action={<Badge tone="outline">{history.length} runs</Badge>}
        />
        {crossRows.length ? (
          <>
            <CrossPassageTable rows={crossRows} />
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-[10.5px] leading-relaxed text-slate-400">
                “Mixed usage” means the same English term was rendered with more than one verified
                equivalent across reviews. This is evidence for a curriculum-level terminology
                decision, not proof of an error.
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Layers}
            title="Not enough review history yet"
            description="Run at least one review to start comparing terminology across passages."
            className="py-10"
          />
        )}
      </Card>

      <Card>
        <CardHeader
          icon={Library}
          title="Verified multilingual term library"
          description="Curated mappings in five languages, used by the deterministic matcher."
          action={<Badge tone="outline">{libraryTerms.length} terms</Badge>}
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3.5 lg:flex-row lg:items-center">
          <div className="relative lg:max-w-sm lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              className={cx(inputClass, 'pl-9')}
              placeholder="Search terms or any language…"
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
              aria-label="Search verified term library"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['All', ...TERM_DOMAINS].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDomain(item)}
                className={cx(
                  'rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition',
                  domain === item
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {libraryTerms.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-[0.07em] text-slate-500">
                  <th className="sticky left-0 bg-slate-50/95 px-5 py-2.5 font-semibold">
                    English term
                  </th>
                  {LANGUAGES.map((language) => (
                    <th key={language.code} className="px-3 py-2.5 font-semibold">
                      {language.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {libraryTerms.map((term) => (
                  <tr key={term.en} className="align-top hover:bg-slate-50/60">
                    <td className="sticky left-0 bg-white px-5 py-3">
                      <p className="text-[12.5px] font-medium text-slate-900">{term.en}</p>
                      <p className="mt-0.5 max-w-[240px] text-[10.5px] leading-relaxed text-slate-500">
                        {term.definition}
                      </p>
                      <Badge tone="outline" className="mt-1.5">
                        {term.domain}
                      </Badge>
                    </td>
                    {LANGUAGES.map((language) => {
                      const variants = term.variants?.[language.code] || [];
                      return (
                        <td key={language.code} className="px-3 py-3">
                          {variants.length ? (
                            <span className="text-[11.5px] leading-relaxed text-slate-700">
                              {variants.join(' / ')}
                            </span>
                          ) : (
                            <span className="text-[10.5px] italic text-amber-600">
                              Needs Review
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Library}
            title="No library terms match"
            description="Try a different search term or domain."
            className="py-10"
          />
        )}

        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-[10.5px] leading-relaxed text-slate-400">
            Variants are taken from the published FLORES reference for each language and standard
            equivalents. “Needs Review” means no reliable mapping was supplied — the tool does not
            invent one.
          </p>
        </div>
      </Card>
    </div>
  );
}

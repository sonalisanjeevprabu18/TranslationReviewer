import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Database,
  Info,
  Lightbulb,
  PenLine,
  Plus,
  Upload,
} from 'lucide-react';
import { useReviewer } from '../state/ReviewContext.jsx';
import { LANGUAGES, languageNative } from '../lib/termLibrary.js';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  cx,
  inputClass,
  labelClass,
  textareaClass,
} from '../components/ui.jsx';

const topicTone = {
  'Space science': 'indigo',
  Climate: 'success',
  'Earth science': 'review',
  Custom: 'neutral',
};

function SampleCard({ passage, language, selected, onToggle, onOpen }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={topicTone[passage.topic] || 'neutral'}>{passage.topic}</Badge>
            {passage.isSample ? (
              <Badge tone="outline">FLORES-200</Badge>
            ) : (
              <Badge tone="indigo">Team supplied</Badge>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={selected}
            className={cx(
              'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-medium transition',
              selected
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
            )}
          >
            <span
              className={cx(
                'flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border',
                selected ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-300'
              )}
            >
              {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
            </span>
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">
          {passage.id}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
          {passage.title}
        </h3>
        <p className="mt-1 text-[11px] text-slate-500">
          {passage.level} · English → {languageNative(language)} ({language})
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            English source
          </p>
          <p className="line-clamp-4 text-[12px] leading-relaxed text-slate-600">
            {passage.source}
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <PenLine className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
          Published reference + alternate version ·{' '}
          {passage.languages?.length || 0} languages
        </div>

        {passage.expected ? (
          <div className="mt-3 flex gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" strokeWidth={2} />
            <p className="text-[11px] leading-relaxed text-indigo-900/80">
              <span className="font-medium">Expected findings: </span>
              {passage.expected}
            </p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/40 px-4 py-3">
        {passage.sourceUrl ? (
          <a
            href={passage.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate text-[10.5px] text-slate-400 transition hover:text-indigo-600"
          >
            FLORES-200 devtest · source article
          </a>
        ) : (
          <span className="text-[10.5px] text-slate-400">Added by your team</span>
        )}
        <Button size="sm" variant="soft" onClick={onOpen}>
          Open in Workspace
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
        </Button>
      </div>
    </Card>
  );
}

export default function DatasetPage({ navigate }) {
  const { dataset, selectedIds, toggleSelect, addCustomPassage, openPassageInWorkspace } =
    useReviewer();

  const [form, setForm] = useState({
    title: '',
    targetLanguage: 'ta',
    source: '',
    translation1: '',
    translation2: '',
  });
  const [formError, setFormError] = useState('');
  const [libraryLanguage, setLibraryLanguage] = useState('ta');

  const update = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setFormError('');
  };

  const addPassage = (event) => {
    event.preventDefault();
    if (form.source.trim().length < 20) {
      setFormError('Add an English source passage of at least 20 characters.');
      return;
    }
    const passage = {
      id: `CUSTOM-${String(Date.now()).slice(-6)}`,
      title: form.title.trim() || 'Team source passage',
      topic: 'Custom',
      level: 'Team supplied',
      sourceLanguage: 'English',
      targetLanguage: form.targetLanguage,
      source: form.source.trim(),
      translations: [
        { label: 'Team Translation 1', author: 'Team A', text: form.translation1.trim() },
        { label: 'Team Translation 2', author: 'Team B', text: form.translation2.trim() },
      ],
      expected: null,
      isSample: false,
    };
    addCustomPassage(passage);
    openPassageInWorkspace(passage);
    navigate('workspace');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            FLORES-200 passage library
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-500">
            Choose a FLORES-200 devtest passage, then open it in the Translation Workspace to add
            or adjust translations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="library-language" className="sr-only">
            Reference language
          </label>
          <select
            id="library-language"
            className={`${inputClass} w-auto py-1.5 text-[11.5px]`}
            value={libraryLanguage}
            onChange={(event) => setLibraryLanguage(event.target.value)}
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                Open in {language.name} — {language.native}
              </option>
            ))}
          </select>
          <Badge tone="indigo">
            <Database className="h-3 w-3" strokeWidth={2.2} />
            {selectedIds.length} selected
          </Badge>
          <Badge tone="outline">{dataset.length} passages</Badge>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" strokeWidth={2} />
        <p className="text-[11.5px] leading-relaxed text-indigo-900/80">
          <span className="font-semibold">
            FLORES-200 devtest, English → Tamil, Hindi, Kannada, Telugu and Malayalam.
          </span>{' '}
          Source sentences are real FLORES records. Translation 1 is the published FLORES
          reference for the language you pick; Translation 2 is an alternate version prepared for
          comparison. Quotation marks are normalised for display.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dataset.map((passage) => (
          <SampleCard
            key={passage.id}
            passage={passage}
            language={libraryLanguage}
            selected={selectedIds.includes(passage.id)}
            onToggle={() => toggleSelect(passage.id)}
            onOpen={() => {
              openPassageInWorkspace(passage, libraryLanguage);
              navigate('workspace');
            }}
          />
        ))}
      </div>

      <Card id="custom-passage">
        <CardHeader
          icon={Upload}
          title="Add your own original passage"
          description="Paste an English source and, optionally, two team translations. It is added to the local library only."
          action={<Badge tone="outline">Local only</Badge>}
        />
        <form onSubmit={addPassage} className="space-y-4 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <label className={labelClass} htmlFor="custom-title">
                Passage title
              </label>
              <input
                id="custom-title"
                className={`${inputClass} mt-1.5`}
                placeholder="e.g. Cell structure — grade 8"
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="custom-language">
                Target language
              </label>
              <select
                id="custom-language"
                className={`${inputClass} mt-1.5`}
                value={form.targetLanguage}
                onChange={(event) => update('targetLanguage', event.target.value)}
              >
                {LANGUAGES.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} — {language.native}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="custom-source">
              English source passage <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="custom-source"
              rows={4}
              className={`${textareaClass} mt-1.5`}
              placeholder="Paste the English source paragraph here…"
              value={form.source}
              onChange={(event) => update('source', event.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-slate-400">
              {form.source.trim().length} characters · minimum 20
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="custom-t1">
                Team Translation 1 <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="custom-t1"
                rows={3}
                className={`${textareaClass} mt-1.5`}
                placeholder="Paste the first team translation…"
                value={form.translation1}
                onChange={(event) => update('translation1', event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="custom-t2">
                Team Translation 2 <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="custom-t2"
                rows={3}
                className={`${textareaClass} mt-1.5`}
                placeholder="Paste the second team translation…"
                value={form.translation2}
                onChange={(event) => update('translation2', event.target.value)}
              />
            </div>
          </div>

          {formError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-400">
              Term extraction uses the curated glossary; unlisted terms are flagged for review.
            </p>
            <Button type="submit">
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Add passage & open workspace
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

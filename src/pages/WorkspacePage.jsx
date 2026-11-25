import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileText,
  FolderDown,
  Info,
  Languages,
  PlayCircle,
  RefreshCw,
  ScanSearch,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useReviewer } from '../state/ReviewContext.jsx';
import { LANGUAGES, languageName } from '../lib/termLibrary.js';
import { translatePassage } from '../lib/translationApi.js';
import ResultsPanel from '../components/results/ResultsPanel.jsx';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Spinner,
  cx,
  inputClass,
  labelClass,
  textareaClass,
} from '../components/ui.jsx';

export default function WorkspacePage({ navigate }) {
  const {
    workspace,
    updateField,
    setTranslationText,
    loadSample,
    clearWorkspace,
    runAnalysis,
    analysis,
    error,
    isAnalyzing,
    samples,
  } = useReviewer();

  const [sampleId, setSampleId] = useState('FLORES-159-162');
  const [apiState, setApiState] = useState({});

  const translateWithApi = async (index) => {
    if (!workspace.source.trim()) {
      setApiState((previous) => ({
        ...previous,
        [index]: { status: 'error', message: 'Add an English source passage first.' },
      }));
      return;
    }
    setApiState((previous) => ({ ...previous, [index]: { status: 'loading' } }));
    try {
      const result = await translatePassage({
        text: workspace.source,
        targetLanguage: workspace.targetLanguage,
      });
      setTranslationText(index, result.text);
      setApiState((previous) => ({
        ...previous,
        [index]: { status: 'done', provider: result.providerLabel },
      }));
    } catch (error) {
      setApiState((previous) => ({
        ...previous,
        [index]: { status: 'error', message: error.message },
      }));
    }
  };

  const sourceWords = workspace.source.trim()
    ? workspace.source.trim().split(/\s+/).length
    : 0;
  const filledTranslations = workspace.translations.filter(
    (translation) => translation.text.trim().length > 0
  ).length;

  const isStale = useMemo(() => {
    if (!analysis) return false;
    const normalize = (list) =>
      list
        .map((translation) => String(translation.text || '').trim())
        .filter(Boolean);
    return (
      analysis.source !== workspace.source.trim() ||
      analysis.targetLanguage !== workspace.targetLanguage ||
      JSON.stringify(normalize(analysis.translations)) !==
        JSON.stringify(normalize(workspace.translations))
    );
  }, [analysis, workspace]);

  const analyze = () => {
    runAnalysis();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Translation workspace
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-500">
            Compare two translated versions against the English source. The rules-based engine
            reviews what was supplied; a free machine translation can be requested per box.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="outline">English → {languageName(workspace.targetLanguage)}</Badge>
          {workspace.loadedSampleId ? (
            <Badge tone="indigo">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2.4} />
              FLORES passage loaded
            </Badge>
          ) : (
            <Badge>Custom entry</Badge>
          )}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" strokeWidth={2.2} />
          <p className="text-[11.5px] leading-relaxed text-rose-700">{error}</p>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_332px]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader
              icon={FileText}
              title="Source and team translations"
              description="Edit any field, then run the review."
              action={
                <Badge tone="outline">
                  {filledTranslations}/2 translations
                </Badge>
              }
            />
            <div className="space-y-4 px-5 py-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className={labelClass} htmlFor="source-passage">
                    Original passage <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    English source
                  </span>
                </div>
                <textarea
                  id="source-passage"
                  rows={5}
                  className={`${textareaClass} mt-1.5`}
                  placeholder="Paste the English source passage here…"
                  value={workspace.source}
                  onChange={(event) => updateField('source', event.target.value)}
                />
                <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-slate-400">
                  <span>{sourceWords} words · {workspace.source.trim().length} characters</span>
                  <span>The source is never rewritten.</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                <div>
                  <label className={labelClass} htmlFor="target-language">
                    Target language
                  </label>
                  <select
                    id="target-language"
                    className={`${inputClass} mt-1.5`}
                    value={workspace.targetLanguage}
                    onChange={(event) => updateField('targetLanguage', event.target.value)}
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name} — {language.native}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="passage-title">
                    Passage title
                  </label>
                  <input
                    id="passage-title"
                    className={`${inputClass} mt-1.5`}
                    value={workspace.title}
                    onChange={(event) => updateField('title', event.target.value)}
                  />
                </div>
              </div>

              <div className="h-px w-full bg-slate-100" />

              <div className="grid gap-4 md:grid-cols-2">
                {workspace.translations.map((translation, index) => (
                  <div key={translation.label + index}>
                    <div className="flex items-center justify-between gap-2">
                      <label
                        className={labelClass}
                        htmlFor={`translation-${index}`}
                      >
                        {translation.label}
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {translation.text.trim().length} chars
                      </span>
                    </div>
                    <textarea
                      id={`translation-${index}`}
                      rows={7}
                      className={`${textareaClass} mt-1.5`}
                      placeholder={`Paste ${translation.label.toLowerCase()} in ${languageName(
                        workspace.targetLanguage
                      )}…`}
                      value={translation.text}
                      onChange={(event) => setTranslationText(index, event.target.value)}
                    />
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[10px] text-slate-400">{translation.author}</p>
                      <button
                        type="button"
                        onClick={() => translateWithApi(index)}
                        disabled={
                          !workspace.source.trim() || apiState[index]?.status === 'loading'
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-1 text-[10px] font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {apiState[index]?.status === 'loading' ? (
                          <Spinner className="h-3 w-3" />
                        ) : (
                          <Sparkles className="h-3 w-3" strokeWidth={2.2} />
                        )}
                        {apiState[index]?.status === 'loading'
                          ? 'Translating…'
                          : 'Translate with API'}
                      </button>
                    </div>
                    {apiState[index]?.status === 'done' ? (
                      <p className="mt-1 text-[10px] leading-relaxed text-emerald-600">
                        Filled from {apiState[index].provider}. Machine output — review it before
                        accepting.
                      </p>
                    ) : null}
                    {apiState[index]?.status === 'error' ? (
                      <p className="mt-1 text-[10px] leading-relaxed text-rose-600">
                        {apiState[index].message}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                <p className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                  <Info className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                  Empty translations are skipped; at least one is required.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      loadSample(sampleId, workspace.targetLanguage);
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Reload sample
                  </Button>
                  <Button size="sm" variant="danger" onClick={clearWorkspace}>
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: 'Terminology glossary',
                detail: 'Verified equivalents, frequency and consistency status.',
              },
              {
                icon: AlertTriangle,
                title: 'Flagged inconsistencies',
                detail: 'Missing terms, variants and meaning risks with severity.',
              },
              {
                icon: Sigma,
                title: 'Numerical validation',
                detail: 'Exact value and unit preservation for every numeric token.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="p-4">
                  <Icon className="h-4 w-4 text-indigo-500" strokeWidth={2} />
                  <p className="mt-2 text-[12px] font-medium text-slate-800">{item.title}</p>
                  <p className="mt-0.5 text-[10.5px] leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader
              icon={SlidersHorizontal}
              title="Review setup"
              description="Load a FLORES passage or run the current inputs."
            />
            <div className="space-y-4 px-5 py-5">
              <div>
                <label className={labelClass} htmlFor="sample-select">
                  FLORES passage
                </label>
                <select
                  id="sample-select"
                  className={`${inputClass} mt-1.5`}
                  value={sampleId}
                  onChange={(event) => setSampleId(event.target.value)}
                >
                  {samples.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      {sample.topic} — {sample.title}
                    </option>
                  ))}
                </select>
                <Button
                  variant="secondary"
                  size="md"
                  className="mt-2 w-full"
                  onClick={() => loadSample(sampleId, workspace.targetLanguage)}
                >
                  <FolderDown className="h-4 w-4" strokeWidth={2.2} />
                  Load Sample Passage
                </Button>
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
                  Loads the published FLORES reference in the target language selected above.
                </p>
              </div>

              <div className="h-px w-full bg-slate-100" />

              <div className="space-y-2">
                <Button
                  size="md"
                  className="w-full"
                  onClick={analyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <ScanSearch className="h-4 w-4" strokeWidth={2.2} />
                  )}
                  {isAnalyzing ? 'Analyzing…' : 'Analyze Translations'}
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('dataset')}
                >
                  <PlayCircle className="h-4 w-4" strokeWidth={2.2} />
                  Choose another passage
                </Button>
              </div>

              <dl className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                {[
                  ['Passage ID', workspace.passageId || '—'],
                  ['Language', languageName(workspace.targetLanguage)],
                  ['Source words', sourceWords],
                  ['Translations filled', `${filledTranslations}/2`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-[10.5px] text-slate-500">{label}</dt>
                    <dd className="max-w-[160px] truncate text-right font-mono text-[10.5px] text-slate-700">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-400">
                <Languages className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={2} />
                Review runs locally with deterministic rules. Translation is optional: a free
                keyless public endpoint, or Groq once a key is saved in Quality Metrics.
              </p>
            </div>
          </Card>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-indigo-500">
              Data source
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-900/80">
              Passages are consecutive FLORES-200 devtest records. Translation 1 is the published
              FLORES reference in the selected language; Translation 2 is an alternate version
              used for comparison, or a machine translation requested from the free API or Groq.
            </p>
            <Button
              size="sm"
              variant="soft"
              className="mt-2.5 bg-white/80"
              onClick={() => navigate('about')}
            >
              Read the method
            </Button>
          </div>
        </div>
      </div>

      {analysis && isStale ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600" strokeWidth={2.2} />
          <p className="text-[11.5px] text-amber-900/80">
            The inputs changed since this analysis. Run the review again to refresh the findings.
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={analyze}
            disabled={isAnalyzing}
          >
            Re-run analysis
          </Button>
        </div>
      ) : null}

      {analysis ? (
        <ResultsPanel analysis={analysis} />
      ) : (
        <Card className="border-dashed bg-white/60">
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <ScanSearch className="h-5 w-5" strokeWidth={1.9} />
            </span>
            <p className="text-[13px] font-semibold text-slate-900">No analysis yet</p>
            <p className="max-w-md text-[11.5px] leading-relaxed text-slate-500">
              Load a FLORES-200 passage and press{' '}
              <span className="font-medium">Analyze Translations</span> to generate the glossary,
              inconsistency report and numerical validation. Results are repeatable for identical
              inputs.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  loadSample('FLORES-159-162', workspace.targetLanguage);
                  setSampleId('FLORES-159-162');
                }}
              >
                Load Mars sample
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('about')}>
                How it works
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

import {
  ArrowRight,
  BookOpen,
  Braces,
  Database,
  FileSpreadsheet,
  Gauge,
  Languages,
  Layers,
  ScrollText,
  ShieldCheck,
  Sigma,
  TriangleAlert,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader } from '../components/ui.jsx';
import { TERM_LIBRARY } from '../lib/termLibrary.js';
import { METRIC_DEFINITIONS } from '../lib/metrics.js';

const CAPABILITIES = [
  {
    icon: Database,
    title: 'FLORES-200 passage selection',
    detail:
      'Four passages built from FLORES-200 devtest records (space science, climate, earth science, history of sport), each with published references in Tamil, Hindi, Kannada, Telugu and Malayalam.',
  },
  {
    icon: Languages,
    title: 'Side-by-side translated versions',
    detail:
      'Compare the published FLORES reference in the selected language with an alternate version, sentence by sentence.',
  },
  {
    icon: BookOpen,
    title: 'Terminology glossary',
    detail:
      'Extract curated technical terms, match verified equivalents in five languages and report Consistent, Inconsistent or Needs Review.',
  },
  {
    icon: TriangleAlert,
    title: 'Inconsistency detection',
    detail:
      'Flag variant mismatches, missing technical terms, cross-passage drift and possible meaning changes, with severity.',
  },
  {
    icon: Sigma,
    title: 'Numerical preservation',
    detail:
      'Compare numbers, decimals, percentages, units and dates token by token, and report the exact mismatch.',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV review report',
    detail:
      'Export terms, equivalents, consistency, numerical findings, explanations and severity for the review record.',
  },
];

export default function AboutPage({ navigate }) {
  return (
    <div className="space-y-5">
      <Card className="relative overflow-hidden border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 p-6 sm:p-7">
        <div className="max-w-3xl">
          <Badge tone="indigo">
            <Database className="h-3 w-3" strokeWidth={2.2} />
            FLORES-200 · 5 languages
          </Badge>
          <h2 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight text-slate-900">
            Quality assurance for multilingual educational content
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
            EduTerm Reviewer checks terminology and numerical consistency between an English
            source and two translated versions of the same passage, in Tamil, Hindi, Kannada,
            Telugu or Malayalam. It does not rewrite: it verifies whether the terms and values
            that carry meaning survived consistently.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              'React',
              'JavaScript',
              'Tailwind CSS',
              'Lucide icons',
              'Deterministic rules',
              'Keyless translation API',
              'Optional Groq judge',
            ].map(
              (item) => (
                <Badge key={item} tone="outline">
                  {item}
                </Badge>
              )
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader
            icon={Layers}
            title="What the reviewer does"
            description="Scope aligned with the educational translation quality problem."
          />
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
            {CAPABILITIES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <p className="mt-2.5 text-[12px] font-medium text-slate-900">{item.title}</p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={ScrollText}
            title="Sample review"
            description="The Mars caves passage, with its expected findings."
          />
          <div className="space-y-4 px-5 py-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                English source
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600">
                “All of the cave entrances … are at least 100 to 250 meters … in diameter.
                Infrared images show that the temperature variations from night and day show that
                they are likely caves.”
              </p>
            </div>
            <ul className="space-y-2">
              {[
                {
                  tone: 'warning',
                  label: 'Cave',
                  detail:
                    'Rendered with குகை / குகைகள் in Translation 1 and கெபி / கெபிகள் in Translation 2 → Warning.',
                },
                {
                  tone: 'critical',
                  label: '250 metres',
                  detail:
                    'Translation 1 keeps 250; Translation 2 writes 260 → Critical numerical mismatch.',
                },
                {
                  tone: 'success',
                  label: '100, 328, 820',
                  detail: 'Preserved exactly in both versions → passes validation.',
                },
                {
                  tone: 'review',
                  label: 'Climate passage',
                  detail:
                    'Adds an emissions variant and moves the 2020 target to 2025.',
                },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <Badge tone={item.tone} className="mt-0.5 shrink-0">
                    {item.label}
                  </Badge>
                  <span className="text-[11px] leading-relaxed text-slate-500">
                    {item.detail}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              size="sm"
              variant="soft"
              onClick={() => navigate('workspace')}
              className="w-full"
            >
              Open the workspace
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={Braces}
          title="How the analysis works"
          description="Rule-based, transparent and identical for identical inputs."
        />
        <div className="grid gap-5 px-5 py-5 lg:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Extract',
              detail:
                'Curated English scientific terms are matched in the source with frequency counts. Digits, decimals, percentages and units become numeric tokens.',
            },
            {
              step: '02',
              title: 'Compare',
              detail:
                'Each term is looked up in the verified library for the selected language. Each numeric token is matched exactly, including its normalised unit, in both versions.',
            },
            {
              step: '03',
              title: 'Flag',
              detail:
                'Variant differences, omissions, unverified mappings and value changes become findings with severity, sentence evidence and a human recommendation.',
            },
          ].map((item) => (
            <div key={item.step} className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="font-mono text-[10px] font-semibold text-indigo-500">
                {item.step}
              </span>
              <p className="mt-1 text-[12.5px] font-medium text-slate-900">{item.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
        <div className="mx-5 mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" strokeWidth={2.2} />
            <p className="text-[11.5px] font-medium text-slate-800">
              Deterministic by design — this is not a live GenAI model.
            </p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
            The reviewer intentionally uses local JavaScript rules and a curated terminology
            library of {TERM_LIBRARY.length} terms across five languages. Reviewing makes no
            network requests, stores no data on a server, and never rewrites a translation or a
            numeric value.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
            <span className="font-medium text-slate-700">Optional free translation.</span> Each
            translation box can fetch a machine translation from a free, keyless public endpoint
            (Google's translate web endpoint, falling back to MyMemory), or from Groq's Llama
            model once a free Groq key is saved. The machine output is treated as an ordinary
            draft that the review then checks.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={Gauge}
          title="Evaluation metrics"
          description="How the reviewer measures preservation and its own accuracy."
        />
        <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
          {METRIC_DEFINITIONS.map((metric) => (
            <div key={metric.id} className="bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium text-slate-900">{metric.label}</p>
                <Badge tone="outline" className="shrink-0">
                  {metric.source}
                </Badge>
              </div>
              <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                {metric.definition}
              </p>
            </div>
          ))}
        </div>
        <div className="mx-5 my-4 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
          <p className="text-[11px] leading-relaxed text-indigo-900/80">
            <span className="font-medium">BERTScore is always local.</span> It needs no network:
            it compares the two translated versions, following the greedy token-matching
            formulation but with locally hashed character-trigram embeddings, so it is a
            reproducible proxy rather than a downloaded multilingual BERT encoder.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-indigo-900/80">
            <span className="font-medium">Three metrics are model-judged.</span> Faithfulness,
            hallucination rate and answer relevancy are produced by a Groq-hosted model
            (GPT-OSS or Qwen) through the optional Groq API when the reviewer supplies a free key
            in the Quality Metrics tab.
            Nothing is sent anywhere without that action, and the judge is advisory: it never
            edits a translation or a finding.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={TriangleAlert}
            title="Limitations and responsible use"
            description="What a reviewer must still decide."
          />
          <ul className="space-y-2.5 px-5 py-4">
            {[
              'Terminology coverage is limited to the curated library. Unlisted terms are marked Needs Review rather than guessed.',
              'Synonym matching is literal. A correct paraphrase that is not in the library will be flagged for human verification.',
              'Numbers written as words in the target language cannot be compared automatically.',
              'Machine translations come from free public endpoints or Groq: quality varies by language, and MyMemory applies a daily quota.',
              'BERTScore is computed with a local trigram embedding proxy; treat it as a comparative signal, not a published BERTScore number.',
              'Model-judged metrics depend on the selected Groq model and may shift slightly between runs.',
              'Sentence alignment falls back to proportional mapping when versions merge or split sentences.',
              'Wording differences alone are not errors. Every finding is evidence, not a verdict.',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                <span className="text-[11.5px] leading-relaxed text-slate-500">{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            icon={Database}
            title="Data source and traceability"
            description="FLORES-200 devtest, English → five Indian languages."
          />
          <div className="space-y-3 px-5 py-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-3">
              <p className="text-[11px] leading-relaxed text-indigo-900/80">
                Passages are consecutive records from the FLORES-200 devtest split, published by
                Meta AI under CC BY-SA 4.0. Translation 1 is the published reference for the
                selected language (ta, hi, kn, te, ml); Translation 2 is an alternate version
                prepared for comparison. Quotation marks are normalised for display.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ['Passages', '3 devtest sets'],
                ['Languages', 'ta · hi · kn · te · ml'],
                ['Verified terms', `${TERM_LIBRARY.length} curated entries`],
                ['Processing', '100% local in the browser'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
                  <dt className="text-[10px] uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="mt-1 text-[11.5px] font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone="outline">Optional Groq key</Badge>
              <Badge tone="outline">No authentication</Badge>
              <Badge tone="outline">No database</Badge>
              <Badge tone="outline">Free public translation API</Badge>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => navigate('dataset')}>
                Browse passages
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => navigate('glossary')}>
                View term library
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

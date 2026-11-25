import { Database, Languages, X } from 'lucide-react';
import { NAV_ITEMS } from '../navigation.js';
import { Badge, cx } from './ui.jsx';

export default function Sidebar({ current, onNavigate, open, onClose }) {
  return (
    <>
      <div
        className={cx(
          'fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-[2px] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-40 flex w-[268px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-start justify-between px-5 pb-5 pt-5">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-start gap-3 text-left"
          >
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-[0_4px_10px_rgba(79,70,229,0.28)]">
              <Languages className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[15px] font-semibold tracking-tight text-slate-900">
                EduTerm Reviewer
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                Terminology QA for education
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3">
          <p className="px-2 pb-2 text-[10.5px] font-semibold uppercase tracking-[0.11em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.id === current;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cx(
                    'group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition',
                    active
                      ? 'bg-indigo-50 font-medium text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    className={cx(
                      'h-[16px] w-[16px] shrink-0',
                      active
                        ? 'text-indigo-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    )}
                    strokeWidth={active ? 2.2 : 1.9}
                  />
                  <span className="truncate">{item.label}</span>
                  {active ? (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 px-5">
          <div className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-3.5">
            <Badge tone="indigo" className="mb-2">
              <Database className="h-3 w-3" strokeWidth={2.2} />
              FLORES-200 · 5 languages
            </Badge>
            <p className="text-[11px] leading-relaxed text-slate-500">
              English → Tamil, Hindi, Kannada, Telugu and Malayalam review of FLORES-200 devtest
              records, checked with deterministic terminology and numerical rules.
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between text-[10.5px] text-slate-400">
            <span>v1.0 · FLORES-200</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Local
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

import { Database, Menu, Plus } from 'lucide-react';
import { getNavItem } from '../navigation.js';
import { Badge, Button } from './ui.jsx';

export default function Topbar({ current, onNavigate, onOpenMenu }) {
  const section = getNavItem(current);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[#F6F7FB]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="hidden sm:inline">EduTerm</span>
            <span className="hidden text-slate-300 sm:inline">/</span>
            <span className="truncate font-medium text-slate-500">{section.label}</span>
          </div>
          <h1 className="truncate text-[13px] font-semibold tracking-tight text-slate-900">
            {section.title}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge tone="outline" className="hidden md:inline-flex">
            <Database className="h-3 w-3 text-indigo-500" strokeWidth={2.2} />
            FLORES-200 · 5 languages
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('dataset')}
            className="hidden sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            New review
          </Button>
        </div>
      </div>
    </header>
  );
}

import { useCallback, useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import { NAV_ITEMS } from './navigation.js';
import Dashboard from './pages/Dashboard.jsx';
import DatasetPage from './pages/DatasetPage.jsx';
import WorkspacePage from './pages/WorkspacePage.jsx';
import GlossaryPage from './pages/GlossaryPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

const VALID_ROUTES = NAV_ITEMS.map((item) => item.id);

const parseHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  return VALID_ROUTES.includes(raw) ? raw : 'dashboard';
};

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next) => {
    const target = VALID_ROUTES.includes(next) ? next : 'dashboard';
    setMenuOpen(false);
    setRoute(target);
    if (window.location.hash !== `#${target}`) {
      window.location.hash = target;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const pages = {
    dashboard: <Dashboard navigate={navigate} />,
    dataset: <DatasetPage navigate={navigate} />,
    workspace: <WorkspacePage navigate={navigate} />,
    glossary: <GlossaryPage navigate={navigate} />,
    reports: <ReportsPage navigate={navigate} />,
    about: <AboutPage navigate={navigate} />,
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-slate-900">
      <Sidebar
        current={route}
        onNavigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pl-[268px]">
        <Topbar current={route} onNavigate={navigate} onOpenMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1180px] px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <div key={route} className="animate-fade-up">
            {pages[route] || pages.dashboard}
          </div>
          <footer className="mt-12 flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>EduTerm Reviewer · Terminology and numerical QA for educational translation.</p>
            <p>Passages: FLORES-200 devtest (Meta AI, CC BY-SA 4.0).</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

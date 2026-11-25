import {
  LayoutDashboard,
  Database,
  PenLine,
  BookOpen,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    title: 'Review dashboard',
    subtitle: 'Quality overview across your educational translation reviews.',
  },
  {
    id: 'dataset',
    label: 'FLORES Dataset',
    icon: Database,
    title: 'Passage library',
    subtitle: 'Choose a FLORES-200 devtest passage or add your own source text.'
  },
  {
    id: 'workspace',
    label: 'Translation Workspace',
    icon: PenLine,
    title: 'Translation workspace',
    subtitle: 'Compare team translations against the English source, side by side.',
  },
  {
    id: 'glossary',
    label: 'Terminology Glossary',
    icon: BookOpen,
    title: 'Terminology glossary',
    subtitle: 'Verified multilingual equivalents and consistency across reviews.',
  },
  {
    id: 'reports',
    label: 'Inconsistency Reports',
    icon: ShieldAlert,
    title: 'Inconsistency reports',
    subtitle: 'Every flagged terminology and numerical finding, with severity.',
  },
  {
    id: 'about',
    label: 'About Project',
    icon: Info,
    title: 'About this project',
    subtitle: 'Scope, data source and the limits of the review engine.'
  },
];

export const getNavItem = (id) =>
  NAV_ITEMS.find((item) => item.id === id) || NAV_ITEMS[0];

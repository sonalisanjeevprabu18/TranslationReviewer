import { cx } from './ui.jsx';

const escapeRegExp = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Highlights exact substrings without dangerouslySetInnerHTML.
 * `tone` switches the mark colour for numbers vs. terms.
 */
export default function Highlight({
  text,
  needles = [],
  tone = 'indigo',
  emptyLabel = '— no translation —',
  className = '',
}) {
  const value = String(text || '');
  if (!value.trim()) {
    return <span className="italic text-slate-400">{emptyLabel}</span>;
  }

  const cleanNeedles = [...new Set((needles || []).filter((needle) => needle && String(needle).length >= 1))]
    .map(String)
    .sort((a, b) => b.length - a.length);

  if (!cleanNeedles.length) return <span className={className}>{value}</span>;

  const pattern = new RegExp(`(${cleanNeedles.map(escapeRegExp).join('|')})`, 'giu');
  const parts = value.split(pattern);
  const markClass =
    tone === 'rose'
      ? 'rounded bg-rose-100 px-0.5 font-medium text-rose-800'
      : tone === 'amber'
        ? 'rounded bg-amber-100 px-0.5 font-medium text-amber-900'
        : 'rounded bg-indigo-100 px-0.5 font-medium text-indigo-900';

  return (
    <span className={cx('break-words', className)}>
      {parts.map((part, index) => {
        if (!part) return null;
        const isMatch = cleanNeedles.some(
          (needle) => needle.toLowerCase() === part.toLowerCase()
        );
        return isMatch ? (
          <mark key={`${part}-${index}`} className={markClass}>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        );
      })}
    </span>
  );
}

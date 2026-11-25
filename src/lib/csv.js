import { SEVERITY_ORDER } from './analysis.js';
import { languageName } from './termLibrary.js';

const escapeCell = (value) => {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const severityFor = (issues) => {
  if (!issues.length) return 'None';
  return [...issues].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )[0].severity;
};

/**
 * Flat review report: one row per glossary term, numeric finding, or
 * cross-passage finding. Required columns come first.
 */
export function buildReviewRows(analysis) {
  if (!analysis) return [];
  const rows = [];
  const lang = languageName(analysis.targetLanguage);

  const numericFailures = (analysis.numeric?.rows || []).filter(
    (row) => row.status === 'fail'
  ).length;

  (analysis.glossary || []).forEach((entry) => {
    const related = (analysis.issues || []).filter(
      (issue) => issue.term === entry.english && issue.category !== 'Numerical value'
    );
    rows.push({
      passageId: analysis.passageId,
      term: entry.english,
      translation1: entry.translation1 || 'Needs Review',
      translation2: entry.translation2 || 'Needs Review',
      consistency: entry.consistency,
      numeric: numericFailures
        ? 'See numerical validation rows in this report'
        : 'No numerical mismatch detected',
      explanation: related.length
        ? related.map((issue) => issue.reason).join(' | ')
        : entry.consistency === 'Consistent'
          ? 'No terminology issue detected in this analysis.'
          : entry.note,
      severity: severityFor(related),
      language: lang,
      recordType: 'Technical term',
    });
  });

  (analysis.issues || [])
    .filter((issue) => issue.category === 'Numerical value')
    .forEach((issue) => {
      rows.push({
        passageId: analysis.passageId,
        term: 'Numerical value',
        translation1: (issue.detected || [])[0] || '',
        translation2:
          (issue.detected || []).slice(1).join(' → ') || (issue.detected || [])[0] || '',
        consistency: '—',
        numeric: issue.reason,
        explanation: issue.reason,
        severity: issue.severity,
        language: lang,
        recordType: 'Numerical validation',
      });
    });

  (analysis.issues || [])
    .filter((issue) => issue.category === 'Cross-passage terminology')
    .forEach((issue) => {
      rows.push({
        passageId: analysis.passageId,
        term: issue.term,
        translation1: (issue.detected || [])[0] || '',
        translation2: (issue.detected || [])[1] || '',
        consistency: 'Needs Review',
        numeric: 'No mismatch linked to this term',
        explanation: issue.reason,
        severity: issue.severity,
        language: lang,
        recordType: 'Cross-passage',
      });
    });

  return rows;
}

export function buildCsv(analysis) {
  const columns = [
    'Passage ID',
    'Original Technical Term',
    'Translation 1 Term',
    'Translation 2 Term',
    'Consistency Status',
    'Numerical Mismatches',
    'Issue Explanation',
    'Severity',
    'Target Language',
    'Record Type',
  ];
  const rows = buildReviewRows(analysis).map((row) => [
    row.passageId,
    row.term,
    row.translation1,
    row.translation2,
    row.consistency,
    row.numeric,
    row.explanation,
    row.severity,
    row.language,
    row.recordType,
  ]);
  return [columns, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

export function downloadCsv(analysis) {
  if (!analysis) return false;
  const csv = `\uFEFF${buildCsv(analysis)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `eduterm-review-${analysis.passageId}-${analysis.targetLanguage}-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

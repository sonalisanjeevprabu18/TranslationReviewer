/**
 * Deterministic review engine (no AI model, no network calls).
 *
 * Responsibilities:
 *  - extract curated educational / technical terms from the English source
 *  - compare verified target-language variants across two team translations
 *  - extract numeric tokens with units and compare them exactly
 *  - produce glossary entries, flagged issues and a review summary
 */

import {
  TERM_LIBRARY,
  languageName,
  getForms,
  getVariants,
} from './termLibrary.js';

export const SEVERITY_ORDER = ['Critical', 'Warning', 'Review'];

export const SEVERITY_META = {
  Critical: {
    label: 'Critical',
    tone: 'critical',
    description: 'Important meaning or value mismatch',
  },
  Warning: {
    label: 'Warning',
    tone: 'warning',
    description: 'Terminology inconsistency',
  },
  Review: {
    label: 'Review',
    tone: 'review',
    description: 'Potential ambiguity requiring human verification',
  },
};

export const CONSISTENCY_META = {
  Consistent: { tone: 'consistent', description: 'Same verified term in both translations' },
  Inconsistent: { tone: 'inconsistent', description: 'Different or missing term across translations' },
  'Needs Review': { tone: 'review', description: 'No verified mapping — human check required' },
};

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

export const normalizeSpaces = (value = '') =>
  String(value ?? '').replace(/\s+/g, ' ').trim();

export const splitSentences = (text = '') => {
  const clean = normalizeSpaces(text);
  if (!clean) return [];
  return clean
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const escapeRegExp = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const countOccurrences = (haystack = '', needle = '') => {
  if (!haystack || !needle) return 0;
  const pattern = new RegExp(`\\b${escapeRegExp(needle)}(?:s|es)?\\b`, 'giu');
  return (String(haystack).match(pattern) || []).length;
};

export const sentenceContainsTerm = (sentence = '', term = '') => {
  if (!sentence || !term) return false;
  const pattern = new RegExp(`\\b${escapeRegExp(term)}(?:s|es)?\\b`, 'iu');
  return pattern.test(sentence);
};

export const matchVariant = (text = '', variants = []) => {
  if (!text || !Array.isArray(variants) || !variants.length) return null;
  const ordered = [...variants].sort((a, b) => b.length - a.length);
  for (const variant of ordered) {
    if (!variant) continue;
    if (String(text).toLowerCase().includes(String(variant).toLowerCase())) {
      return variant;
    }
  }
  return null;
};

const alignSentence = (targetSentences = [], index, sourceLength) => {
  if (!targetSentences.length) return '';
  if (targetSentences.length === sourceLength) return targetSentences[index] || '';
  const mapped = Math.min(
    targetSentences.length - 1,
    Math.floor((index * targetSentences.length) / Math.max(sourceLength, 1))
  );
  return targetSentences[mapped] || '';
};

/* ------------------------------------------------------------------ */
/* Terminology extraction                                              */
/* ------------------------------------------------------------------ */

export function extractTerms(sourceText) {
  const source = normalizeSpaces(sourceText);
  if (!source) return [];
  return TERM_LIBRARY.map((term) => ({
    english: term.en,
    definition: term.definition,
    domain: term.domain,
    frequency: getForms(term).reduce(
      (total, form) => total + countOccurrences(source, form),
      0
    ),
  })).filter((term) => term.frequency > 0);
}

function buildGlossaryEntry(term, targetLanguage, translations) {
  const variants = getVariants(term.english, targetLanguage);
  const t1Text = translations[0]?.text || '';
  const t2Text = translations[1]?.text || '';
  const translation1 = matchVariant(t1Text, variants);
  const translation2 = matchVariant(t2Text, variants);

  let consistency = 'Needs Review';
  let note = '';

  if (!variants.length) {
    note = `No verified ${languageName(targetLanguage)} mapping in the term library.`;
  } else if (translation1 && translation2) {
    if (translation1 === translation2) {
      consistency = 'Consistent';
      note = `Both translations use “${translation1}”.`;
    } else {
      consistency = 'Inconsistent';
      note = `Translation 1 uses “${translation1}”; Translation 2 uses “${translation2}”.`;
    }
  } else if (translation1 || translation2) {
    consistency = 'Inconsistent';
    const missingIn = translation1 ? 'Translation 2' : 'Translation 1';
    note = `Term detected in ${translation1 ? 'Translation 1' : 'Translation 2'} but not in ${missingIn}.`;
  } else {
    note = `No known ${languageName(targetLanguage)} equivalent detected in either translation.`;
  }

  return {
    id: `term-${term.english.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    english: term.english,
    definition: term.definition,
    domain: term.domain,
    frequency: term.frequency,
    variants,
    translation1: translation1 || '',
    translation2: translation2 || '',
    consistency,
    note,
  };
}

/* ------------------------------------------------------------------ */
/* Numeric extraction and comparison                                   */
/* ------------------------------------------------------------------ */

const UNIT_DEFS = [
  {
    canonical: 'units',
    tokens: ['units', 'unit', 'ಘಟಕಗಳನ್ನು', 'ಘಟಕಗಳು', 'ಘಟಕಗಳ', 'ಘಟಕ', 'इकाइयाँ', 'इकाइयां', 'इकाई', 'அலகுகள்', 'யூனிட்', 'యూనిట్లు', 'യൂണിറ്റുകൾ', 'ഏകകം'],
  },
  {
    canonical: '%',
    tokens: ['%', 'percent', 'percentage', 'प्रतिशत', 'ಶೇಕಡಾ', 'சதவீதம்', 'శాతం', 'ശതമാനം', 'শতাংশ'],
  },
  {
    canonical: '°C',
    tokens: ['°c', '° c', 'degrees celsius', 'degree celsius', 'celsius', 'डिग्री सेल्सियस', 'ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್'],
  },
  {
    canonical: '°F',
    tokens: ['°f', 'degrees fahrenheit', 'degree fahrenheit', 'fahrenheit'],
  },
  { canonical: 'kg', tokens: ['kilograms', 'kilogram', 'kgs', 'kg'] },
  { canonical: 'g', tokens: ['grams', 'gram', 'gms', 'g'] },
  { canonical: 'mg', tokens: ['milligrams', 'milligram', 'mg'] },
  {
    canonical: 'km',
    tokens: [
      'kilometres', 'kilometers', 'kilometre', 'kilometer', 'kms', 'km',
      'கி.மீ', 'கிமீ', 'किलोमीटर', 'किमी', 'ಕಿಲೋಮೀಟರ್', 'ಕಿಮೀ',
      'కిలోమీటర్', 'కిమీ', 'കിലോമീറ്റർ',
    ],
  },
  {
    canonical: 'm',
    tokens: [
      'metres', 'meters', 'metre', 'meter',
      'மீட்டர்கள்', 'மீட்டர்', 'மீட்டர',
      'मीटर', 'मीटरों', 'ಮೀಟರ್', 'ಮೀಟರ್‌ಗಳ', 'మీటర్', 'మీటర్లు', 'మీటర్ల', 'മീറ്റർ', 'm',
    ],
  },
  {
    canonical: 'ft',
    tokens: ['feet', 'foot', 'அடி', 'फीट', 'फ़ीट', 'फ़ीट', 'ಅಡಿ', 'అడుగులు', 'అడుగు', 'അടി', 'ft'],
  },
  { canonical: 'mi', tokens: ['miles', 'mile', 'மைல்', 'मील', 'ಮೈಲಿ', 'మైలు', 'മൈൽ', 'mi'] },
  { canonical: 'cm', tokens: ['centimetres', 'centimeters', 'centimetre', 'centimeter', 'cms', 'cm'] },
  { canonical: 'mm', tokens: ['millimetres', 'millimeters', 'millimetre', 'millimeter', 'mm'] },
  { canonical: 'L', tokens: ['litres', 'liters', 'litre', 'liter', 'l'] },
  { canonical: 'mL', tokens: ['millilitres', 'milliliters', 'millilitre', 'milliliter', 'ml'] },
  { canonical: 'hours', tokens: ['hours', 'hour', 'hrs', 'hr'] },
  { canonical: 'minutes', tokens: ['minutes', 'minute', 'mins', 'min'] },
  { canonical: 'seconds', tokens: ['seconds', 'second', 'secs', 'sec'] },
  { canonical: 'days', tokens: ['days', 'day'] },
  { canonical: 'years', tokens: ['years', 'year'] },
];

const UNIT_TOKENS = UNIT_DEFS.flatMap((definition) =>
  definition.tokens.map((token) => ({ token, canonical: definition.canonical }))
).sort((a, b) => b.token.length - a.token.length);

const UNIT_LOOKUP = new Map(
  UNIT_TOKENS.map(({ token, canonical }) => [token.toLowerCase(), canonical])
);

const UNIT_REGEX = new RegExp(
  `^\\s*(${UNIT_TOKENS.map(({ token }) => escapeRegExp(token)).join('|')})(?![\\p{L}\\d])`,
  'iu'
);

const NUMBER_REGEX = /(?<![\p{L}\d])(\d+(?:[.,]\d+)?)(?![\p{L}\d])/gu;

function parseNumericValue(raw) {
  let text = String(raw);
  if (text.includes(',') && text.includes('.')) {
    text = text.replace(/,/g, '');
  } else if (text.includes(',')) {
    const [whole, fraction] = text.split(',');
    text = fraction && fraction.length === 3 ? `${whole}${fraction}` : `${whole}.${fraction}`;
  }
  const value = Number.parseFloat(text);
  return Number.isFinite(value) ? value : null;
}

export function extractNumericTokens(text = '') {
  const source = String(text ?? '');
  if (!source) return [];
  const tokens = [];
  NUMBER_REGEX.lastIndex = 0;
  let match;
  while ((match = NUMBER_REGEX.exec(source)) !== null) {
    const after = source.slice(match.index + match[0].length);
    const unitMatch = after.match(UNIT_REGEX);
    const unit = unitMatch ? UNIT_LOOKUP.get(unitMatch[1].toLowerCase()) || '' : '';
    const value = parseNumericValue(match[1]);
    if (value === null) continue;
    tokens.push({
      raw: match[0],
      value,
      unit,
      unitRaw: unitMatch ? unitMatch[1] : '',
      index: match.index,
    });
  }
  return tokens;
}

const sourceSentenceRanges = (sourceText, sourceSentences) => {
  let cursor = 0;
  return sourceSentences.map((sentence) => {
    const found = sourceText.indexOf(sentence, cursor);
    const start = found === -1 ? cursor : found;
    cursor = start + sentence.length;
    return { start, end: start + sentence.length };
  });
};

const sentenceIndexForToken = (token, ranges) => {
  if (!ranges.length) return 0;
  const found = ranges.findIndex(
    (range) => token.index >= range.start && token.index < range.end
  );
  return found === -1 ? 0 : found;
};

function compareTokens(sourceTokens, targetTokens) {
  const used = new Set();
  const bySourceIndex = {};

  sourceTokens.forEach((sourceToken, index) => {
    const matchIndex = targetTokens.findIndex(
      (token, tokenIndex) =>
        !used.has(tokenIndex) && Math.abs(token.value - sourceToken.value) < 1e-9
    );
    if (matchIndex === -1) {
      bySourceIndex[index] = { status: 'missing', raw: '', unit: '' };
      return;
    }
    const token = targetTokens[matchIndex];
    used.add(matchIndex);
    if (token.unit === sourceToken.unit) {
      bySourceIndex[index] = { status: 'match', raw: token.raw, unit: token.unit };
    } else {
      bySourceIndex[index] = {
        status: 'unit-change',
        raw: token.raw,
        unit: token.unit,
      };
    }
  });

  const leftovers = targetTokens
    .map((token, index) => ({ token, index }))
    .filter(({ index }) => !used.has(index));

  Object.keys(bySourceIndex).forEach((key) => {
    if (bySourceIndex[key].status !== 'missing') return;
    const pair = leftovers.shift();
    if (!pair) return;
    used.add(pair.index);
    bySourceIndex[key] = {
      status: 'altered',
      raw: pair.token.raw,
      unit: pair.token.unit,
      value: pair.token.value,
    };
  });

  const extras = targetTokens.filter((token, index) => !used.has(index));

  return { bySourceIndex, extras };
}

const describeUnit = (unit) => unit || 'no unit';

const formatValue = (value, unit) => {
  if (!unit) return String(value);
  return unit === '%' ? `${value}%` : `${value} ${unit}`;
};

export function analyzeNumbers(sourceText, translations = [], sourceSentences = []) {
  const sourceTokens = extractNumericTokens(sourceText);
  const translationTokens = translations.map((translation) =>
    extractNumericTokens(translation.text)
  );
  const comparisons = translationTokens.map((tokens) => compareTokens(sourceTokens, tokens));
  const ranges = sourceSentenceRanges(sourceText, sourceSentences);

  const rows = sourceTokens.map((sourceToken, index) => {
    const cells = comparisons.map((comparison) => {
      const cell = comparison.bySourceIndex[index] || { status: 'missing', raw: '', unit: '' };
      return {
        status: cell.status,
        value: cell.raw,
        unit: cell.unit,
      };
    });
    const failed = cells.some((cell) =>
      ['missing', 'altered', 'unit-change'].includes(cell.status)
    );
    return {
      id: `num-${index}`,
      sourceRaw: sourceToken.raw,
      value: sourceToken.value,
      unit: sourceToken.unit,
      sentenceIndex: sentenceIndexForToken(sourceToken, ranges),
      cells,
      status: failed ? 'fail' : 'pass',
    };
  });

  const issues = [];
  rows.forEach((row, rowIndex) => {
    const sourceSentence = sourceSentences[row.sentenceIndex] || '';
    row.cells.forEach((cell, translationIndex) => {
      if (cell.status === 'match') return;
      const translation = translations[translationIndex];
      let reason = '';
      let detected = [row.sourceRaw];
      if (cell.status === 'altered') {
        reason = `Source value “${formatValue(row.sourceRaw, row.unit)}” was rendered as “${formatValue(cell.value, cell.unit)}” in ${translation.label}. The numeric value changed.`;
        detected = [row.sourceRaw, cell.value];
      } else if (cell.status === 'unit-change') {
        reason = `Value ${row.sourceRaw} is preserved in ${translation.label}, but its unit changed from “${describeUnit(row.unit)}” to “${describeUnit(cell.unit)}”.`;
        detected = [row.sourceRaw, `${cell.value} ${describeUnit(cell.unit)}`];
      } else {
        reason = `Source value “${formatValue(row.sourceRaw, row.unit)}” does not appear in ${translation.label}. Verify that it was not dropped.`;
      }
      issues.push({
        id: `num-${rowIndex}-t${translationIndex + 1}`,
        category: 'Numerical value',
        term: 'Numerical value',
        severity: 'Critical',
        sentenceIndex: row.sentenceIndex,
        sourceSentence,
        translation1Sentence: getTranslationSentence(translations, sourceSentences, row.sentenceIndex, 0),
        translation2Sentence: getTranslationSentence(translations, sourceSentences, row.sentenceIndex, 1),
        detected,
        reason,
        recommendation:
          'Confirm the intended value with the source author. The tool does not correct numeric values automatically.',
      });
    });
  });

  comparisons.forEach((comparison, translationIndex) => {
    comparison.extras.forEach((extra) => {
      const translation = translations[translationIndex];
      const sentence = translations[translationIndex]?.sentences?.find((item) =>
        item.includes(extra.raw)
      );
      issues.push({
        id: `extra-${translationIndex}-${extra.index}`,
        category: 'Numerical value',
        term: 'Numerical value',
        severity: 'Warning',
        sentenceIndex: 0,
        sourceSentence: '',
        translation1Sentence: '',
        translation2Sentence: sentence || '',
        detected: [`${extra.raw}${extra.unit ? ` ${extra.unit}` : ''}`],
        reason: `${translation.label} contains the numeric value “${formatValue(extra.raw, extra.unit)}”, which has no counterpart in the source passage.`,
        recommendation: 'Check whether this value was added intentionally or copied from another passage.',
      });
    });
  });

  return {
    sourceTokens,
    translations: translations.map((translation, index) => ({
      label: translation.label,
      tokens: translationTokens[index],
      extras: comparisons[index].extras,
    })),
    rows,
    issues,
    limitations: [
      'Comparison is token based: digits, decimal separators and units must match exactly.',
      'Numbers written entirely as words in the target language (for example ஆறு instead of 6) cannot be compared and are left for human review.',
      'Unit synonyms are normalised only for a small verified list; other units may be reported as changed.',
      'Calendar dates are compared through their numeric components (for example 2024 or 12); month names are not validated.',
    ],
  };
}

const getTranslationSentence = (translations, sourceSentences, index, translationIndex) => {
  const translation = translations[translationIndex];
  if (!translation?.sentences?.length) return '';
  return alignSentence(translation.sentences, index, sourceSentences.length);
};

/* ------------------------------------------------------------------ */
/* Terminology issues                                                  */
/* ------------------------------------------------------------------ */

function terminologyIssues(glossary, sourceSentences, translationSentences, targetLanguage) {
  const issues = [];

  glossary.forEach((entry) => {
    const variants = entry.variants;
    const language = languageName(targetLanguage);
    const fallbackIndex = Math.max(
      0,
      sourceSentences.findIndex((sentence) => sentenceContainsTerm(sentence, entry.english))
    );

    if (!variants.length) {
      issues.push({
        id: `${entry.id}-no-mapping`,
        category: 'Terminology',
        term: entry.english,
        severity: 'Review',
        sentenceIndex: fallbackIndex,
        sourceSentence: sourceSentences[fallbackIndex] || '',
        translation1Sentence: alignSentence(translationSentences[0] || [], fallbackIndex, sourceSentences.length),
        translation2Sentence: alignSentence(translationSentences[1] || [], fallbackIndex, sourceSentences.length),
        detected: [],
        reason: `No verified ${language} equivalent for “${entry.english}” exists in the term library, so automated consistency checking was skipped.`,
        recommendation: 'A subject expert should confirm the institutional term and add it to the shared glossary.',
      });
      return;
    }

    for (let index = 0; index < sourceSentences.length; index += 1) {
      const sourceSentence = sourceSentences[index];
      const sourceTerm = getForms({ en: entry.english, forms: TERM_LIBRARY.find((term) => term.en === entry.english)?.forms });
      if (!sourceTerm.some((form) => sentenceContainsTerm(sourceSentence, form))) continue;

      const t1Sentence = alignSentence(translationSentences[0] || [], index, sourceSentences.length);
      const t2Sentence = alignSentence(translationSentences[1] || [], index, sourceSentences.length);
      const value1 = matchVariant(t1Sentence, variants);
      const value2 = matchVariant(t2Sentence, variants);

      if (value1 && value2 && value1 !== value2) {
        issues.push({
          id: `${entry.id}-s${index}-variant`,
          category: 'Terminology',
          term: entry.english,
          severity: 'Warning',
          sentenceIndex: index,
          sourceSentence,
          translation1Sentence: t1Sentence,
          translation2Sentence: t2Sentence,
          detected: [value1, value2],
          reason: `The technical term “${entry.english}” is translated as “${value1}” in Translation 1 and “${value2}” in Translation 2. Both are verified ${language} variants, but the same term must be used consistently.`,
          recommendation: 'Agree on one preferred variant with the subject team, then apply it to both translations.',
        });
        break;
      }

      if (value1 && !value2) {
        issues.push({
          id: `${entry.id}-s${index}-missing2`,
          category: 'Missing terminology',
          term: entry.english,
          severity: 'Review',
          sentenceIndex: index,
          sourceSentence,
          translation1Sentence: t1Sentence,
          translation2Sentence: t2Sentence,
          detected: [value1, ''],
          reason: `The technical term “${entry.english}” appears as “${value1}” in Translation 1 but no verified ${language} equivalent was detected in Translation 2. It may be omitted or paraphrased.`,
          recommendation: 'Check the sentence manually; restore the technical term if it was dropped.',
        });
        break;
      }

      if (!value1 && value2) {
        issues.push({
          id: `${entry.id}-s${index}-missing1`,
          category: 'Missing terminology',
          term: entry.english,
          severity: 'Review',
          sentenceIndex: index,
          sourceSentence,
          translation1Sentence: t1Sentence,
          translation2Sentence: t2Sentence,
          detected: ['', value2],
          reason: `The technical term “${entry.english}” appears as “${value2}” in Translation 2 but no verified ${language} equivalent was detected in Translation 1. It may be omitted or paraphrased.`,
          recommendation: 'Check the sentence manually; restore the technical term if it was dropped.',
        });
        break;
      }
    }
  });

  return issues;
}

function crossPassageIssues({ passageId, targetLanguage, glossary, history }) {
  if (!Array.isArray(history) || !history.length) return [];
  const earlier = new Map();

  history.forEach((run) => {
    if (!run || run.passageId === passageId) return;
    if (run.targetLanguage !== targetLanguage) return;
    (run.glossary || []).forEach((entry) => {
      [entry.translation1, entry.translation2].filter(Boolean).forEach((value) => {
        if (!earlier.has(entry.english)) earlier.set(entry.english, []);
        const values = earlier.get(entry.english);
        if (!values.includes(value)) values.push(value);
      });
    });
  });

  const issues = [];
  glossary.forEach((entry) => {
    const previous = earlier.get(entry.english);
    if (!previous?.length) return;
    const current = [entry.translation1, entry.translation2].filter(Boolean);
    const conflicting = current.find((value) => !previous.includes(value));
    if (!conflicting) return;
    issues.push({
      id: `${entry.id}-cross`,
      category: 'Cross-passage terminology',
      term: entry.english,
      severity: 'Review',
      sentenceIndex: 0,
      sourceSentence: '',
      translation1Sentence: '',
      translation2Sentence: '',
      detected: [...previous, conflicting],
      reason: `Earlier reviewed passages in ${languageName(targetLanguage)} used ${previous
        .map((value) => `“${value}”`)
        .join(', ')} for “${entry.english}”, while this passage uses “${conflicting}”. Terminology should stay consistent across the curriculum.`,
      recommendation: 'Confirm the preferred curriculum term and align both passages with it.',
    });
  });

  return issues.slice(0, 5);
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

export function analyzePassage({
  passageId = 'CUSTOM-001',
  title = 'Untitled passage',
  topic = 'Custom',
  source = '',
  targetLanguage = 'ta',
  translations = [],
  history = [],
} = {}) {
  const cleanSource = normalizeSpaces(source);
  const cleanTranslations = translations
    .filter((translation) => translation && String(translation.text || '').trim())
    .map((translation, index) => ({
      label: translation.label || `Translation ${index + 1}`,
      author: translation.author || 'Team',
      text: normalizeSpaces(translation.text),
    }));

  const sourceSentences = splitSentences(cleanSource);
  const translationSentences = cleanTranslations.map((translation) =>
    splitSentences(translation.text)
  );

  cleanTranslations.forEach((translation, index) => {
    translation.sentences = translationSentences[index];
  });

  const terms = extractTerms(cleanSource);
  const glossary = terms.map((term) =>
    buildGlossaryEntry(term, targetLanguage, cleanTranslations)
  );

  const numberResult = analyzeNumbers(cleanSource, cleanTranslations, sourceSentences);
  const issues = [
    ...terminologyIssues(glossary, sourceSentences, translationSentences, targetLanguage),
    ...numberResult.issues,
    ...crossPassageIssues({ passageId, targetLanguage, glossary, history }),
  ].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const counts = { Critical: 0, Warning: 0, Review: 0 };
  issues.forEach((issue) => {
    counts[issue.severity] = (counts[issue.severity] || 0) + 1;
  });

  const consistentTerms = glossary.filter((entry) => entry.consistency === 'Consistent').length;
  const consistencyPct = glossary.length
    ? Math.round((consistentTerms / glossary.length) * 100)
    : 0;
  const numericMismatches = issues.filter((issue) => issue.category === 'Numerical value').length;

  return {
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
    passageId,
    title,
    topic,
    sourceLanguage: 'English',
    targetLanguage,
    source: cleanSource,
    translations: cleanTranslations,
    glossary,
    issues,
    numeric: {
      rows: numberResult.rows,
      sourceTokens: numberResult.sourceTokens,
      translations: numberResult.translations,
      limitations: numberResult.limitations,
    },
    metrics: {
      passages: 1,
      terms: glossary.length,
      consistentTerms,
      consistencyPct,
      totalIssues: issues.length,
      critical: counts.Critical,
      warning: counts.Warning,
      review: counts.Review,
      numericChecks: numberResult.rows.length,
      numericMismatches,
    },
    limitations: [
      ...numberResult.limitations,
      'Terminology matching uses a curated library; unlisted synonyms are reported as “Needs Review”, never auto-corrected.',
      'Sentence alignment falls back to proportional mapping when translations merge or split sentences.',
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Aggregations for dashboards                                         */
/* ------------------------------------------------------------------ */

export function aggregateHistory(history = []) {
  const reviews = Array.isArray(history) ? history.filter(Boolean) : [];
  const uniqueTerms = new Set();
  reviews.forEach((review) => {
    (review.glossary || []).forEach((entry) => uniqueTerms.add(entry.english));
  });

  const totals = reviews.reduce(
    (accumulator, review) => {
      const metrics = review.metrics || {};
      accumulator.translations += (review.translations || []).filter((translation) =>
        String(translation.text || '').trim()
      ).length;
      accumulator.critical += metrics.critical || 0;
      accumulator.warning += metrics.warning || 0;
      accumulator.review += metrics.review || 0;
      accumulator.terms += metrics.terms || 0;
      accumulator.consistencySum += metrics.consistencyPct || 0;
      if (review.glossary?.length) accumulator.glossaryReviews += 1;
      return accumulator;
    },
    {
      translations: 0,
      critical: 0,
      warning: 0,
      review: 0,
      terms: 0,
      consistencySum: 0,
      glossaryReviews: 0,
    }
  );

  return {
    reviews: reviews.length,
    uniqueTerms: uniqueTerms.size,
    translations: totals.translations,
    critical: totals.critical,
    warning: totals.warning,
    review: totals.review,
    terminologyIssues: reviews.reduce(
      (sum, review) =>
        sum +
        (review.issues || []).filter((issue) =>
          ['Terminology', 'Missing terminology', 'Cross-passage terminology'].includes(issue.category)
        ).length,
      0
    ),
    numericMismatches: reviews.reduce(
      (sum, review) =>
        sum +
        (review.issues || []).filter((issue) => issue.category === 'Numerical value').length,
      0
    ),
    avgConsistency: totals.glossaryReviews
      ? Math.round(totals.consistencySum / totals.glossaryReviews)
      : 0,
  };
}

export function severityCounts(issues = []) {
  return (Array.isArray(issues) ? issues : []).reduce(
    (accumulator, issue) => {
      accumulator[issue.severity] = (accumulator[issue.severity] || 0) + 1;
      return accumulator;
    },
    { Critical: 0, Warning: 0, Review: 0 }
  );
}

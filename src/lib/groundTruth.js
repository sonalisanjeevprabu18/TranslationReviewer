/**
 * Manually annotated ground truth for the bundled FLORES passages.
 *
 * Each passage was prepared with exactly two annotated findings per language:
 * one terminology variant switch and one changed numeric value. The pairs below
 * are the ones a bilingual annotator marked as the planted errors, so the
 * detector can be scored with precision, recall and F1 instead of being trusted.
 *
 * A label is matched against a detected finding by term headword (terminology)
 * or by the two numeric values (numeric). Custom passages have no annotations,
 * so detection accuracy is reported as unavailable for them.
 */

export const GROUND_TRUTH = {
  'FLORES-159-162': {
    term: 'Cave',
    pairs: {
      ta: ['குகை', 'கெபி'],
      hi: ['गुफाओं', 'कंदराओं'],
      kn: ['ಗುಹೆ', 'ಗವಿ'],
      te: ['గుహల', 'బిలాల'],
      ml: ['ഗുഹാ', 'കന്ദര'],
    },
    numeric: {
      source: '250',
      changed: '260',
      detail: '250 metres in the source becomes 260 metres in the alternate version.',
    },
  },
  'FLORES-47-50': {
    term: 'Emissions',
    pairs: {
      ta: ['வெளியேற்றத்தை', 'உமிழ்வை'],
      hi: ['उत्सर्जन', 'निकास'],
      kn: ['ಹೊರಸೂಸುವ', 'ವಿಸರ್ಜಿಸುವ'],
      te: ['ఉద్గారాలను', 'విడుదలలను'],
      ml: ['വിസർജ്ജനം', 'പുറന്തള്ളൽ'],
    },
    numeric: {
      source: '2020',
      changed: '2025',
      detail: 'The 2020 emissions target becomes 2025 in the alternate version.',
    },
  },
  'FLORES-851-854': {
    term: 'Cave',
    pairs: {
      ta: ['குகை', 'கெபி'],
      hi: ['गुफाओं', 'कंदराओं'],
      kn: ['ಗುಹ', 'ಗವಿ'],
      te: ['గుహ', 'బిలం'],
      ml: ['ഗുഹ', 'കന്ദര'],
    },
    numeric: {
      source: '5000',
      changed: '5500',
      detail: '5000 BC in the source becomes 5500 BC in the alternate version.',
    },
  },
  'FLORES-142-143': {
    term: 'Tsunami',
    pairs: {
      ta: ['சுனாமி', 'ஆழிப்பேரலை'],
      hi: ['सुनामी', 'त्सुनामी'],
      kn: ['ಸುನಾಮಿ', 'ತ್ಸುನಾಮಿ'],
      te: ['సునామీ', 'త్సునామి'],
      ml: ['സുനാമി', 'കടലോളം'],
    },
    numeric: {
      source: '6.5',
      changed: '6.8',
      detail: 'Magnitude 6.5 becomes 6.8 in the alternate version.',
    },
  },
};

export const hasGroundTruth = (passageId) => Boolean(GROUND_TRUTH[passageId]);

/** Annotated findings for one passage in one target language. */
export function goldLabelsFor(passageId, language) {
  const entry = GROUND_TRUTH[passageId];
  if (!entry) return [];

  const labels = [];
  const pair = entry.pairs?.[language];

  if (pair) {
    labels.push({
      id: `gold-term-${language}`,
      type: 'terminology',
      term: entry.term,
      expected: pair,
      detail: `${entry.term} is rendered as “${pair[0]}” in the reference and “${pair[1]}” in the alternate version.`,
    });
  }

  if (entry.numeric) {
    labels.push({
      id: `gold-num-${language}`,
      type: 'numeric',
      term: entry.numeric.source,
      expected: [entry.numeric.source, entry.numeric.changed],
      detail: entry.numeric.detail,
    });
  }

  return labels;
}

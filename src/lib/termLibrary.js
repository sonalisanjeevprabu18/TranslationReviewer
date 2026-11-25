/**
 * Verified terminology library for the five FLORES-200 review languages.
 *
 * English terms are taken from the FLORES-200 devtest source sentences used in
 * the passage library. Each variant list contains the forms that actually occur
 * in the published FLORES reference for that language, plus the alternate
 * equivalent used by the comparison version. Nothing here is machine-generated.
 */

export const LANGUAGES = [
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export const LANGUAGE_CODES = LANGUAGES.map((language) => language.code);

export const languageName = (code) =>
  LANGUAGES.find((lang) => lang.code === code)?.name || code || 'Unknown';

export const languageNative = (code) =>
  LANGUAGES.find((lang) => lang.code === code)?.native || '';

/**
 * Each term has an English headword, a short definition, a domain, optional
 * alternate English forms, and verified variants per target language. Variants
 * are ordered longest first at match time, so inflected forms are listed
 * explicitly and never rely on substring luck.
 */
export const TERM_LIBRARY = [
  {
    en: 'Cave',
    domain: 'Space science',
    definition:
      'A natural hollow or opening in the ground, such as the pit craters observed on Mars.',
    variants: {
      ta: ['குகைகளை', 'குகைகள்', 'குகை', 'கெபிகளை', 'கெபிகள்', 'கெபி'],
      hi: ['गुफाओं', 'गुफ़ाएँ', 'कंदराओं', 'कंदराएँ', 'गुफा', 'कंदरा'],
      kn: ['ಗುಹೆಗಳ', 'ಗುಹೆ', 'ಗವಿಗಳ', 'ಗವಿ'],
      te: ['గుహలు', 'గుహల', 'గుహ', 'బిలాలు', 'బిలాల', 'బిలం'],
      ml: ['കന്ദരങ്ങളായി', 'കന്ദരങ്ങളെ', 'ഗുഹകളായി', 'ഗുഹകളെ', 'ഗുഹകൾ', 'ഗുഹാ', 'ഗുഹ', 'കന്ദര'],
    },
  },
  {
    en: 'Temperature',
    domain: 'Space science',
    definition: 'A measure of how hot or cold a surface or environment is.',
    variants: {
      ta: ['வெப்பநிலைகளை', 'வெப்பநிலை', 'வெப்ப நிலை'],
      hi: ['तापमान'],
      kn: ['ತಾಪಮಾನದ', 'ತಾಪಮಾನ'],
      te: ['ఉష్ణోగ్రతలు', 'ఉష్ణోగ్రత'],
      ml: ['താപനിലയിലെ', 'താപനില'],
    },
  },
  {
    en: 'Surface',
    domain: 'Space science',
    definition: 'The outer or top layer of a planet, moon or other object.',
    variants: {
      ta: ['மேற்பரப்பில்', 'மேற்பரப்பு'],
      hi: ['सतहों', 'सतह'],
      kn: ['ಮೇಲ್ಮೈಯಲ್ಲಿ', 'ಮೇಲ್ಮೈ'],
      te: ['ఉపరితలం', 'ఉపరితల'],
      ml: ['പ്രതലത്തേക്കാൾ', 'പ്രതലം'],
    },
  },
  {
    en: 'Earth',
    domain: 'Space science',
    definition: 'The planet on which humans live.',
    variants: {
      ta: ['பூமியிலுள்ள', 'பூமி'],
      hi: ['पृथ्वी'],
      kn: ['ಭೂಮಿಯ', 'ಭೂಮಿ'],
      te: ['భూమిపై', 'భూమి'],
      ml: ['ഭൂമിയിലെ', 'ഭൂമി'],
    },
  },
  {
    en: 'Diameter',
    domain: 'Space science',
    definition: 'The width of a circle or sphere measured through its centre.',
    variants: {
      ta: ['விட்டம்'],
      hi: ['डायमीटर', 'व्यास'],
      kn: ['ವ್ಯಾಸವನ್ನು', 'ವ್ಯಾಸ'],
      te: ['వ్యాసమును', 'వ్యాసం'],
      ml: ['വ്യാസമുണ്ട്', 'വ്യാസം'],
    },
  },
  {
    en: 'Infrared',
    domain: 'Space science',
    definition:
      'Radiation with wavelengths longer than visible light, used in thermal imaging.',
    variants: {
      ta: ['இன்ஃப்ரா ரெட்'],
      hi: ['इन्फ़्रारेड', 'इन्फ्रारेड', 'अवरक्त'],
      kn: ['ಅತಿಗೆಂಪು'],
      te: ['ఇన్ఫ్రారెడ్', 'ఇన్ఫ్రా రెడ్'],
      ml: ['ഇൻഫ്രാ റെഡ്'],
    },
  },
  {
    en: 'Carbon dioxide',
    domain: 'Climate',
    definition:
      'A greenhouse gas released by burning fossil fuels and absorbed by plants.',
    variants: {
      ta: ['கார்பன் டை ஆக்சைடு'],
      hi: ['कार्बन डाइऑक्साइड'],
      kn: ['ಇಂಗಾಲದ ಡೈ ಆಕ್ಸೈಡ್'],
      te: ['కార్బన్ డయాక్సైడ్'],
      ml: ['കാർബൺ ഡൈ ഓക്സൈഡ്'],
    },
  },
  {
    en: 'Emissions',
    domain: 'Climate',
    definition: 'Gases or other substances released into the atmosphere.',
    variants: {
      ta: ['வெளியேற்றத்தை', 'வெளியேற்றம்', 'வெளியேற்ற', 'உமிழ்வை', 'உமிழ்வு', 'உமிழ்வ'],
      hi: ['उत्सर्जन', 'निकास'],
      kn: ['ಹೊರಸೂಸುವ', 'ವಿಸರ್ಜಿಸುವ', 'ಹೊರಸೂಸುವಿಕೆ', 'ವಿಸರ್ಜನೆ'],
      te: ['ఉద్గారాలను', 'ఉద్గారాలు', 'విడుదలలను', 'విడుదలలు'],
      ml: ['വിസർജ്ജനം', 'പുറന്തള്ളൽ'],
    },
  },
  {
    en: 'GDP',
    domain: 'Climate',
    definition:
      'Gross domestic product: the total value of goods and services produced by a country.',
    variants: {
      ta: ['ஜி. டி. பி'],
      hi: ['सकल घरेलू उत्पाद', 'जीडीपी'],
      kn: ['ಜಿಡಿಪಿ'],
      te: ['జిడిపి'],
      ml: ['ജിഡിപി', 'GDP'],
    },
  },
  {
    en: 'Economic output',
    domain: 'Climate',
    definition: 'The total goods and services produced by an economy.',
    variants: {
      ta: ['பொருளாதார உற்பத்தியின்', 'பொருளாதார உற்பத்தி'],
      hi: ['आर्थिक उत्पादन'],
      kn: ['ಆರ್ಥಿಕ ಉತ್ಪತ್ತಿಯ', 'ಆರ್ಥಿಕ ಉತ್ಪತ್ತಿ'],
      te: ['ఆర్ధిక ఉత్పత్తి', 'ఆర్థిక ఉత్పత్తి'],
      ml: ['സാമ്പത്തിക ഉൽ\u200cപാദനത്തെ', 'സാമ്പത്തിക ഉൽപാദനത്തെ', 'സാമ്പത്തിക ഉൽപാദനം'],
    },
  },
  {
    en: 'Developing countries',
    domain: 'Climate',
    definition: 'Countries whose economies are still industrialising and growing.',
    variants: {
      ta: ['வளரும் நாடுகள்', 'வளரும் நாடுக'],
      hi: ['विकासशील देशों', 'विकासशील देश'],
      kn: ['ಅಭಿವೃದ್ಧಿಶೀಲ ರಾಷ್ಟ್ರಗಳ', 'ಅಭಿವೃದ್ಧಿಶೀಲ ರಾಷ್ಟ್ರ'],
      te: ['అభివృద్ధి చెందుతున్న దేశాలు', 'అభివృద్ధి చెందుతున్న దేశాల'],
      ml: ['വികസ്വര രാജ്യങ്ങളെ', 'വികസ്വര രാജ്യങ്ങൾ'],
    },
  },
  {
    en: 'Tsunami',
    domain: 'Earth science',
    definition:
      'A series of large ocean waves caused by an underwater earthquake or other disturbance.',
    variants: {
      ta: ['சுனாமி', 'ஆழிப்பேரலை'],
      hi: ['सुनामी', 'त्सुनामी'],
      kn: ['ಸುನಾಮಿ', 'ತ್ಸುನಾಮಿ'],
      te: ['సునామీ', 'త్సునామి'],
      ml: ['സുനാമി', 'കടലോളം'],
    },
  },
  {
    en: 'Earthquake',
    domain: 'Earth science',
    definition:
      'A sudden shaking of the ground caused by movement within the Earth’s crust.',
    forms: ['earthquake', 'quake'],
    variants: {
      ta: ['நிலநடுக்கம்', 'நிலநடுக்க'],
      hi: ['भूकंप', 'भूकम्प'],
      kn: ['ಭೂಕಂಪವು', 'ಭೂಕಂಪ'],
      te: ['భూకంపం', 'భూకంప'],
      ml: ['ഭൂകമ്പം', 'ഭൂകമ്പ'],
    },
  },
  {
    en: 'Magnitude',
    domain: 'Earth science',
    definition: 'A measure of the energy released by an earthquake.',
    variants: {
      ta: ['அளவு'],
      hi: ['तीव्रता', 'परिमाण'],
      kn: ['ತೀವ್ರತೆಯನ್ನು', 'ತೀವ್ರತೆ'],
      te: ['తీవ్రత', 'పరిమాణం'],
      ml: ['തീവ്രത', 'പരിമാണം'],
    },
  },
  {
    en: 'Warning',
    domain: 'Earth science',
    definition: 'An official notice that a hazard is expected or already under way.',
    variants: {
      ta: ['எச்சரிக்கை'],
      hi: ['चेतावनी'],
      kn: ['ಎಚ್ಚರಿಕೆ'],
      te: ['హెచ్చరిక'],
      ml: ['മുന്നറിയിപ്പുകൾ', 'മുന്നറിയിപ്പ്'],
    },
  },
];

export const getTerm = (englishTerm) =>
  TERM_LIBRARY.find(
    (term) => term.en.toLowerCase() === String(englishTerm || '').toLowerCase()
  ) || null;

export const getVariants = (englishTerm, languageCode) => {
  const term = getTerm(englishTerm);
  if (!term) return [];
  return term.variants?.[languageCode] || [];
};

export const getForms = (term) => {
  if (!term) return [];
  const forms = [term.en, ...(term.forms || [])].filter(Boolean);
  return [...new Set(forms)];
};

export const TERM_DOMAINS = [...new Set(TERM_LIBRARY.map((term) => term.domain))];

export const termLanguageCoverage = TERM_LIBRARY.reduce((accumulator, term) => {
  Object.entries(term.variants || {}).forEach(([code, variants]) => {
    if (variants?.length) accumulator[code] = (accumulator[code] || 0) + 1;
  });
  return accumulator;
}, {});

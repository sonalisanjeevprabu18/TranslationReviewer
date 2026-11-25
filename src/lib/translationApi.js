/**
 * Free, keyless machine translation for the demo.
 *
 * Two public endpoints are used, both callable straight from the browser with
 * no account and no API key:
 *   1. Google's public translate web endpoint (client=gtx)
 *   2. MyMemory's free translation memory API (fallback)
 *
 * When a Groq API key is saved, a Groq-hosted model is tried first because its
 * output is noticeably better for Indic scripts; the keyless endpoints remain
 * the fallback.
 *
 * The review engine never calls this module. It only runs when a reviewer
 * presses a "Translate with API" button, and the result is treated as an
 * untrusted machine translation that a human still has to review.
 */

import { getGroqKey, groqTranslate } from './groq.js';
import { languageName } from './termLibrary.js';

const GOOGLE_ENDPOINT = 'https://translate.googleapis.com/translate_a/single';
const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

export const TRANSLATION_PROVIDERS = {
  groq: {
    id: 'groq',
    label: 'Groq hosted model',
    note: 'Your free Groq key · strongest Indic output',
  },
  google: {
    id: 'google',
    label: 'Google Translate public endpoint',
    note: 'Free public web endpoint · no API key',
  },
  mymemory: {
    id: 'mymemory',
    label: 'MyMemory translation memory',
    note: 'Free tier · no API key · 500 bytes per request',
  },
};

const REQUEST_TIMEOUT_MS = 25000;

class TranslationError extends Error {}

const normalize = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();

const splitLong = (text, maxLength) => {
  const pieces = [];
  let rest = text;
  while (rest.length > maxLength) {
    const window = rest.slice(0, maxLength);
    const cut = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf(' '));
    const index = cut > maxLength * 0.5 ? cut + 1 : maxLength;
    pieces.push(rest.slice(0, index));
    rest = rest.slice(index);
  }
  if (rest.trim()) pieces.push(rest);
  return pieces;
};

export const chunkForApi = (text, maxLength) => {
  const sentences = normalize(text).split(/(?<=[.!?।])\s+/).filter(Boolean);
  const chunks = [];
  let current = '';
  sentences.forEach((sentence) => {
    if (sentence.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = '';
      }
      chunks.push(...splitLong(sentence, maxLength));
      return;
    }
    if ((current + ' ' + sentence).trim().length > maxLength) {
      if (current) chunks.push(current);
      current = sentence;
      return;
    }
    current = `${current} ${sentence}`.trim();
  });
  if (current) chunks.push(current);
  return chunks;
};

async function requestJson(url, signal) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const abort = () => controller.abort();
  if (signal) signal.addEventListener('abort', abort, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new TranslationError(`Translation service returned HTTP ${response.status}.`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', abort);
  }
}

async function googleTranslate({ text, targetLanguage, sourceLanguage = 'en', signal }) {
  const chunks = chunkForApi(text, 1200);
  const output = [];
  for (const chunk of chunks) {
    const url =
      `${GOOGLE_ENDPOINT}?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}` +
      `&dt=t&q=${encodeURIComponent(chunk)}`;
    const data = await requestJson(url, signal);
    const segments = Array.isArray(data?.[0]) ? data[0] : [];
    const translated = segments.map((segment) => segment?.[0] || '').join('');
    if (!normalize(translated)) {
      throw new TranslationError('The translation service returned an empty result.');
    }
    output.push(normalize(translated));
  }
  return output.join(' ');
}

async function myMemoryTranslate({ text, targetLanguage, sourceLanguage = 'en', signal }) {
  const chunks = chunkForApi(text, 450);
  const output = [];
  for (const chunk of chunks) {
    const url =
      `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(chunk)}` +
      `&langpair=${sourceLanguage}|${targetLanguage}`;
    const data = await requestJson(url, signal);
    const translated = normalize(data?.responseData?.translatedText);
    if (data?.quotaFinished || /MYMEMORY WARNING/i.test(translated)) {
      throw new TranslationError('The free MyMemory quota for today has been used up.');
    }
    if (Number(data?.responseStatus) !== 200 || !translated) {
      throw new TranslationError(data?.responseDetails || 'MyMemory returned no translation.');
    }
    output.push(translated);
  }
  return output.join(' ');
}

/**
 * Translate an English passage into one of the five review languages.
 * Returns { text, provider, providerLabel } or throws a readable Error.
 */
export async function translatePassage({ text, targetLanguage, sourceLanguage = 'en', signal }) {
  const source = normalize(text);
  if (source.length < 3) {
    throw new TranslationError('Add an English source passage first.');
  }
  if (!targetLanguage) {
    throw new TranslationError('Choose a target language first.');
  }

  const attempts = [];
  if (getGroqKey()) {
    attempts.push({
      id: 'groq',
      run: ({ text, targetLanguage, signal }) =>
        groqTranslate({
          text,
          targetLanguage,
          targetName: languageName(targetLanguage),
          signal,
        }),
    });
  }
  attempts.push(
    { id: 'google', run: googleTranslate },
    { id: 'mymemory', run: myMemoryTranslate }
  );

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const translated = await attempt.run({ text: source, targetLanguage, sourceLanguage, signal });
      return {
        text: translated,
        provider: attempt.id,
        providerLabel: TRANSLATION_PROVIDERS[attempt.id].label,
      };
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      lastError = error;
    }
  }

  throw new Error(
    `The free translation services could not be reached (${lastError?.message || 'network error'}). ` +
      'Paste a translation manually, or run the review on the passages already loaded.'
  );
}

export { TranslationError };

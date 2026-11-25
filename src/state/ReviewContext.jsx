import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  SAMPLE_PASSAGES,
  emptyWorkspace,
  getSamplePassage,
  workspaceFromPassage,
} from '../lib/samplePassages.js';
import { analyzePassage } from '../lib/analysis.js';

const HISTORY_KEY = 'eduterm.reviewer.history.v3';
const LEGACY_HISTORY_KEYS = ['eduterm.reviewer.history.v1', 'eduterm.reviewer.history.v2'];
const MAX_HISTORY = 12;

const loadHistory = () => {
  try {
    LEGACY_HISTORY_KEYS.forEach((key) => window.localStorage.removeItem(key));
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && entry.metrics && Array.isArray(entry.issues));
  } catch {
    return [];
  }
};

const persistHistory = (history) => {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    /* storage is optional */
  }
};

const ReviewContext = createContext(null);

export function ReviewProvider({ children }) {
  const [dataset, setDataset] = useState(SAMPLE_PASSAGES);
  const [selectedIds, setSelectedIds] = useState(['FLORES-159-162']);
  const [workspace, setWorkspace] = useState(() => workspaceFromPassage(SAMPLE_PASSAGES[0]));
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState(loadHistory);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewedIssueIds, setReviewedIssueIds] = useState([]);

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]
    );
  }, []);

  const addCustomPassage = useCallback((passage) => {
    setDataset((previous) => [passage, ...previous]);
    setSelectedIds((previous) =>
      previous.includes(passage.id) ? previous : [passage.id, ...previous]
    );
  }, []);

  const openPassageInWorkspace = useCallback((passage, languageCode) => {
    setWorkspace(workspaceFromPassage(passage, languageCode));
    setError('');
    setAnalysis(null);
    setReviewedIssueIds([]);
    setSelectedIds((previous) =>
      previous.includes(passage.id) ? previous : [passage.id, ...previous]
    );
  }, []);

  const loadSample = useCallback((sampleId, languageCode = 'ta') => {
    const passage = getSamplePassage(sampleId || 'FLORES-159-162');
    if (!passage) return;
    setWorkspace(workspaceFromPassage(passage, languageCode));
    setError('');
    setAnalysis(null);
    setReviewedIssueIds([]);
  }, []);

  const updateField = useCallback((field, value) => {
    setWorkspace((previous) => ({ ...previous, [field]: value }));
    setError('');
  }, []);

  const setTranslationText = useCallback((index, text) => {
    setWorkspace((previous) => {
      const translations = previous.translations.map((translation, translationIndex) =>
        translationIndex === index ? { ...translation, text } : translation
      );
      return { ...previous, translations };
    });
    setError('');
  }, []);

  const clearWorkspace = useCallback(() => {
    setWorkspace((previous) => emptyWorkspace(previous.targetLanguage));
    setAnalysis(null);
    setError('');
    setReviewedIssueIds([]);
  }, []);

  const runAnalysis = useCallback(() => {
    const source = workspace.source.trim();
    const filledTranslations = workspace.translations.filter(
      (translation) => translation.text.trim().length > 0
    );

    if (!source) {
      setError('Add an English source passage before running the review.');
      return false;
    }
    if (source.length < 20) {
      setError('The source passage is too short to analyse. Add at least 20 characters.');
      return false;
    }
    if (!filledTranslations.length) {
      setError('Add at least one translation. The engine does not generate translations.');
      return false;
    }

    setError('');
    setIsAnalyzing(true);

    window.setTimeout(() => {
      const result = analyzePassage({
        passageId: workspace.passageId || 'CUSTOM-001',
        title: workspace.title || 'Untitled passage',
        topic: workspace.topic || 'Custom',
        source: workspace.source,
        targetLanguage: workspace.targetLanguage,
        translations: workspace.translations,
        history,
      });
      setAnalysis(result);
      setHistory((previous) => {
        const next = [result, ...previous].slice(0, MAX_HISTORY);
        persistHistory(next);
        return next;
      });
      setReviewedIssueIds([]);
      setIsAnalyzing(false);
    }, 450);

    return true;
  }, [workspace, history]);

  const viewAnalysis = useCallback((review) => {
    if (!review) return;
    setAnalysis(review);
    setReviewedIssueIds([]);
    setWorkspace({
      passageId: review.passageId,
      title: review.title,
      topic: review.topic,
      source: review.source,
      targetLanguage: review.targetLanguage,
      translations: (review.translations || []).map((translation, index) => ({
        label: translation.label || `Translation ${index + 1}`,
        author: translation.author || 'Team',
        text: translation.text,
      })),
      loadedSampleId: null,
      isCustom: true,
    });
    setError('');
  }, []);

  const toggleReviewed = useCallback((issueId) => {
    setReviewedIssueIds((previous) =>
      previous.includes(issueId)
        ? previous.filter((id) => id !== issueId)
        : [...previous, issueId]
    );
  }, []);

  const value = useMemo(
    () => ({
      dataset,
      selectedIds,
      toggleSelect,
      addCustomPassage,
      workspace,
      updateField,
      setTranslationText,
      loadSample,
      openPassageInWorkspace,
      clearWorkspace,
      analysis,
      runAnalysis,
      history,
      viewAnalysis,
      error,
      isAnalyzing,
      reviewedIssueIds,
      toggleReviewed,
      samples: SAMPLE_PASSAGES,
    }),
    [
      dataset,
      selectedIds,
      toggleSelect,
      addCustomPassage,
      workspace,
      updateField,
      setTranslationText,
      loadSample,
      openPassageInWorkspace,
      clearWorkspace,
      analysis,
      runAnalysis,
      history,
      viewAnalysis,
      error,
      isAnalyzing,
      reviewedIssueIds,
      toggleReviewed,
    ]
  );

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

export function useReviewer() {
  const context = useContext(ReviewContext);
  if (!context) throw new Error('useReviewer must be used inside ReviewProvider');
  return context;
}

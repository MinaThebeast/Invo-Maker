import { useState } from 'react';
import { translateText } from '../services/aiAnalyticsService';
import Button from './ui/Button';
import { Languages, Loader2 } from 'lucide-react';

interface TranslationHelperProps {
  text: string;
  onTranslated: (translated: string) => void;
  sourceLanguage?: string;
}

const LANGUAGES = [
  { code: 'Spanish', name: 'Spanish' },
  { code: 'French', name: 'French' },
  { code: 'German', name: 'German' },
  { code: 'Italian', name: 'Italian' },
  { code: 'Portuguese', name: 'Portuguese' },
  { code: 'Chinese', name: 'Chinese' },
  { code: 'Japanese', name: 'Japanese' },
  { code: 'Korean', name: 'Korean' },
  { code: 'Arabic', name: 'Arabic' },
  { code: 'Russian', name: 'Russian' },
];

export default function TranslationHelper({
  text,
  onTranslated,
  sourceLanguage = 'English',
}: TranslationHelperProps) {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!targetLanguage || !text.trim()) return;

    setLoading(true);
    setError('');
    try {
      const translated = await translateText(text, targetLanguage, sourceLanguage);
      onTranslated(translated);
      setTargetLanguage('');
    } catch (err: any) {
      setError(err.message || 'Failed to translate');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Languages className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Translate:</span>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        >
          <option value="">Select language...</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.name}>
              {lang.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleTranslate}
          disabled={!targetLanguage || loading || !text.trim()}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Translate'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}


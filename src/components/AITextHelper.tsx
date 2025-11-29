import { useState } from 'react';
import { generateNotesOrTerms } from '../services/aiService';
import TranslationHelper from './TranslationHelper';
import Button from './ui/Button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AITextHelperProps {
  type: 'notes' | 'terms';
  value: string;
  onChange: (value: string) => void;
  context?: {
    invoiceAmount?: number;
    dueDate?: string;
    customerName?: string;
  };
}

export default function AITextHelper({
  type,
  value,
  onChange,
  context,
}: AITextHelperProps) {
  const [loading, setLoading] = useState(false);
  const [showToneOptions, setShowToneOptions] = useState(false);

  const handleGenerate = async (tone: 'polite' | 'professional' | 'firm' | 'friendly' = 'professional') => {
    setLoading(true);
    try {
      const generated = await generateNotesOrTerms(type, {
        ...context,
        tone,
      });
      onChange(generated);
      setShowToneOptions(false);
    } catch (error: any) {
      console.error('Error generating text:', error);
      alert('Failed to generate text. Make sure OpenAI API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 capitalize">
          {type}
        </label>
        <div className="flex items-center gap-2">
          <TranslationHelper
            text={value}
            onTranslated={onChange}
          />
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowToneOptions(!showToneOptions)}
              disabled={loading}
              className="text-xs"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1" />
              )}
              AI Assist
            </Button>
            {showToneOptions && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 min-w-[150px]">
                <div className="text-xs font-medium text-gray-700 mb-2">Select tone:</div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleGenerate('polite')}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Polite
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate('professional')}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate('firm')}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Firm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate('friendly')}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    Friendly
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


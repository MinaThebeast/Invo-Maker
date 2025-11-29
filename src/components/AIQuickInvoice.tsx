import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useInvoices } from '../hooks/useInvoices';
import { useSubscription } from '../hooks/useSubscription';
import { createInvoiceFromDescription } from '../services/aiService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import LoadingSpinner from './ui/LoadingSpinner';
import { useToast, ToastContainer } from './ui/ToastContainer';
import { Sparkles, Mic, MicOff, AlertCircle } from 'lucide-react';

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface AIQuickInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIQuickInvoice({ isOpen, onClose }: AIQuickInvoiceProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { createInvoice } = useInvoices();
  const { checkAction, trackUsage } = useSubscription();
  const { toasts, success, error: showError, removeToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setDescription((prev) => prev + finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          showError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          showError('Microphone permission denied. Please enable it in your browser settings.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [showError]);

  const startRecording = () => {
    if (!isSupported) {
      showError('Speech recognition is not supported in your browser');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        showError('Failed to start recording');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Check subscription limits
    const canCreate = await checkAction('aiInvoiceCreation');
    if (!canCreate.allowed) {
      setError(canCreate.reason || 'Subscription limit reached');
      showError(canCreate.reason || 'Subscription limit reached. Please upgrade your plan.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call AI service to parse description
      const aiResult = await createInvoiceFromDescription(
        description,
        customers.map((c) => ({ id: c.id, name: c.name })),
        products.map((p) => ({ id: p.id, name: p.name, price: p.price }))
      );

      // Calculate due date
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (aiResult.dueDays || 30));

      // Create invoice
      const invoice = await createInvoice({
        customer_id: aiResult.customerId,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'draft',
        items: aiResult.items.map((item) => ({
          product_id: item.productId,
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: 0,
          discount: 0,
          line_total: item.quantity * item.unitPrice,
        })),
        notes: aiResult.notes,
      });

      // Track AI usage
      await trackUsage('aiInvoiceCreation');
      success('Invoice created successfully!');

      // Navigate to invoice editor
      navigate(`/invoices/${invoice.id}/edit`);
      onClose();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create invoice from description';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Modal isOpen={isOpen} onClose={onClose} title="AI Quick Invoice" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Describe the invoice you want to create. For example:
              <br />
              <em className="text-gray-500">
                "Invoice John for 3 AC cleanings at $80 each and 1 filter replacement at $30, due in 10 days"
              </em>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{error}</p>
                {error.includes('limit') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      onClose();
                      navigate('/billing');
                    }}
                  >
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <Textarea
              label="Invoice Description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice John for 3 AC cleanings at $80 each and 1 filter at $30, due in 10 days"
              required
            />
            {isSupported && (
              <div className="absolute top-8 right-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? 'text-red-600 hover:text-red-700' : ''}
                  title={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-1" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-1" />
                      Voice
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span>Listening... Speak your invoice description</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !description.trim()}>
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}


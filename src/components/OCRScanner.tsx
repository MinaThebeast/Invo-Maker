import { useState, useRef } from 'react';
import { extractTextFromImage, parseInvoiceFromOCR } from '../services/ocrService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import LoadingSpinner from './ui/LoadingSpinner';
import { Upload, FileImage, X } from 'lucide-react';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExtract: (data: {
    vendorName?: string;
    date?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total?: number;
    tax?: number;
  }) => void;
}

export default function OCRScanner({ isOpen, onClose, onExtract }: OCRScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Extract text from image
      const ocrText = await extractTextFromImage(file);
      
      // Parse into structured data
      const parsedData = await parseInvoiceFromOCR(ocrText);
      
      onExtract(parsedData);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to extract invoice data from image');
      console.error('OCR error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan Invoice/Receipt" size="lg">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Upload an image of an invoice or receipt to extract data automatically.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Change Image
                </Button>
                <Button variant="outline" onClick={() => { setFile(null); setPreview(null); }}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileImage className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Supports JPG, PNG, PDF
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleExtract}
            disabled={!file || loading}
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Extracting...</span>
              </>
            ) : (
              <>
                <FileImage className="w-4 h-4 mr-2" />
                Extract Data
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}


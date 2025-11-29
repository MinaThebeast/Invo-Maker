import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      startScanner();
    } else if (!isOpen && scannerRef.current) {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setError('');
      setScanning(true);

      const scanner = new Html5Qrcode('barcode-scanner');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText);
          stopScanner();
          onClose();
        },
        (_errorMessage) => {
          // Scan error (ignore, it's normal during scanning)
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start camera');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setScanning(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Scan Barcode" size="md">
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
            <p className="mt-2 text-xs">
              Make sure you've granted camera permissions and are using HTTPS or localhost.
            </p>
          </div>
        )}

        <div className="relative">
          <div
            id="barcode-scanner"
            className="w-full rounded-lg overflow-hidden bg-black"
            style={{ minHeight: '300px' }}
          />
          {!scanning && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
              <div className="text-center text-white">
                <p className="mb-2">Initializing camera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 text-center">
          <p>Point your camera at a barcode to scan</p>
          <p className="text-xs mt-1">
            For best results, ensure good lighting and hold the barcode steady
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}


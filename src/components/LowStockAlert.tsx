import { useState, useEffect } from 'react';
import { getLowStockProducts, getLowStockAlert } from '../services/inventoryService';
import { Product } from '../types';
import { AlertTriangle, X } from 'lucide-react';
import Button from './ui/Button';

export default function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [alert, setAlert] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadLowStock = async () => {
      try {
        const products = await getLowStockProducts(10); // Threshold: 10 units
        setLowStockProducts(products);
        if (products.length > 0) {
          const alertText = await getLowStockAlert(products);
          setAlert(alertText);
        }
      } catch (error) {
        console.error('Error loading low stock products:', error);
      }
    };
    loadLowStock();
  }, []);

  if (dismissed || lowStockProducts.length === 0) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">Low Stock Alert</h3>
          <p className="text-sm text-amber-700">{alert}</p>
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissed(true)}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


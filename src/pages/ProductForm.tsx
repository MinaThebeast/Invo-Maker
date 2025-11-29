import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import BarcodeScanner from '../components/BarcodeScanner';
import { useToast, ToastContainer } from '../components/ui/ToastContainer';
import { uploadProductImage } from '../services/storageService';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { createProduct, updateProduct, products, loading: productsLoading } = useProducts();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, success, error: showError, removeToast } = useToast();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    type: 'product',
    description: '',
    price: 0,
    cost_price: undefined,
    taxable: true,
    tax_rate: undefined,
    unit: 'pcs',
    stock_qty: undefined,
    active: true,
  });

  useEffect(() => {
    if (id) {
      const product = products.find((p) => p.id === id);
      if (product) {
        setFormData(product);
        if (product.image_url) {
          // Use the stored image URL from the database
          setImagePreview(product.image_url);
        } else {
          setImagePreview(null);
        }
      }
    }
  }, [id, products]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size should be less than 5MB');
      return;
    }

    // Show preview immediately from file
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploadingImage(true);
    try {
      const productId = id || 'temp-' + Date.now();
      const imageUrl = await uploadProductImage(file, productId);
      setFormData({ ...formData, image_url: imageUrl });
      // Update preview to use the uploaded URL
      setImagePreview(imageUrl);
      success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image. Make sure storage buckets are set up in Supabase.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image_url: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    setFormData({ ...formData, barcode });
    setShowBarcodeScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await updateProduct(id, formData);
        success('Product updated successfully!');
      } else {
        await createProduct(formData as Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>);
        success('Product created successfully!');
      }
      // Small delay to show the notification before navigating
      setTimeout(() => {
        navigate('/products');
      }, 500);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save product';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 border border-gray-200 space-y-6">
        {/* Product Image */}
        <div className="border-b border-gray-200 pb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <div className="flex items-start gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 bg-white"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `;
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImage ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              {uploadingImage && (
                <div className="mt-2">
                  <LoadingSpinner />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Product Name"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Select
            label="Type"
            required
            value={formData.type || 'product'}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'product' | 'service' })}
            options={[
              { value: 'product', label: 'Product' },
              { value: 'service', label: 'Service' },
            ]}
          />
          <Input
            label="SKU"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Barcode
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.barcode || ''}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="Enter barcode or scan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBarcodeScanner(true)}
                title="Scan barcode with camera"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Input
            label="Category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <Input
            label="Unit"
            value={formData.unit || 'pcs'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Cost Price"
            type="number"
            step="0.01"
            min="0"
            value={formData.cost_price || ''}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value ? parseFloat(e.target.value) : undefined })}
          />
          <Input
            label="Stock Quantity"
            type="number"
            min="0"
            value={formData.stock_qty || ''}
            onChange={(e) => setFormData({ ...formData, stock_qty: e.target.value ? parseInt(e.target.value) : undefined })}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tax Settings
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.taxable}
                  onChange={(e) => setFormData({ ...formData, taxable: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Taxable</span>
              </label>
            </div>
            {formData.taxable && (
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                value={formData.tax_rate || ''}
                onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            )}
          </div>
        </div>
        <Textarea
          label="Description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : id ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={handleBarcodeScanned}
      />
      </div>
    </>
  );
}


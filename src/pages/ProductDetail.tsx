import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useProduct, useProducts } from '../hooks/useProducts';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProduct(id);
  const { deleteProduct } = useProducts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [_deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteProduct(id);
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${product?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Product Details
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Price</dt>
            <dd className="mt-1 text-sm text-gray-900">${product.price.toFixed(2)}</dd>
          </div>
          {product.cost_price && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Cost Price</dt>
              <dd className="mt-1 text-sm text-gray-900">
                ${product.cost_price.toFixed(2)}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">SKU</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.sku || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Barcode</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.barcode || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.category || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{product.type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Unit</dt>
            <dd className="mt-1 text-sm text-gray-900">{product.unit}</dd>
          </div>
          {product.stock_qty !== null && product.stock_qty !== undefined && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {product.stock_qty} {product.unit}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm font-medium text-gray-500">Taxable</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {product.taxable ? 'Yes' : 'No'}
            </dd>
          </div>
          {product.tax_rate && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Tax Rate</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.tax_rate}%</dd>
            </div>
          )}
          {product.description && (
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}


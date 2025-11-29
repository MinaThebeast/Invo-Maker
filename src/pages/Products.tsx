import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Products() {
  const { products, loading, searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery);
    }
  }, [searchQuery, searchProducts]);

  const filteredProducts = products;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => navigate('/products/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
          <p className="text-gray-500">
            {searchQuery ? 'No products found.' : 'No products yet. Add your first product!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            >
              {product.image_url && (
                <div className="mb-4 -mx-6 -mt-6">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.name}
                </h3>
                <span className="text-sm font-medium text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                {product.sku && <p>SKU: {product.sku}</p>}
                {product.barcode && <p>Barcode: {product.barcode}</p>}
                {product.category && <p>Category: {product.category}</p>}
                {product.type && (
                  <p className="capitalize">Type: {product.type}</p>
                )}
                {product.stock_qty !== null && product.stock_qty !== undefined && (
                  <p>Stock: {product.stock_qty} {product.unit}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


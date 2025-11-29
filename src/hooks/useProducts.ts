import { useState, useEffect, useCallback } from 'react';
import * as productService from '../services/productService';
import { Product } from '../types';

export function useProducts(includeInactive: boolean = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts(includeInactive);
      setProducts(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const searchProducts = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.searchProducts(query);
      setProducts(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductByBarcode = useCallback(async (barcode: string) => {
    try {
      setError(null);
      return await productService.getProductByBarcode(barcode);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const createProduct = useCallback(
    async (productData: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
      try {
        setError(null);
        const newProduct = await productService.createProduct(productData);
        setProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>>) => {
      try {
        setError(null);
        const updated = await productService.updateProduct(id, updates);
        setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        return updated;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    products,
    loading,
    error,
    refetch: loadProducts,
    searchProducts,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  return { product, loading, error };
}


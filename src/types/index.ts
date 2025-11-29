// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  currency: string;
  default_tax_rate: number;
  invoice_prefix: string;
  default_payment_terms: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  tax_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  sku?: string;
  barcode?: string;
  category?: string;
  type: 'product' | 'service';
  description?: string;
  price: number;
  cost_price?: number;
  taxable: boolean;
  tax_rate?: number;
  unit: string;
  stock_qty?: number;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  business_id: string;
  customer_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  currency: string;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  paid_amount: number;
  balance: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  discount: number;
  line_total: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Relations
  product?: Product;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'check' | 'other';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: string;
  business_id: string;
  name: string;
  rate: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// UI Types
export interface DashboardStats {
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  invoice_count: number;
  paid_count: number;
  overdue_count: number;
}


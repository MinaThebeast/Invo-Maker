// This file will be auto-generated from Supabase types
// For now, we'll define a basic structure
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          logo_url: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          currency: string;
          default_tax_rate: number;
          invoice_prefix: string;
          default_payment_terms: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          company: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          tax_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          sku: string | null;
          barcode: string | null;
          category: string | null;
          type: string;
          description: string | null;
          price: number;
          cost_price: number | null;
          taxable: boolean;
          tax_rate: number | null;
          unit: string;
          stock_qty: number | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string | null;
          invoice_number: string;
          status: string;
          issue_date: string;
          due_date: string;
          currency: string;
          subtotal: number;
          tax_total: number;
          discount_total: number;
          total: number;
          paid_amount: number;
          balance: number;
          notes: string | null;
          terms: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_id: string | null;
          name: string;
          description: string | null;
          quantity: number;
          unit_price: number;
          tax_rate: number;
          discount: number;
          line_total: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoice_items']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          reference: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
    };
  };
};


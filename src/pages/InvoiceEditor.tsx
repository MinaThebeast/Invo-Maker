import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, ScanLine, FileImage } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import { useInvoice, useInvoices } from '../hooks/useInvoices';
import { useBusiness } from '../hooks/useBusiness';
import { useSubscription } from '../hooks/useSubscription';
import { Invoice, InvoiceItem } from '../types';
import Button from '../components/ui/Button';
// import LoadingSpinner from '../components/ui/LoadingSpinner'; // Unused
import { useToast, ToastContainer } from '../components/ui/ToastContainer';
import BarcodeScanner from '../components/BarcodeScanner';
import OCRScanner from '../components/OCRScanner';
import AITextHelper from '../components/AITextHelper';
import Textarea from '../components/ui/Textarea';

export default function InvoiceEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { business } = useBusiness();
  const { invoice: existingInvoice } = useInvoice(id);
  const { createInvoice, updateInvoice } = useInvoices();

  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    customer_id: undefined,
    issue_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    currency: 'USD',
    shipping_fee: 0,
    extra_fees: 0,
  });
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const { toasts, success, error: showError, removeToast } = useToast();
  const { checkAction } = useSubscription();

  useEffect(() => {
    if (business) {
      setInvoice((prev) => ({
        ...prev,
        currency: business.currency || 'USD',
        due_date: new Date(
          Date.now() + (business.default_payment_terms || 30) * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0],
      }));
    }
  }, [business]);

  useEffect(() => {
    if (existingInvoice) {
      setInvoice({
        ...existingInvoice,
        shipping_fee: existingInvoice.shipping_fee || 0,
        extra_fees: existingInvoice.extra_fees || 0,
      });
      setItems(existingInvoice.items || []);
    }
  }, [existingInvoice]);

  const handleSave = async (status: 'draft' | 'sent' = 'draft') => {
    // Check subscription limits for new invoices only
    if (!id) {
      const canCreate = await checkAction('invoice');
      if (!canCreate.allowed) {
        showError(canCreate.reason || 'Invoice limit reached. Please upgrade your plan.');
        return;
      }
    }

    setSaving(true);
    try {
      const invoiceData = {
        customer_id: invoice.customer_id,
        issue_date: invoice.issue_date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || new Date().toISOString().split('T')[0],
        status,
        currency: invoice.currency || 'USD',
        notes: invoice.notes,
        terms: invoice.terms,
        shipping_fee: invoice.shipping_fee || 0,
        extra_fees: invoice.extra_fees || 0,
        items,
      };

      let savedInvoice: Invoice;

      if (id) {
        // Update existing invoice
        savedInvoice = await updateInvoice(id, invoiceData);
      } else {
        // Create new invoice
        savedInvoice = await createInvoice(invoiceData);
      }

      if (id) {
        success('Invoice updated successfully!');
      } else {
        success('Invoice created successfully!');
      }
      // Small delay to show the notification before navigating
      setTimeout(() => {
        navigate(`/invoices/${savedInvoice.id}`);
      }, 500);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      const errorMessage = error.message || 'Failed to save invoice';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems([...items, { quantity: 1, unit_price: 0, tax_rate: 0, discount: 0, line_total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate line total
    const quantity = newItems[index].quantity || 1;
    const unitPrice = newItems[index].unit_price || 0;
    const discount = newItems[index].discount || 0;
    const taxRate = newItems[index].tax_rate || 0;
    const subtotal = quantity * unitPrice - discount;
    const tax = (subtotal * taxRate) / 100;
    newItems[index].line_total = subtotal + tax;

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
        <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/invoices')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Invoice' : 'Create Invoice'}
        </h1>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave('sent')} disabled={saving}>
            <Send className="w-4 h-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              value={invoice.customer_id || ''}
              onChange={(e) => setInvoice({ ...invoice, customer_id: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowBarcodeScanner(true)}>
                  <ScanLine className="w-4 h-4 mr-2" />
                  Scan Barcode
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowOCRScanner(true)}>
                  <FileImage className="w-4 h-4 mr-2" />
                  Scan Invoice
                </Button>
                <Button variant="outline" size="sm" onClick={addItem}>
                  Add Item
                </Button>
              </div>
            </div>
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No items. Click "Add Item" to get started.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product
                        </label>
                        <select
                          value={item.product_id || ''}
                          onChange={(e) => {
                            const product = products.find((p) => p.id === e.target.value);
                            updateItem(index, 'product_id', e.target.value || undefined);
                            if (product) {
                              updateItem(index, 'name', product.name);
                              updateItem(index, 'unit_price', product.price);
                              updateItem(index, 'tax_rate', product.tax_rate || 0);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">Custom item</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Item name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity || 1}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0.01"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          value={item.unit_price || 0}
                          onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          value={item.tax_rate || 0}
                          onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount
                        </label>
                        <input
                          type="number"
                          value={item.discount || 0}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Total: ${(item.line_total || 0).toFixed(2)}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={invoice.issue_date || ''}
                  onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoice.due_date || ''}
                  onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={invoice.status || 'draft'}
                  onChange={(e) => setInvoice({ ...invoice, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Totals</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium">
                  ${items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Discount</dt>
                <dd className="text-sm font-medium text-red-600">
                  -${items.reduce((sum, item) => sum + (item.discount || 0), 0).toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Tax</dt>
                <dd className="text-sm font-medium">
                  ${items.reduce((sum, item) => {
                    const itemSubtotal = (item.quantity || 0) * (item.unit_price || 0) - (item.discount || 0);
                    const itemTax = (itemSubtotal * (item.tax_rate || 0)) / 100;
                    return sum + itemTax;
                  }, 0).toFixed(2)}
                </dd>
              </div>
              <div className="pt-2 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Shipping Fee</label>
                  <input
                    type="number"
                    value={invoice.shipping_fee || 0}
                    onChange={(e) => setInvoice({ ...invoice, shipping_fee: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Extra Fees</label>
                  <input
                    type="number"
                    value={invoice.extra_fees || 0}
                    onChange={(e) => setInvoice({ ...invoice, extra_fees: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <dt className="text-base font-semibold">Total</dt>
                <dd className="text-base font-bold">
                  ${(
                    items.reduce((sum, item) => sum + (item.line_total || 0), 0) +
                    (invoice.shipping_fee || 0) +
                    (invoice.extra_fees || 0)
                  ).toFixed(2)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Notes and Terms */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <AITextHelper
                  type="notes"
                  value={invoice.notes || ''}
                  onChange={(value) => setInvoice({ ...invoice, notes: value })}
                  context={{
                    invoiceAmount: items.reduce((sum, item) => sum + (item.line_total || 0), 0),
                    dueDate: invoice.due_date,
                    customerName: customers.find((c) => c.id === invoice.customer_id)?.name,
                  }}
                />
                <Textarea
                  rows={4}
                  value={invoice.notes || ''}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Additional notes for the customer..."
                />
              </div>
              <div className="space-y-2">
                <AITextHelper
                  type="terms"
                  value={invoice.terms || ''}
                  onChange={(value) => setInvoice({ ...invoice, terms: value })}
                  context={{
                    invoiceAmount: items.reduce((sum, item) => sum + (item.line_total || 0), 0),
                    dueDate: invoice.due_date,
                    customerName: customers.find((c) => c.id === invoice.customer_id)?.name,
                  }}
                />
                <Textarea
                  rows={4}
                  value={invoice.terms || ''}
                  onChange={(e) => setInvoice({ ...invoice, terms: e.target.value })}
                  placeholder="Payment terms and conditions..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onScan={async (barcode) => {
          // Find product by barcode
          const { getProductByBarcode } = await import('../services/productService');
          const product = await getProductByBarcode(barcode);
          
          if (product) {
            // Add product as line item
            const newItem: Partial<InvoiceItem> = {
              product_id: product.id,
              name: product.name,
              description: product.description,
              quantity: 1,
              unit_price: product.price,
              tax_rate: product.tax_rate || 0,
              discount: 0,
              line_total: product.price,
            };
            setItems([...items, newItem]);
          } else {
            alert(`Product with barcode "${barcode}" not found. Please add it to your products first.`);
          }
        }}
      />

      <OCRScanner
        isOpen={showOCRScanner}
        onClose={() => setShowOCRScanner(false)}
        onExtract={(data) => {
          // Add extracted items to invoice
          const newItems = data.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            tax_rate: data.tax ? (data.tax / (data.total || item.price)) * 100 : 0,
            discount: 0,
            line_total: item.quantity * item.price,
          }));
          setItems([...items, ...newItems]);

          // Update invoice date if available
          if (data.date) {
            setInvoice({ ...invoice, issue_date: data.date });
          }

          // Update notes with vendor info
          if (data.vendorName) {
            setInvoice({
              ...invoice,
              notes: `Scanned from ${data.vendorName} invoice${invoice.notes ? `\n\n${invoice.notes}` : ''}`,
            });
          }
        }}
      />
      </div>
    </>
  );
}


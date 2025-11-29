import { useState, useEffect, useRef } from 'react';
import * as businessService from '../services/businessService';
import { Business } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { uploadBusinessLogo } from '../services/storageService';
import { useToast, ToastContainer } from '../components/ui/ToastContainer';
import { Building2, Save, Upload, X } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Partial<Business>>({
    name: '',
    email: user?.email || '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    currency: 'USD',
    default_tax_rate: 0,
    invoice_prefix: 'INV',
    default_payment_terms: 30,
    auto_numbering: true,
    next_invoice_number: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isNewBusiness, setIsNewBusiness] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, success, error: showError, removeToast } = useToast();

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const data = await businessService.getBusiness();
      if (data) {
        setBusiness(data);
        setIsNewBusiness(false);
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      } else {
        setIsNewBusiness(true);
      }
    } catch (error) {
      console.error('Error loading business:', error);
      setIsNewBusiness(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB for logos)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo size should be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload logo
    setUploadingLogo(true);
    try {
      const businessId = business?.id || 'temp-' + Date.now();
      const logoUrl = await uploadBusinessLogo(file, businessId);
      setBusiness({ ...business, logo_url: logoUrl });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Make sure storage buckets are set up in Supabase.');
      setLogoPreview(business?.logo_url || null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setBusiness({ ...business, logo_url: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNewBusiness) {
        // Create new business
        const created = await businessService.createBusiness({
          name: business.name || 'My Business',
          email: business.email || user?.email || '',
          phone: business.phone,
          website: business.website,
          address: business.address,
          city: business.city,
          state: business.state,
          zip_code: business.zip_code,
          country: business.country || 'US',
          currency: business.currency || 'USD',
          default_tax_rate: business.default_tax_rate || 0,
          invoice_prefix: business.invoice_prefix || 'INV',
          default_payment_terms: business.default_payment_terms || 30,
          auto_numbering: business.auto_numbering !== undefined ? business.auto_numbering : true,
          next_invoice_number: business.next_invoice_number || 1,
        });
        setBusiness(created);
        setIsNewBusiness(false);
        success('Business profile created successfully!');
      } else {
        // Update existing business
        const updated = await businessService.updateBusiness(business);
        setBusiness(updated);
        success('Settings saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      if (error.code === '23503') {
        showError('Database error: Please ensure your user account is properly set up. Try logging out and back in.');
      } else {
        showError(error.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
  ];

  const countries = [
    'US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT',
    'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'IE', 'PT', 'GR', 'NZ', 'JP', 'CN',
    'IN', 'BR', 'MX', 'AR', 'CL', 'CO', 'ZA', 'AE', 'SG', 'MY', 'TH', 'PH',
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="space-y-6">
        <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewBusiness ? 'Create Business Profile' : 'Business Settings'}
        </h1>
      </div>

      {isNewBusiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Welcome!</strong> Let's set up your business profile. This information will be used on your invoices and documents.
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Business Name *"
                value={business.name || ''}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                required
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                value={business.email || ''}
                onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                placeholder="contact@business.com"
              />
            </div>
            <div>
              <Input
                label="Phone"
                type="tel"
                value={business.phone || ''}
                onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                label="Website"
                type="url"
                value={business.website || ''}
                onChange={(e) => setBusiness({ ...business, website: e.target.value })}
                placeholder="https://www.business.com"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Street Address"
                value={business.address || ''}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Input
                label="City"
                value={business.city || ''}
                onChange={(e) => setBusiness({ ...business, city: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div>
              <Input
                label="State/Province"
                value={business.state || ''}
                onChange={(e) => setBusiness({ ...business, state: e.target.value })}
                placeholder="NY"
              />
            </div>
            <div>
              <Input
                label="ZIP/Postal Code"
                value={business.zip_code || ''}
                onChange={(e) => setBusiness({ ...business, zip_code: e.target.value })}
                placeholder="10001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <select
                value={business.country || 'US'}
                onChange={(e) => setBusiness({ ...business, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Invoice Prefix"
                value={business.invoice_prefix || 'INV'}
                onChange={(e) => setBusiness({ ...business, invoice_prefix: e.target.value })}
                placeholder="INV"
              />
              <p className="text-xs text-gray-500 mt-1">Prefix for invoice numbers (e.g., INV-001)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={business.currency || 'USD'}
                onChange={(e) => setBusiness({ ...business, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="auto_numbering"
                  checked={business.auto_numbering !== undefined ? business.auto_numbering : true}
                  onChange={(e) => setBusiness({ ...business, auto_numbering: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="auto_numbering" className="text-sm font-medium text-gray-700">
                  Enable Auto-numbering
                </label>
              </div>
              <p className="text-xs text-gray-500">Automatically generate sequential invoice numbers</p>
            </div>
            <div>
              <Input
                label="Next Invoice Number"
                type="number"
                value={business.next_invoice_number || 1}
                onChange={(e) =>
                  setBusiness({ ...business, next_invoice_number: parseInt(e.target.value) || 1 })
                }
                min="1"
                disabled={!business.auto_numbering}
              />
              <p className="text-xs text-gray-500 mt-1">Starting number for auto-numbering</p>
            </div>
            <div>
              <Input
                label="Default Tax Rate (%)"
                type="number"
                value={business.default_tax_rate || 0}
                onChange={(e) =>
                  setBusiness({ ...business, default_tax_rate: parseFloat(e.target.value) || 0 })
                }
                min="0"
                max="100"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">Default tax rate applied to new invoices</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Due Date
              </label>
              <select
                value={business.default_payment_terms || 30}
                onChange={(e) =>
                  setBusiness({ ...business, default_payment_terms: parseInt(e.target.value) || 30 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="7">Net 7 (7 days)</option>
                <option value="15">Net 15 (15 days)</option>
                <option value="30">Net 30 (30 days)</option>
                <option value="45">Net 45 (45 days)</option>
                <option value="60">Net 60 (60 days)</option>
                <option value="90">Net 90 (90 days)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Default payment terms for new invoices</p>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h2>
          <div className="flex items-start gap-4">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Business logo"
                  className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white p-2"
                />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingLogo ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
              </label>
              {uploadingLogo && (
                <div className="mt-2">
                  <LoadingSpinner />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or SVG. Max 2MB. Recommended: 200x200px or larger.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNewBusiness ? 'Create Business Profile' : 'Save Settings'}
              </>
            )}
          </Button>
        </div>
      </form>
      </div>
    </>
  );
}

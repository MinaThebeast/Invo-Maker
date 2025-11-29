import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuth } from './hooks/useAuth';
import { useRevenueCat } from './hooks/useRevenueCat';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import CustomerForm from './pages/CustomerForm';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceEditor from './pages/InvoiceEditor';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();
  
  // Initialize RevenueCat (automatically identifies user after login)
  useRevenueCat();

  // Initialize StatusBar for mobile
  useEffect(() => {
    const initStatusBar = async () => {
      try {
        // Check if Capacitor is available (native platform)
        const { Capacitor } = await import('@capacitor/core');
        if (Capacitor.isNativePlatform()) {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }
      } catch (error) {
        // StatusBar plugin not available (web environment)
        // Silently fail in web environment - don't log undefined errors
        if (error && import.meta.env.DEV) {
          console.debug('StatusBar initialization skipped (web environment)');
        }
      }
    };
    initStatusBar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/"
        element={user ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/new" element={<InvoiceEditor />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="invoices/:id/edit" element={<InvoiceEditor />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;


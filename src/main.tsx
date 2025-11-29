import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Aggressively unregister any existing service workers (for development)
if ('serviceWorker' in navigator) {
  // Unregister all registrations
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Service worker unregistered');
        }
      });
    });
  });
  
  // Also try to unregister by scope
  navigator.serviceWorker.getRegistration().then((registration) => {
    if (registration) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Service worker unregistered by scope');
        }
      });
    }
  });
  
  // Update event listener to prevent new registrations
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);


import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { AuthProvider } from './features/auth/AuthContext';
import { AccessibilityProvider } from './features/accessibility/AccessibilityContext';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Ignore registration error in restricted environments
    });
  });
}

// Capturar evento de instalación PWA desde el inicio (incluso antes de iniciar sesión)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as unknown as { __heraDeferredPrompt?: Event }).__heraDeferredPrompt = e;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AccessibilityProvider>
  </React.StrictMode>,
);

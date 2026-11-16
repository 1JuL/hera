import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWA_DISMISS_SESSION_KEY = 'hera_pwa_dismissed';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // No mostrar si ya está instalada como app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // No mostrar si ya se cerró en esta sesión de inicio de sesión
    try {
      if (sessionStorage.getItem(PWA_DISMISS_SESSION_KEY) === '1') return;
    } catch {
      // Ignore storage errors
    }

    // Recuperar evento capturado previamente (p. ej. mientras estaba en /login)
    const globalWin = window as unknown as { __heraDeferredPrompt?: BeforeInstallPromptEvent };
    if (globalWin.__heraDeferredPrompt) {
      setDeferredPrompt(globalWin.__heraDeferredPrompt);
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalWin.__heraDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar iOS Safari (no dispara beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIos && isSafari) {
      setShowIosHint(true);
      setVisible(true);
    }

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      globalWin.__heraDeferredPrompt = undefined;
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(PWA_DISMISS_SESSION_KEY, '1');
    } catch {
      // Ignore storage errors
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
    (window as unknown as { __heraDeferredPrompt?: BeforeInstallPromptEvent }).__heraDeferredPrompt = undefined;
  };

  if (!visible || (!deferredPrompt && !showIosHint)) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-xs z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div className="bg-[#163A2B] text-white rounded-xl p-2.5 sm:p-3 shadow-xl border border-[#86CEAB]/40 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/pwa-192x192.png"
            alt="HERA"
            className="w-8 h-8 rounded-lg shrink-0 border border-white/15"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight truncate">
              Instalar app HERA
            </h4>
            {showIosHint ? (
              <p className="text-[11px] text-[#D0E6DC] flex items-center gap-1 leading-tight mt-0.5">
                <Share className="w-3 h-3 text-[#86CEAB] shrink-0" />
                <span className="truncate">Compartir → Agregar a inicio</span>
              </p>
            ) : (
              <p className="text-[11px] text-[#D0E6DC] leading-tight truncate mt-0.5">
                Acceso rápido sin navegador
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!showIosHint && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#86CEAB] text-[#163A2B] hover:bg-[#9edbbc] border-none cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <Download className="w-3 h-3" />
              <span>Instalar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Cerrar sugerencia"
            title="Cerrar"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

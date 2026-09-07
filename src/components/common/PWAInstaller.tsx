'use client';

import React, { useEffect, useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado com sucesso:', reg.scope);
        })
        .catch((err) => {
          console.warn('Erro ao registrar Service Worker:', err);
        });
    }

    // 2. Detect Standalone Mode (already running as app)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install banner after 2.5s if not running standalone
      if (!standalone) {
        setTimeout(() => {
          const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
          if (!dismissed) {
            setShowBanner(true);
          }
        }, 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Detect app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setShowModal(false);
      setDeferredPrompt(null);
      console.log('Aplicativo Suculentos instalado com sucesso!');
    });

    // For iOS users, show banner if not standalone and not dismissed
    if (isIosDevice && !standalone) {
      setTimeout(() => {
        const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
        if (!dismissed) {
          setShowBanner(true);
        }
      }, 3000);
    }

    const handleOpenModalEvent = () => {
      setShowModal(true);
    };

    window.addEventListener('open-pwa-install-modal', handleOpenModalEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install-modal', handleOpenModalEvent);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowBanner(false);
          setShowModal(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao disparar prompt de instalação:', err);
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  // If already installed and running standalone, do not show banners
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Botão Fixo / Flutuante no Canto Inferior Esquerdo (ou no Header) */}
      <button
        id="pwa-install-badge-button"
        onClick={() => {
          if (deferredPrompt) {
            handleInstallClick();
          } else {
            setShowModal(true);
          }
        }}
        className="fixed bottom-20 md:bottom-5 left-4 z-40 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-950 text-white text-xs font-black shadow-xl shadow-stone-950/20 border border-stone-700/80 backdrop-blur-md active:scale-95 transition-all group"
        title="Instalar como aplicativo no celular ou computador"
      >
        <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white shadow-xs">
          🥟
        </div>
        <span className="hidden sm:inline text-amber-400">Instalar App</span>
        <span className="sm:hidden text-amber-400">App</span>
        <Download className="w-3.5 h-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Banner Flutuante no Topo ou Rodapé */}
      {showBanner && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-stone-950/95 text-white p-4 sm:p-5 rounded-3xl shadow-2xl shadow-stone-950/40 border border-amber-500/30 backdrop-blur-md animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-md shadow-orange-500/30 shrink-0 rotate-[-3deg]">
                🥟
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white font-display">
                    Instalar App Suculentos
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-stone-300 mt-0.5 leading-snug">
                  Crie um atalho na tela inicial para pedir mais rápido e sem barra de navegador!
                </p>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800">
            <button
              onClick={handleDismissBanner}
              className="w-1/3 py-2 text-stone-400 hover:text-white text-xs font-bold transition-colors"
            >
              Agora não
            </button>
            <button
              id="pwa-banner-install-confirm-button"
              onClick={handleInstallClick}
              className="w-2/3 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar Aplicativo</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal Visual com Instruções de Instalação para Todos os Dispositivos */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 z-10 animate-slide-up flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 p-6 text-white text-center relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30 text-3xl rotate-[-2deg]">
                🥟
              </div>

              <h3 className="text-xl font-black font-display text-amber-400">
                Instale o App Suculentos
              </h3>
              <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
                Tenha o cardápio, acompanhamento de pedidos e totem sempre à mão na tela do seu dispositivo.
              </p>
            </div>

            {/* Conteúdo de Instruções */}
            <div className="p-6 space-y-4 text-xs text-stone-700">
              {deferredPrompt ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <p className="font-bold text-amber-950 text-sm">
                    Seu navegador suporta instalação direta com 1 clique!
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-md shadow-orange-500/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Adicionar à Tela Inicial</span>
                  </button>
                </div>
              ) : isIOS ? (
                /* Instruções para iPhone / iPad */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5">
                    <Smartphone className="w-5 h-5 text-amber-600 shrink-0" />
                    <span className="font-extrabold text-amber-900 text-xs">
                      Instalação no iPhone / iPad (Safari):
                    </span>
                  </div>

                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        No Safari, toque no botão <strong>Compartilhar</strong> (ícone com quadrado e seta para cima <Share2 className="w-3.5 h-3.5 inline text-amber-600" /> na barra inferior).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-amber-600" />).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Toque em <strong>"Adicionar"</strong> no canto superior direito para criar o app.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Instruções para Android / Chrome / Edge / PC */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 flex items-center gap-2.5">
                    <Monitor className="w-5 h-5 text-stone-700 shrink-0" />
                    <span className="font-extrabold text-stone-900 text-xs">
                      Como criar o atalho no seu dispositivo:
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <span className="font-extrabold text-stone-900 block text-xs">
                        📱 No Celular Android (Chrome):
                      </span>
                      <p className="text-[11px] text-stone-600">
                        Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito do navegador e selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                      <span className="font-extrabold text-stone-900 block text-xs">
                        💻 No Computador (Chrome / Edge):
                      </span>
                      <p className="text-[11px] text-stone-600">
                        Clique no ícone de <strong>Instalar Aplicativo</strong> na barra de endereços (ao lado do botão de favoritos) para abrir em janela própria de app.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefícios */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vantagens do App:</span>
                </div>
                <p className="text-emerald-800">
                  • Abre em tela cheia sem barra de links.
                  <br />• Carregamento instantâneo e offline.
                  <br />• Alertas sonoros de pedidos e comanda em tempo real.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-stone-600 hover:text-stone-900 font-extrabold text-xs rounded-xl hover:bg-stone-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

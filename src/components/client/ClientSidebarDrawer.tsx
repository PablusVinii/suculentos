'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/format';
import { getStoreOpenStatus } from '@/utils/schedule';
import {
  X,
  Sparkles,
  UtensilsCrossed,
  CupSoda,
  ClipboardList,
  ChevronRight,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Lock,
  Flame,
  Star,
  QrCode,
  Check,
  Copy,
} from 'lucide-react';
import Link from 'next/link';

export const ClientSidebarDrawer: React.FC = () => {
  const {
    isSideMenuOpen,
    setIsSideMenuOpen,
    clientActiveTab,
    setClientActiveTab,
    getCartItemsCount,
    getCartTotal,
    setIsCartOpen,
    myOrderCodes,
    products,
    pixConfig,
    storeSchedule,
    showToast,
  } = useStore();

  const [copiedPix, setCopiedPix] = React.useState(false);

  if (!isSideMenuOpen) return null;

  const totalItems = getCartItemsCount();
  const totalAmount = getCartTotal();
  const storeStatus = getStoreOpenStatus(storeSchedule);

  const salgadosCount = products.filter((p) => p.category === 'salgado' && p.available).length;
  const bebidasCount = products.filter((p) => p.category === 'bebida' && p.available).length;

  const menuCategories = [
    {
      id: 'pastel' as const,
      label: 'Monte seu Pastel',
      sublabel: 'Massa fresca frita na hora com até 5 recheios',
      iconEmoji: '🥟',
      icon: Sparkles,
      badge: 'Carro-Chefe ⭐',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      activeColor: 'from-amber-500 to-orange-500 text-white',
    },
    {
      id: 'salgados' as const,
      label: 'Salgados Prontos',
      sublabel: 'Coxinhas cremosas, empadas, kibe e mais',
      iconEmoji: '🥐',
      icon: UtensilsCrossed,
      badge: `${salgadosCount} opções`,
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-200',
      activeColor: 'from-orange-500 to-amber-600 text-white',
    },
    {
      id: 'bebidas' as const,
      label: 'Bebidas Geladas',
      sublabel: 'Refrigerantes em lata, sucos naturais e água',
      iconEmoji: '🥤',
      icon: CupSoda,
      badge: `${bebidasCount} opções`,
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
      activeColor: 'from-sky-500 to-blue-600 text-white',
    },
    {
      id: 'meus_pedidos' as const,
      label: 'Acompanhar Pedido',
      sublabel: 'Consulte seu código de 6 dígitos em tempo real',
      iconEmoji: '📋',
      icon: ClipboardList,
      badge: myOrderCodes.length > 0 ? `${myOrderCodes.length} ativos` : 'Ao Vivo 🔴',
      badgeColor: myOrderCodes.length > 0 ? 'bg-red-500 text-white font-bold animate-pulse' : 'bg-stone-100 text-stone-700 border-stone-200',
      activeColor: 'from-stone-800 to-stone-900 text-white',
    },
  ];

  const handleSelectTab = (tabId: typeof clientActiveTab) => {
    setClientActiveTab(tabId);
    setIsSideMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCopyPixQuick = () => {
    const k = pixConfig?.key || 'pix@suculentospastelaria.com.br';
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(k).catch(() => {});
    }
    setCopiedPix(true);
    showToast('📋 Chave PIX copiada!');
    setTimeout(() => setCopiedPix(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop com Blur */}
      <div
        onClick={() => setIsSideMenuOpen(false)}
        className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
      />

      {/* Painel Lateral Deslizante */}
      <div className="fixed inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 animate-slide-right border-r border-stone-200">
        {/* Top Header do Menu Lateral */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/30 rotate-[-2deg]">
              🥟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-display text-amber-400">
                  Cardápio Suculentos
                </h2>
              </div>
              <p className="text-[11px] text-stone-400 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                ></span>
                <span>{storeStatus.isOpen ? 'Fritando na hora • Aberto' : 'Fechado no momento'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSideMenuOpen(false)}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Opções de Menu */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400 px-1">
            Selecione uma Seção do Cardápio:
          </div>

          <div className="space-y-2.5">
            {menuCategories.map((item) => {
              const isActive = clientActiveTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`side-menu-tab-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 group relative ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-sm ring-2 ring-amber-500/20 text-stone-900'
                      : 'bg-stone-50/70 hover:bg-stone-100/90 border-stone-200 text-stone-700'
                  }`}
                >
                  {/* Ícone Redondo */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'bg-white border border-stone-200 shadow-xs'
                    }`}
                  >
                    <span>{item.iconEmoji}</span>
                  </div>

                  {/* Informações da Categoria */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-stone-900 group-hover:text-amber-600 transition-colors">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {item.sublabel}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isActive ? 'text-amber-600 font-bold' : 'text-stone-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Atalho do Carrinho de Compras */}
          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={() => {
                setIsSideMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shadow-lg shadow-orange-500/20 active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left leading-tight">
                  <div className="font-black text-sm">Meu Pedido Atual</div>
                  <div className="text-xs text-amber-100">
                    {totalItems === 0
                      ? 'Nenhum item adicionado'
                      : `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black font-display">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="text-[10px] text-amber-100 uppercase tracking-wider font-bold">
                  Ver Sacola &gt;
                </div>
              </div>
            </button>
          </div>

          {/* Chave PIX Rápida */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-[11px] flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>Chave PIX Oficial:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyPixQuick}
                className="text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1"
              >
                {copiedPix ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <code className="block text-[11px] font-mono font-bold text-stone-700 truncate select-all">
              {pixConfig?.key || 'pix@suculentospastelaria.com.br'}
            </code>
          </div>
        </div>

        {/* Rodapé do Menu Lateral */}
        <div className="p-4 bg-stone-100/90 border-t border-stone-200 text-stone-500 text-xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setIsSideMenuOpen(false);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-store-hours-modal'));
              }
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Ver Horários da Semana</span>
          </button>

          <Link
            href="/admin"
            onClick={() => setIsSideMenuOpen(false)}
            className="flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-amber-700 transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>Acesso Cozinha</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

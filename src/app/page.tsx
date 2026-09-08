'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/common/Header';
import { PastelBuilder } from '@/components/client/PastelBuilder';
import { QuickProductList } from '@/components/client/QuickProductList';
import { MyOrdersTab } from '@/components/client/MyOrdersTab';
import { ClientSidebarDrawer } from '@/components/client/ClientSidebarDrawer';
import { CartDrawer } from '@/components/client/CartDrawer';
import { CheckoutModal } from '@/components/client/CheckoutModal';
import { OrderSuccessModal } from '@/components/client/OrderSuccessModal';
import { ClientStatusAlertModal } from '@/components/client/ClientStatusAlertModal';
import { StoreHoursModal } from '@/components/common/StoreHoursModal';
import { formatCurrency } from '@/utils/format';
import { getStoreOpenStatus } from '@/utils/schedule';
import { syncManager } from '@/utils/sync';
import { serverSync } from '@/utils/apiSync';
import { ArrowRight, Heart, CheckCircle2, Lock, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const {
    clientActiveTab,
    cart,
    setIsCartOpen,
    getCartTotal,
    getCartItemsCount,
    toastMessage,
    clearToast,
    storeSchedule,
  } = useStore();

  const [mounted, setMounted] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOpenModal = () => setIsHoursModalOpen(true);
    window.addEventListener('open-store-hours-modal', handleOpenModal);

    // Inicia sincronização na nuvem a cada 3 segundos
    serverSync.startPolling(3000);

    // Escuta atualizações de status vindas da cozinha/admin em tempo real local
    const unsubscribe = syncManager.subscribe((msg) => {
      if (msg.type === 'ORDER_STATUS_UPDATE') {
        const { myOrderCodes } = useStore.getState();
        const trackingCode = msg.order?.trackingCode || msg.order?.shortCode?.toString();
        const isMyOrder =
          (trackingCode && myOrderCodes.includes(trackingCode)) ||
          myOrderCodes.includes(msg.orderId) ||
          myOrderCodes.includes(msg.orderId.replace('PED-', ''));

        // Atualiza a lista de pedidos local na aba do cliente em tempo real
        useStore.setState((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === msg.orderId || (trackingCode && (o.trackingCode === trackingCode || o.shortCode?.toString() === trackingCode))
              ? { ...o, status: msg.status }
              : o
          );
          return { orders: updatedOrders };
        });

        // Se o pedido pertence a este cliente, abre o popup imediatamente!
        if (isMyOrder && msg.order) {
          useStore.getState().setClientStatusAlert({
            order: { ...msg.order, status: msg.status },
            newStatus: msg.status,
          });
        }
      } else if (msg.type === 'ORDER_DELETED') {
        useStore.setState((state) => ({
          orders: state.orders.filter((o) => o.id !== msg.orderId),
        }));
      } else if (msg.type === 'STOCK_UPDATE') {
        useStore.setState({
          ingredients: msg.ingredients,
          products: msg.products,
        });
      } else if (msg.type === 'PIX_UPDATE') {
        useStore.setState({ pixConfig: msg.pixConfig });
      } else if (msg.type === 'SCHEDULE_UPDATE') {
        useStore.setState({ storeSchedule: msg.storeSchedule });
      } else if (msg.type === 'USERS_UPDATE') {
        useStore.setState({ adminUsers: msg.users });
      }
    });

    return () => {
      window.removeEventListener('open-store-hours-modal', handleOpenModal);
      serverSync.stopPolling();
      unsubscribe();
    };
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl animate-bounce">
            🥟
          </div>
          <span className="font-extrabold text-stone-700 text-sm tracking-wide font-display">
            Carregando Suculentos...
          </span>
        </div>
      </div>
    );
  }

  const totalItems = getCartItemsCount();
  const totalAmount = getCartTotal();
  const storeStatus = getStoreOpenStatus(storeSchedule);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Header Focado no Cliente */}
      <Header />

      {/* Banner Informativo quando Fechado / Offline */}
      {!storeStatus.isOpen && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-950 to-stone-900 text-white px-4 py-3 border-b border-rose-800/80 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
              <div>
                <span className="font-black text-rose-300 mr-1.5">
                  🔴 No momento estamos fechados:
                </span>
                <span className="text-stone-200">
                  {storeStatus.subText}. Você pode explorar o cardápio e preparar seus pastéis normalmente!
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsHoursModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all shrink-0 border border-white/20 flex items-center gap-1.5 active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Horários da Semana</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Flutuante de Feedback */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-5 py-3 rounded-2xl shadow-xl shadow-stone-950/20 text-xs sm:text-sm font-bold flex items-center gap-2.5 backdrop-blur-md animate-slide-up border border-stone-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={clearToast}
            className="ml-2 text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conteúdo Principal do Cliente */}
      <main className="flex-1 pb-24 md:pb-12">
        {/* Telas do Cliente */}
        {clientActiveTab === 'pastel' && <PastelBuilder />}
        {clientActiveTab === 'salgados' && <QuickProductList category="salgado" />}
        {clientActiveTab === 'bebidas' && <QuickProductList category="bebida" />}
        {clientActiveTab === 'meus_pedidos' && <MyOrdersTab />}

        {/* Barra Flutuante Mobile do Carrinho */}
        {totalItems > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden animate-slide-up">
            <button
              id="mobile-cart-float-button"
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-xl shadow-orange-950/20 flex items-center justify-between font-black text-sm active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-xs">
                  {totalItems}
                </div>
                <span>Ver Meu Pedido ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
              </div>
              <div className="flex items-center gap-2 font-display text-base">
                <span>{formatCurrency(totalAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </main>

      {/* Modais Globais do Cliente */}
      <ClientSidebarDrawer />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <ClientStatusAlertModal />
      <StoreHoursModal
        isOpen={isHoursModalOpen}
        onClose={() => setIsHoursModalOpen(false)}
      />

      {/* Rodapé do Cliente com link discreto para a Área da Cozinha */}
      <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥟</span>
            <span className="font-extrabold text-stone-200 font-display text-sm">
              Suculentos Pastelaria
            </span>
            <span className="text-stone-600">•</span>
            <span>Massa Fresca & Lanches</span>
          </div>

          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 text-stone-500">
              Desenvolvido com <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </p>

            {/* Acesso Restrito da Equipe */}
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-amber-400 transition-colors text-[11px] font-semibold"
              title="Acesso restrito para funcionários e gerência"
            >
              <Lock className="w-3 h-3" />
              <span>Acesso Equipe / Cozinha</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


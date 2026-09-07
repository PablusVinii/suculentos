'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/common/Header';
import { CategoryTabs } from '@/components/client/CategoryTabs';
import { PastelBuilder } from '@/components/client/PastelBuilder';
import { QuickProductList } from '@/components/client/QuickProductList';
import { MyOrdersTab } from '@/components/client/MyOrdersTab';
import { CartDrawer } from '@/components/client/CartDrawer';
import { CheckoutModal } from '@/components/client/CheckoutModal';
import { OrderSuccessModal } from '@/components/client/OrderSuccessModal';
import { ClientStatusAlertModal } from '@/components/client/ClientStatusAlertModal';
import { formatCurrency } from '@/utils/format';
import { syncManager } from '@/utils/sync';
import { ArrowRight, Heart, CheckCircle2, Lock } from 'lucide-react';
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
  } = useStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Escuta atualizações de status vindas da cozinha/admin em tempo real
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
      } else if (msg.type === 'STOCK_UPDATE') {
        useStore.setState({
          ingredients: msg.ingredients,
          products: msg.products,
        });
      }
    });

    return () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Header Focado no Cliente */}
      <Header />

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
        {/* Navegação por Categorias */}
        <CategoryTabs />

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
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <ClientStatusAlertModal />

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

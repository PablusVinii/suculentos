'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { KitchenKanban } from './KitchenKanban';
import { StockManager } from './StockManager';
import { SalesStats } from './SalesStats';
import { UserManager } from './UserManager';
import { NewOrderAlertModal } from './NewOrderAlertModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { syncManager } from '@/utils/sync';
import { Order } from '@/types';
import {
  ChefHat,
  Kanban,
  SlidersHorizontal,
  BarChart3,
  Users,
  LogOut,
  ExternalLink,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';

export const AdminDashboard: React.FC = () => {
  const {
    adminActiveTab,
    setAdminActiveTab,
    adminUser,
    adminUsers,
    adminLogout,
    orders,
    soundEnabled,
    toggleSound,
    ingredients,
    products,
    setIncomingOrderAlert,
  } = useStore();

  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);

  // Escuta eventos em tempo real vindos da aba do cliente
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((msg) => {
      if (msg.type === 'NEW_ORDER') {
        const newOrder = msg.order;
        // Atualiza a lista de pedidos local se ainda não estiver inserida
        useStore.setState((state) => {
          const exists = state.orders.some((o) => o.id === newOrder.id);
          if (!exists) {
            return { orders: [newOrder, ...state.orders], incomingOrderAlert: newOrder };
          }
          return { incomingOrderAlert: newOrder };
        });
      } else if (msg.type === 'ORDER_STATUS_UPDATE') {
        useStore.setState((state) => ({
          orders: state.orders.map((o) =>
            o.id === msg.orderId ? { ...o, status: msg.status } : o
          ),
        }));
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

  const newOrdersCount = orders.filter((o) => o.status === 'novo').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparando').length;
  const activeOrdersCount = newOrdersCount + preparingOrdersCount;

  const unavailableCount =
    ingredients.filter((i) => !i.available).length + products.filter((p) => !p.available).length;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900">
      {/* Header Superior Administrativo */}
      <header className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Cargo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/20 rotate-[-2deg]">
                👨‍🍳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight font-display text-amber-400">
                    Suculentos Admin
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Ao Vivo 🔴
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  {adminUser?.name || 'Gerência / Cozinha'} • Painel Sincronizado
                </p>
              </div>
            </div>

            {/* Ações da Direita */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Toggle de Alerta Sonoro */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'Som ativado (alertas de novas comandas)' : 'Som desativado'}
                className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors hidden sm:flex items-center justify-center"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-stone-500" />
                )}
              </button>

              {/* Acessar Cardápio Público */}
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-bold transition-colors"
                title="Abrir a tela do cliente em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Ver Cardápio (Cliente)</span>
              </Link>

              {/* Sair / Logout */}
              <button
                id="admin-logout-button"
                onClick={adminLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-900 text-red-300 text-xs font-bold transition-all"
                title="Encerrar sessão administrativa"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Abas Administrativas */}
      <div className="bg-white border-b border-stone-200/90 sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              id="admin-tab-kanban"
              onClick={() => setAdminActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                adminActiveTab === 'kanban'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban de Pedidos</span>
              {activeOrdersCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    adminActiveTab === 'kanban' ? 'bg-white text-amber-700' : 'bg-red-500 text-white animate-pulse'
                  }`}
                >
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              id="admin-tab-stock"
              onClick={() => setAdminActiveTab('stock')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                adminActiveTab === 'stock'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Gestão de Estoque</span>
              {unavailableCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    adminActiveTab === 'stock'
                      ? 'bg-white text-amber-700'
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  {unavailableCount} pausados
                </span>
              )}
            </button>

            <button
              id="admin-tab-stats"
              onClick={() => setAdminActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                adminActiveTab === 'stats'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Vendas do Dia</span>
            </button>

            <button
              id="admin-tab-users"
              onClick={() => setAdminActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
                adminActiveTab === 'users'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-[1.02]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuários & Senhas</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  adminActiveTab === 'users' ? 'bg-white text-amber-800' : 'bg-stone-200 text-stone-700'
                }`}
              >
                {adminUsers.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 pb-16">
        {adminActiveTab === 'kanban' && <KitchenKanban />}
        {adminActiveTab === 'stock' && <StockManager />}
        {adminActiveTab === 'stats' && <SalesStats />}
        {adminActiveTab === 'users' && <UserManager />}
      </main>

      {/* Popup de Alerta de Novo Pedido em Tempo Real */}
      <NewOrderAlertModal onOpenReceipt={(order) => setSelectedPrintOrder(order)} />

      {/* Modal de Impressão Térmica */}
      <ThermalReceiptModal
        order={selectedPrintOrder}
        onClose={() => setSelectedPrintOrder(null)}
      />

      {/* Rodapé Administrativo */}
      <footer className="bg-stone-950 text-stone-500 py-4 border-t border-stone-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4">
          Suculentos Pastelaria • Painel Administrativo Sincronizado em Tempo Real • Sessão Ativa
        </div>
      </footer>
    </div>
  );
};

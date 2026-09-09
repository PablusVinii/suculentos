'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { KitchenKanban } from './KitchenKanban';
import { OrderHistoryAuditory } from './OrderHistoryAuditory';
import { StockManager } from './StockManager';
import { SalesStats } from './SalesStats';
import { UserManager } from './UserManager';
import { PixConfigManager } from './PixConfigManager';
import { ScheduleManager } from './ScheduleManager';
import { WaiterPosDashboard } from './WaiterPosDashboard';
import { NewOrderAlertModal } from './NewOrderAlertModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { syncManager } from '@/utils/sync';
import { Order } from '@/types';
import { getStoreOpenStatus } from '@/utils/schedule';
import {
  Menu,
  X,
  ChefHat,
  Kanban,
  History,
  SlidersHorizontal,
  BarChart3,
  Users,
  QrCode,
  Clock,
  LogOut,
  ExternalLink,
  Volume2,
  VolumeX,
  Download,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { serverSync } from '@/utils/apiSync';

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
    storeSchedule,
    setIncomingOrderAlert,
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);
  const storeStatus = getStoreOpenStatus(storeSchedule);

  // Escuta tecla ESC para fechar menu sanduíche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Escuta eventos em tempo real locais e sincroniza com a nuvem (Vercel / Multi-dispositivos)
  useEffect(() => {
    // Inicia sincronização na nuvem a cada 2 segundos
    serverSync.startPolling(2000);

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
      } else if (msg.type === 'USERS_UPDATE') {
        useStore.setState({ adminUsers: msg.users });
      }
    });

    return () => {
      serverSync.stopPolling();
      unsubscribe();
    };
  }, []);

  const newOrdersCount = orders.filter((o) => o.status === 'novo').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparando').length;
  const activeOrdersCount = newOrdersCount + preparingOrdersCount;

  const unavailableCount =
    ingredients.filter((i) => !i.available).length + products.filter((p) => !p.available).length;

  // Itens de navegação do Menu Sanduíche Lateral
  const navItems = [
    {
      id: 'pos' as const,
      label: 'PDV / Pedidos de Mesa',
      description: 'Lançar comanda na mesa ou balcão',
      icon: Zap,
      badge: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-orange-400 text-stone-950 animate-pulse">
          ⚡ NOVO
        </span>
      ),
    },
    {
      id: 'kanban' as const,
      label: 'Kanban da Cozinha',
      description: 'Fila e status de preparo ao vivo',
      icon: Kanban,
      badge:
        activeOrdersCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-red-500 text-white animate-pulse">
            {activeOrdersCount} pendente{activeOrdersCount > 1 ? 's' : ''}
          </span>
        ) : null,
    },
    {
      id: 'schedule' as const,
      label: 'Horários & Status',
      description: 'Abertura, fechamento e turnos',
      icon: Clock,
      badge: (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
            storeStatus.isOpen
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}
        >
          {storeStatus.isOpen ? '🟢 Aberto' : '🔴 Fechado'}
        </span>
      ),
    },
    {
      id: 'history' as const,
      label: 'Histórico & Auditoria',
      description: 'Comandas finalizadas e relatório',
      icon: History,
      badge: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
          {orders.length} pedidos
        </span>
      ),
    },
    {
      id: 'stock' as const,
      label: 'Gestão de Estoque',
      description: 'Pausa de itens e insumos',
      icon: SlidersHorizontal,
      badge:
        unavailableCount > 0 ? (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-500 text-white">
            {unavailableCount} pausados
          </span>
        ) : null,
    },
    {
      id: 'stats' as const,
      label: 'Vendas do Dia',
      description: 'Métricas, faturamento e totais',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'users' as const,
      label: 'Usuários & Senhas',
      description: 'Cargos e acessos da equipe',
      icon: Users,
      badge: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
          {adminUsers.length} membros
        </span>
      ),
    },
    {
      id: 'pix' as const,
      label: 'Chave PIX',
      description: 'Configuração do pagamento PIX',
      icon: QrCode,
      badge: (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          ⚡ Live
        </span>
      ),
    },
  ];

  const currentTabObj = navItems.find((item) => item.id === adminActiveTab) || navItems[0];
  const CurrentIcon = currentTabObj.icon;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900">
      {/* Header Superior Administrativo */}
      <header className="bg-stone-950 text-white border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Lado Esquerdo: Botão Menu Sanduíche + Logo + Título */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Botão Sanduíche Lateral */}
              <button
                id="admin-menu-toggle-button"
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm group"
                aria-label="Abrir Menu de Navegação Lateral"
                title="Abrir Menu Lateral (Kanban, Horários, Estoque...)"
              >
                <div className="relative">
                  <Menu className="w-6 h-6 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
                  {activeOrdersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  )}
                </div>
                <span className="text-xs font-black uppercase tracking-wider hidden sm:inline text-amber-400">
                  Menu
                </span>
              </button>

              {/* Logo & Identidade */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/20 rotate-[-2deg]">
                  👨‍🍳
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight font-display text-amber-400">
                      Suculentos Admin
                    </h1>
                    <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Nuvem Live
                    </span>

                    {/* Atalho de Status da Loja Aberta/Fechada no Header */}
                    <button
                      id="admin-header-status-badge"
                      onClick={() => setAdminActiveTab('schedule')}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-transform hover:scale-105 cursor-pointer ${
                        storeStatus.isOpen
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title="Clique para gerenciar os horários e status da loja"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                      ></span>
                      <span>{storeStatus.isOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
                      <Clock className="w-3 h-3 ml-0.5 opacity-70" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 hidden sm:block">
                    {adminUser?.name || 'Gerência / Cozinha'} • {storeStatus.subText}
                  </p>
                </div>
              </div>

              {/* Indicador do Módulo Ativo no Header (Desktop) */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden lg:flex items-center gap-2 ml-2 pl-3 border-l border-stone-800 text-xs text-stone-300 hover:text-white transition-colors cursor-pointer group"
                title="Clique para trocar de módulo no menu lateral"
              >
                <span className="text-stone-500 text-[11px] font-semibold">Visualizando:</span>
                <span className="px-3 py-1.5 rounded-xl bg-stone-900 group-hover:bg-stone-800 border border-stone-800 text-amber-300 flex items-center gap-2 font-black shadow-xs">
                  <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentTabObj.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>

            {/* Ações da Direita */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Atalho Rápido para Lançar Novo Pedido / PDV */}
              <button
                id="admin-header-quick-pos-button"
                onClick={() => setAdminActiveTab('pos')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm ${
                  adminActiveTab === 'pos'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 ring-2 ring-amber-400 scale-[1.02]'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 hover:text-white hover:scale-102'
                }`}
                title="Abrir PDV para lançar pedido de mesa ou balcão"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">+ Novo Pedido (Mesa)</span>
                <span className="sm:hidden">+ Pedido</span>
              </button>

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

              {/* Instalar App / Atalho */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
                  }
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all hover:scale-102"
                title="Instalar painel como aplicativo no tablet ou computador"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Instalar App</span>
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

      {/* ======================================================== */}
      {/* MENU SANDUÍCHE LATERAL (DRAWER / SIDEBAR)               */}
      {/* ======================================================== */}
      {/* Backdrop Escuro com Blur */}
      <div
        className={`fixed inset-0 bg-stone-950/75 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden={!isSidebarOpen}
      />

      {/* Gaveta Lateral Deslizante */}
      <aside
        id="admin-lateral-sidebar-drawer"
        className={`fixed top-0 left-0 bottom-0 w-84 max-w-[88vw] bg-stone-950 text-stone-100 z-50 shadow-2xl flex flex-col border-r border-stone-800/90 transform transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu Lateral de Navegação"
      >
        {/* Cabeçalho do Menu Lateral */}
        <div className="p-5 border-b border-stone-800/90 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md shadow-orange-500/20">
              👨‍🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-amber-400 text-base">
                  Suculentos Admin
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">
                Menu de Gestão & Cozinha
              </span>
            </div>
          </div>

          {/* Botão Fechar Menu */}
          <button
            id="admin-sidebar-close-button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Fechar menu"
            title="Fechar menu lateral (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card do Usuário Logado */}
        <div className="px-5 py-3.5 bg-stone-900/50 border-b border-stone-800/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs uppercase">
                {adminUser?.name ? adminUser.name.charAt(0) : 'G'}
              </div>
              <div>
                <p className="text-xs font-bold text-stone-200 line-clamp-1">
                  {adminUser?.name || 'Gerente Geral'}
                </p>
                <p className="text-[10px] text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Sessão Conectada
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-stone-800 text-amber-400 border border-stone-700">
              {adminUser?.role || 'Gerente'}
            </span>
          </div>
        </div>

        {/* Lista de Módulos / Abas de Navegação */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 no-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-black text-stone-500 uppercase tracking-wider flex items-center justify-between">
            <span>Módulos de Controle</span>
            <span className="text-[9px] text-amber-500/70 font-semibold">7 Seções</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminActiveTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setAdminActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-lg shadow-amber-500/20 scale-[1.01]'
                    : 'bg-stone-900/40 hover:bg-stone-900 border border-stone-800/70 text-stone-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-stone-950/15 text-stone-950'
                        : 'bg-stone-800 text-amber-400 group-hover:bg-stone-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">{item.label}</div>
                    <div
                      className={`text-[10px] ${
                        isActive ? 'text-stone-900/80' : 'text-stone-500 group-hover:text-stone-400'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge}
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isActive
                        ? 'text-stone-950 translate-x-0.5'
                        : 'text-stone-600 group-hover:text-stone-400 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Rodapé / Ações Rápidas no Menu Lateral */}
        <div className="p-4 border-t border-stone-800/90 bg-stone-950/90 space-y-2">
          {/* Alternar Som */}
          <button
            onClick={toggleSound}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-500" />
              )}
              <span>Som de Alertas</span>
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                soundEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-stone-800 text-stone-500'
              }`}
            >
              {soundEnabled ? 'Ativado' : 'Mudo'}
            </span>
          </button>

          {/* Ver Cardápio (Cliente) */}
          <Link
            href="/"
            target="_blank"
            onClick={() => setIsSidebarOpen(false)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs font-bold text-stone-300 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>Ver Cardápio do Cliente</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
          </Link>

          {/* Botão de Logout */}
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              adminLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-900/70 text-red-300 text-xs font-black transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Painel Admin</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 pb-16">
        {adminActiveTab === 'pos' && <WaiterPosDashboard />}
        {adminActiveTab === 'kanban' && <KitchenKanban />}
        {adminActiveTab === 'schedule' && <ScheduleManager />}
        {adminActiveTab === 'history' && <OrderHistoryAuditory />}
        {adminActiveTab === 'stock' && <StockManager />}
        {adminActiveTab === 'stats' && <SalesStats />}
        {adminActiveTab === 'users' && <UserManager />}
        {adminActiveTab === 'pix' && <PixConfigManager />}
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

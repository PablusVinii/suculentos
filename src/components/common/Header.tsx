'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { getStoreOpenStatus } from '@/utils/schedule';
import { ShoppingBag, Sparkles, ClipboardList, Download, Menu, Clock } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    setIsCartOpen,
    getCartItemsCount,
    getCartTotal,
    clientActiveTab,
    setClientActiveTab,
    myOrderCodes,
    setIsSideMenuOpen,
    storeSchedule,
  } = useStore();

  const totalItems = getCartItemsCount();
  const totalAmount = getCartTotal();
  const storeStatus = getStoreOpenStatus(storeSchedule);

  const handleOpenScheduleModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-store-hours-modal'));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Lado Esquerdo: Botão Menu Sanduíche + Logo & Identidade Visual */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão de Menu Sanduíche */}
            <button
              id="header-open-side-menu-button"
              onClick={() => setIsSideMenuOpen(true)}
              className="flex items-center justify-center p-2.5 sm:px-3 sm:py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 border border-amber-500/30 text-xs sm:text-sm font-extrabold transition-all hover:scale-105 cursor-pointer shadow-xs active:scale-95 gap-2"
              title="Abrir Cardápio"
              aria-label="Abrir Cardápio"
            >
              <Menu className="w-5 h-5 text-amber-600" />
              <span className="hidden sm:inline font-display font-black text-amber-900">Cardápio</span>
            </button>

            {/* Logo */}
            <div
              onClick={() => setClientActiveTab('pastel')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-2xl rotate-[-2deg] transition-transform group-hover:rotate-0">
                  🥟
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  {storeStatus.isOpen ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white"></span>
                  )}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-orange-600 to-amber-900 bg-clip-text text-transparent font-display">
                    Suculentos
                  </h1>
                  
                  {/* Badge de Horário de Funcionamento e Status Online/Offline */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenScheduleModal();
                    }}
                    title="Clique para ver todos os horários da semana"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border transition-transform hover:scale-105 cursor-pointer shadow-xs ${
                      storeStatus.isOpen
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        storeStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    ></span>
                    <span>{storeStatus.isOpen ? 'Aberto Agora' : 'Fechado'}</span>
                    <Clock className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500 font-medium hidden sm:flex items-center gap-1.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      storeStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-400'
                    }`}
                  ></span>
                  <span>
                    {storeStatus.isOpen
                      ? 'Pastéis crocantes e recheados na hora'
                      : storeStatus.subText}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação do Cliente */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Atalho de Instalação do App */}
            <button
              id="header-install-app-button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-pwa-install-modal'));
                }
              }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all hover:scale-102"
              title="Instalar como aplicativo no seu celular ou computador"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Instalar App</span>
            </button>

            {/* Atalho Acompanhar Pedido */}
            <button
              id="header-track-order-button"
              onClick={() => setClientActiveTab('meus_pedidos')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                clientActiveTab === 'meus_pedidos'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>Acompanhar Pedido</span>
              {myOrderCodes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                  {myOrderCodes.length}
                </span>
              )}
            </button>

            {/* Botão do Carrinho */}
            <button
              id="open-cart-button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/25 transition-all transform active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow border-2 border-white animate-bounce-subtle">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight">
                <span className="text-[10px] text-amber-100 font-medium uppercase tracking-wider">
                  Meu Pedido
                </span>
                <span className="text-xs font-extrabold">
                  {totalItems === 0
                    ? 'R$ 0,00'
                    : new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalAmount)}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

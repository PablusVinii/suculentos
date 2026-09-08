'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import {
  Kanban,
  History,
  SlidersHorizontal,
  BarChart3,
  ChefHat,
  Volume2,
  VolumeX,
  Sparkles,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    adminActiveTab,
    setAdminActiveTab,
    orders,
    soundEnabled,
    toggleSound,
    ingredients,
    products,
  } = useStore();

  const newOrdersCount = orders.filter((o) => o.status === 'novo').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'preparando').length;

  const unavailableIngredientsCount = ingredients.filter((i) => !i.available).length;
  const unavailableProductsCount = products.filter((p) => !p.available).length;
  const totalUnavailable = unavailableIngredientsCount + unavailableProductsCount;

  return (
    <div className="bg-stone-900 text-white border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
          {/* Título do Painel */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight font-display text-amber-400">
                  Painel da Cozinha & Atendimento
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Gerencie comandas em tempo real e controle o estoque instantaneamente.
              </p>
            </div>
          </div>

          {/* Abas Administrativas */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setAdminActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminActiveTab === 'kanban'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban de Pedidos</span>
              {(newOrdersCount > 0 || preparingOrdersCount > 0) && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    adminActiveTab === 'kanban' ? 'bg-stone-950 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {newOrdersCount + preparingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminActiveTab('stock')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminActiveTab === 'stock'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Gestão de Estoque</span>
              {totalUnavailable > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-orange-500 text-white">
                  {totalUnavailable} pausados
                </span>
              )}
            </button>

            <button
              onClick={() => setAdminActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminActiveTab === 'history'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histórico & Auditoria</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                adminActiveTab === 'stats'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Vendas do Dia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

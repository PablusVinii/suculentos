'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { Sparkles, UtensilsCrossed, CupSoda, ClipboardList, Menu } from 'lucide-react';

export const CategoryTabs: React.FC = () => {
  const { clientActiveTab, setClientActiveTab, orders, setIsSideMenuOpen } = useStore();

  const myOrdersCount = orders.length;

  const tabs = [
    {
      id: 'pastel' as const,
      label: 'Monte seu Pastel',
      sublabel: 'Carro-chefe da Casa',
      icon: Sparkles,
      iconEmoji: '🥟',
      badge: 'Monte do seu jeito',
      highlight: true,
    },
    {
      id: 'salgados' as const,
      label: 'Salgados Prontos',
      sublabel: 'Coxinhas, empadas e mais',
      icon: UtensilsCrossed,
      iconEmoji: '🥐',
    },
    {
      id: 'bebidas' as const,
      label: 'Bebidas Geladas',
      sublabel: 'Refrigerantes e sucos',
      icon: CupSoda,
      iconEmoji: '🥤',
    },
    {
      id: 'meus_pedidos' as const,
      label: 'Acompanhar Pedidos',
      sublabel: 'Status em tempo real',
      icon: ClipboardList,
      iconEmoji: '📋',
      count: myOrdersCount,
    },
  ];

  return (
    <div className="w-full bg-white border-b border-stone-200/80 sticky top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {/* Botão para Expandir Menu Lateral */}
          <button
            id="category-expand-side-menu-button"
            onClick={() => setIsSideMenuOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 text-white hover:from-amber-600 hover:to-orange-600 text-xs sm:text-sm font-extrabold transition-all shrink-0 shadow-md active:scale-95 group cursor-pointer"
            title="Expandir Menu Lateral com Todas as Opções"
          >
            <Menu className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-display">Menu Lateral</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          </button>

          <div className="h-6 w-px bg-stone-200 shrink-0 mx-1"></div>
          {tabs.map((tab) => {
            const isActive = clientActiveTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setClientActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl whitespace-nowrap text-sm font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                }`}
              >
                <span className="text-lg">{tab.iconEmoji}</span>
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span>{tab.label}</span>
                    {tab.badge && !isActive && (
                      <span className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                        {tab.badge}
                      </span>
                    )}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                          isActive
                            ? 'bg-white text-amber-700'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/format';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Flame,
  Award,
  Users,
} from 'lucide-react';

export const SalesStats: React.FC = () => {
  const { orders } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Pagamentos
  const pixRevenue = orders
    .filter((o) => o.paymentMethod === 'pix')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cardRevenue = orders
    .filter((o) => o.paymentMethod === 'credito' || o.paymentMethod === 'debito')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cashRevenue = orders
    .filter((o) => o.paymentMethod === 'dinheiro')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Contagem de sabores mais pedidos
  const flavorCounts: Record<string, number> = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.type === 'custom_pastel' && item.pastelDetails) {
        item.pastelDetails.flavors.forEach((flavor) => {
          flavorCounts[flavor.name] = (flavorCounts[flavor.name] || 0) + item.quantity;
        });
      }
    });
  });

  const sortedFlavors = Object.entries(flavorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-black text-stone-900 font-display">
          Painel de Vendas & Desempenho 📊
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
          Visão consolidada de faturamento, ticket médio e ingredientes mais procurados.
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Faturamento Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Vendas computadas em tempo real
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            {totalOrdersCount}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">Comandas geradas</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            {formatCurrency(averageTicket)}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">Gasto médio por cliente</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">Participação PIX</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            {totalRevenue > 0 ? `${Math.round((pixRevenue / totalRevenue) * 100)}%` : '0%'}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            {formatCurrency(pixRevenue)} via Pix
          </p>
        </div>
      </div>

      {/* Grid: Meios de Pagamento & Ranking de Sabores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Meios de Pagamento */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h3 className="text-base font-extrabold text-stone-900 font-display flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>Faturamento por Meio de Pagamento</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'PIX Instantâneo', value: pixRevenue, color: 'bg-emerald-500' },
              { label: 'Cartões de Débito / Crédito', value: cardRevenue, color: 'bg-blue-500' },
              { label: 'Dinheiro em Espécie', value: cashRevenue, color: 'bg-amber-500' },
            ].map((method) => {
              const pct = totalRevenue > 0 ? Math.round((method.value / totalRevenue) * 100) : 0;
              return (
                <div key={method.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-stone-700">{method.label}</span>
                    <span className="text-stone-900">
                      {formatCurrency(method.value)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${method.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking dos Sabores Mais Pedidos */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <h3 className="text-base font-extrabold text-stone-900 font-display flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-600" />
            <span>Top Sabores Mais Pedidos da Casa 🔥</span>
          </h3>

          {sortedFlavors.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">Nenhum pastel montado ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {sortedFlavors.map(([flavorName, count], idx) => (
                <div
                  key={flavorName}
                  className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-bold"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-500 text-white'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-800'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {idx + 1}º
                    </span>
                    <span className="text-stone-900 font-extrabold">{flavorName}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-stone-200 text-stone-700 text-xs">
                    {count} {count === 1 ? 'porção' : 'porções'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

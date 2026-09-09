'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Order, OrderStatus } from '@/types';
import { OrderCard } from './OrderCard';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { DeleteOrderConfirmModal } from './DeleteOrderConfirmModal';
import {
  Clock,
  ChefHat,
  BellRing,
  CheckCircle2,
  Search,
  PlusCircle,
  History,
  Sparkles,
  Zap,
} from 'lucide-react';

export const KitchenKanban: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, cancelOrder, createOrder, pastelSizes, ingredients, products } =
    useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDelivered, setShowDelivered] = useState(false);
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filtragem por busca
  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shortCode.toString().includes(searchTerm)
  );

  const newOrders = filteredOrders.filter((o) => o.status === 'novo');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparando');
  const readyOrders = filteredOrders.filter((o) => o.status === 'pronto');
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'entregue');

  // Gerador rápido de pedido de teste para demonstrar a cozinha funcionando
  const handleGenerateTestOrder = () => {
    const names = ['Lucas Ferreira', 'Beatriz Souza', 'Carlos Eduardo', 'Juliana Lima', 'Matheus Ribeiro'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const sampleFlavors = ingredients.filter((i) => i.category === 'flavor').slice(0, 4);
    const sampleComps = ingredients.filter((i) => i.category === 'complement').slice(0, 2);
    const sampleSauces = ingredients.filter((i) => i.category === 'sauce').slice(0, 1);

    useStore.setState((state) => ({
      cart: [
        {
          id: 'test_pastel_' + Date.now(),
          type: 'custom_pastel',
          pastelDetails: {
            size: state.pastelSizes[1], // 5 Sabores
            flavors: sampleFlavors,
            complements: sampleComps,
            sauces: sampleSauces,
            notes: 'Massa bem dourada e crocante!',
          },
          quantity: 1,
          unitPrice: 12.0,
          totalPrice: 12.0,
        },
        {
          id: 'test_coca_' + Date.now(),
          type: 'regular_product',
          product: state.products[5], // Coca-Cola
          quantity: 1,
          unitPrice: 6.0,
          totalPrice: 6.0,
        },
      ],
    }));

    createOrder({
      customerName: randomName,
      orderType: Math.random() > 0.5 ? 'balcao' : 'mesa',
      tableNumber: '02',
      paymentMethod: Math.random() > 0.5 ? 'pix' : 'dinheiro',
      changeFor: 50.0,
      notes: 'Pedido de teste rápido gerado pelo sistema.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Topo do Kanban com Busca e Ações Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-stone-900 font-display flex items-center gap-2">
            <span>Fluxo de Pedidos da Cozinha</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm">
            Avance os pedidos conforme a preparação para notificar o painel e os clientes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Busca */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente ou #senha..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl border border-stone-200 bg-white text-xs outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          {/* Botão de Lançar Pedido de Mesa / PDV */}
          <button
            onClick={() => useStore.getState().setAdminActiveTab('pos')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Abrir PDV para lançar pedido de mesa ou balcão"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>+ Lançar Pedido (PDV)</span>
          </button>

          {/* Botão de Pedido de Teste */}
          <button
            onClick={handleGenerateTestOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all"
            title="Simula a chegada de um novo pedido"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Simular Novo Pedido</span>
          </button>

          {/* Botão para abrir Auditoria Completa */}
          <button
            onClick={() => useStore.getState().setAdminActiveTab('history')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            title="Abrir Histórico Completo de Auditoria Diária"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Auditoria & Histórico</span>
          </button>
        </div>
      </div>

      {/* Grid das 3 Colunas Principais do Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* =========================================================================
            COLUNA 1: NOVOS PEDIDOS (PENDENTES)
        ========================================================================== */}
        <div className="bg-amber-50/50 rounded-3xl border border-amber-200/80 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider font-display">
                Novos Pedidos
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900">
              {newOrders.length}
            </span>
          </div>

          {newOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Nenhum pedido novo no momento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {newOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  onCancel={cancelOrder}
                  onDelete={(ord) => setOrderToDelete(ord)}
                  onPrint={(ord) => setSelectedPrintOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            COLUNA 2: EM PREPARAÇÃO (NA FRIGIDEIRA / BANCADA)
        ========================================================================== */}
        <div className="bg-blue-50/50 rounded-3xl border border-blue-200/80 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider font-display">
                Em Preparação
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-200 text-blue-950">
              {preparingOrders.length}
            </span>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Nenhum pastel na frigideira agora.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  onCancel={cancelOrder}
                  onDelete={(ord) => setOrderToDelete(ord)}
                  onPrint={(ord) => setSelectedPrintOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            COLUNA 3: PRONTOS PARA RETIRADA
        ========================================================================== */}
        <div className="bg-emerald-50/50 rounded-3xl border border-emerald-200/80 p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="font-extrabold text-stone-900 text-sm uppercase tracking-wider font-display">
                Prontos / Retirada
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-200 text-emerald-950">
              {readyOrders.length}
            </span>
          </div>

          {readyOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <BellRing className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Nenhum pedido aguardando entrega.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  onCancel={cancelOrder}
                  onDelete={(ord) => setOrderToDelete(ord)}
                  onPrint={(ord) => setSelectedPrintOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Histórico Opcional de Pedidos Entregues */}
      {showDelivered && (
        <div className="mt-10 p-6 bg-stone-100 rounded-3xl border border-stone-200 animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Pedidos Entregues / Concluídos ({deliveredOrders.length})</span>
            </h3>
            <button
              onClick={() => setShowDelivered(false)}
              className="text-xs text-stone-500 hover:text-stone-800 font-bold"
            >
              Fechar Histórico
            </button>
          </div>

          {deliveredOrders.length === 0 ? (
            <p className="text-xs text-stone-500 py-4">Nenhum pedido entregue ainda hoje.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  onCancel={cancelOrder}
                  onDelete={(ord) => setOrderToDelete(ord)}
                  onPrint={(ord) => setSelectedPrintOrder(ord)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Impressão Térmica */}
      <ThermalReceiptModal
        order={selectedPrintOrder}
        onClose={() => setSelectedPrintOrder(null)}
      />

      {/* Modal de Confirmação de Exclusão Irreversível */}
      <DeleteOrderConfirmModal
        order={orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={deleteOrder}
      />
    </div>
  );
};

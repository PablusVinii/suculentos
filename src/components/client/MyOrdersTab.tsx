'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatTime, getElapsedMinutes } from '@/utils/format';
import { Order } from '@/types';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  Search,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Truck,
  MapPin,
  Home,
  UserCheck,
} from 'lucide-react';

export const MyOrdersTab: React.FC = () => {
  const { orders, myOrderCodes, addMyOrderCode, setClientActiveTab } = useStore();
  const [inputCode, setInputCode] = useState('');
  const [searchedCode, setSearchedCode] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Pedidos deste cliente salvos na sessão/dispositivo local
  const mySavedOrders = (orders || []).filter((o) =>
    myOrderCodes.includes(o.trackingCode || o.shortCode.toString())
  );

  // Pedido pesquisado dinâmico e reativo a atualizações em tempo real
  const searchedOrder = searchedCode
    ? (orders || []).find(
        (o) =>
          (o.trackingCode && o.trackingCode === searchedCode) ||
          o.shortCode.toString() === searchedCode ||
          o.id === `PED-${searchedCode}`
      ) || null
    : null;

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().replace('#', '').replace('PED-', '');
    if (!cleanCode) return;

    setHasSearched(true);
    setSearchedCode(cleanCode);

    const found = (orders || []).find(
      (o) =>
        (o.trackingCode && o.trackingCode === cleanCode) ||
        o.shortCode.toString() === cleanCode ||
        o.id === `PED-${cleanCode}`
    );

    if (found) {
      addMyOrderCode(found.trackingCode || found.shortCode.toString());
    }
  };

  const getStatusInfo = (status: string, isDelivery = false) => {
    switch (status) {
      case 'novo':
        return {
          label: 'Aguardando Cozinha',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
          progress: 25,
          desc: 'Seu pedido foi registrado e está na fila para fritura.',
        };
      case 'preparando':
        return {
          label: 'Na Frigideira / Em Preparo',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ChefHat,
          progress: 65,
          desc: 'Massa fresca aberta, recheio caprichado e fritando na hora bem crocante!',
        };
      case 'pronto':
        return {
          label: isDelivery ? '🛵 Saiu para Entrega / A Caminho!' : 'Pronto para Retirada!',
          color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: isDelivery ? Truck : BellRing,
          progress: 90,
          desc: isDelivery
            ? 'O entregador já está a caminho com seu pedido quentinho! Fique no aguardo no portão ou interfone.'
            : 'Seu lanche está quentinho e pronto para você saborear!',
        };
      case 'entregue':
        return {
          label: isDelivery ? 'Entregue no Endereço' : 'Entregue / Concluído',
          color: 'bg-stone-100 text-stone-700 border-stone-300',
          icon: CheckCircle2,
          progress: 100,
          desc: isDelivery ? 'Pedido entregue no seu endereço. Bom apetite!' : 'Pedido entregue. Bom apetite!',
        };
      default:
        return {
          label: 'Cancelado',
          color: 'bg-red-100 text-red-700 border-red-300',
          icon: Clock,
          progress: 0,
          desc: 'Pedido cancelado.',
        };
    }
  };

  const renderOrderCard = (order: Order) => {
    const isDelivery = order.orderType === 'delivery';
    const statusInfo = getStatusInfo(order.status, isDelivery);
    const StatusIcon = statusInfo.icon;
    const elapsed = getElapsedMinutes(order.createdAt);

    return (
      <div
        key={order.id}
        className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden p-6 space-y-5 hover:border-amber-300 transition-all"
      >
        {/* Header do Card com Código de 6 Dígitos */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-mono font-black text-lg shadow-sm">
              #{order.trackingCode || order.shortCode}
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-base leading-tight">
                {order.customerName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
                <span>{formatTime(order.createdAt)}</span>
                <span>•</span>
                <span className="font-bold uppercase text-stone-700 flex items-center gap-1">
                  {isDelivery ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Entrega Delivery</span>
                    </>
                  ) : (
                    <span>
                      {order.orderType}
                      {order.tableNumber ? ` (${order.tableNumber})` : ''}
                    </span>
                  )}
                </span>
                <span>•</span>
                <span>{elapsed} min atrás</span>
              </div>
            </div>
          </div>

          {/* Badge de Status */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusInfo.color}`}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Endereço de Entrega (se for delivery) */}
        {isDelivery && order.deliveryDetails && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 text-stone-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Endereço de Entrega:</span>
            </div>
            <p className="font-medium text-stone-900">
              {order.deliveryDetails.street}, Nº {order.deliveryDetails.number} - {order.deliveryDetails.neighborhood}
              {order.deliveryDetails.complement ? ` (${order.deliveryDetails.complement})` : ''}
            </p>
            {order.deliveryDetails.houseDetails && (
              <p className="text-[11px] text-stone-600">
                <strong>Detalhes da casa:</strong> {order.deliveryDetails.houseDetails}
              </p>
            )}
            <p className="text-[11px] text-stone-700">
              <strong>Procurar por:</strong> {order.deliveryDetails.contactPerson}
              {order.deliveryDetails.contactPhone && ` • Tel: ${order.deliveryDetails.contactPhone}`}
            </p>
          </div>
        )}

        {/* Barra de Progresso Visual */}
        <div className="space-y-1.5">
          <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                order.status === 'pronto'
                  ? 'bg-emerald-500'
                  : order.status === 'preparando'
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${statusInfo.progress}%` }}
            />
          </div>
          <p className="text-xs text-stone-600 font-medium">{statusInfo.desc}</p>
        </div>

        {/* Detalhamento dos Itens do Pedido */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Itens do seu Pedido ({(order.items || []).reduce((a, b) => a + (b.quantity || 1), 0)} itens):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(order.items || []).map((item, idx) => {
              const isCustom = item.type === 'custom_pastel' && item.pastelDetails;
              return (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs space-y-1"
                >
                  <div className="flex justify-between font-bold text-stone-800">
                    <span>
                      {item.quantity}x{' '}
                      {isCustom
                        ? `${item.pastelDetails?.recipientLabel || `Pastel #${idx + 1}`} (${item.pastelDetails?.size?.name || 'Pastel'})`
                        : item.product?.name || 'Produto'}
                    </span>
                    <span>{formatCurrency(item.totalPrice || 0)}</span>
                  </div>

                  {isCustom && item.pastelDetails && (
                    <div className="text-[11px] text-stone-600 space-y-0.5 pt-1 border-t border-stone-200/50">
                      <div>
                        <strong>Sabores:</strong>{' '}
                        {(item.pastelDetails.flavors || []).map((f) => f.name).join(', ')}
                      </div>
                      {(item.pastelDetails.complements || []).length > 0 && (
                        <div>
                          <strong>Comp:</strong>{' '}
                          {(item.pastelDetails.complements || []).map((c) => c.name).join(', ')}
                        </div>
                      )}
                      {(item.pastelDetails.sauces || []).length > 0 && (
                        <div>
                          <strong>Molhos:</strong>{' '}
                          {(item.pastelDetails.sauces || []).map((s) => s.name).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total e Pagamento */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-600">
          <span>
            Pagamento:{' '}
            <strong className="uppercase text-stone-900 font-extrabold">
              {order.paymentMethod}
            </strong>
            {order.changeFor && ` (Troco p/ ${formatCurrency(order.changeFor)})`}
          </span>
          <span className="text-base font-black text-amber-600 font-display">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stone-900 font-display">
            Consultar & Acompanhar Pedido
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Digite seu código de 6 dígitos para acompanhar o preparo do seu pastel com total privacidade.
          </p>
        </div>
      </div>

      {/* Caixa de Busca por Código de 6 Dígitos */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-sm">
        <form onSubmit={handleSearchCode} className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
            Digite seu Código de Acompanhamento (6 dígitos):
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 849201"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-base font-mono font-bold tracking-widest text-stone-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-2xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>Consultar Pedido</span>
            </button>
          </div>
        </form>

        {/* Mensagem de Não Encontrado */}
        {hasSearched && !searchedOrder && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fade-in font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>
              Nenhum pedido encontrado com o código <strong>#{inputCode}</strong>. Verifique o número digitado e tente novamente.
            </span>
          </div>
        )}
      </div>

      {/* Pedido Consultado */}
      {searchedOrder && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Resultado da Consulta:</span>
          </div>
          {renderOrderCard(searchedOrder)}
        </div>
      )}

      {/* Pedidos Recentes do Cliente Neste Aparelho */}
      {mySavedOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Seus Pedidos Realizados Neste Aparelho ({mySavedOrders.length})</span>
            </h3>
          </div>

          <div className="space-y-4">
            {mySavedOrders.map((order) => renderOrderCard(order))}
          </div>
        </div>
      )}

      {/* Estado Vazio Quando não há pedidos */}
      {mySavedOrders.length === 0 && !searchedOrder && (
        <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-300 p-8 space-y-3">
          <div className="text-4xl">🥟</div>
          <h3 className="text-base font-bold text-stone-800">
            Nenhum pedido ativo no momento
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Assim que você finalizar seu pedido, seu código de 6 dígitos aparecerá aqui automaticamente.
          </p>
          <button
            onClick={() => setClientActiveTab('pastel')}
            className="mt-2 px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-amber-600 transition-colors"
          >
            Ir para o Cardápio
          </button>
        </div>
      )}
    </div>
  );
};

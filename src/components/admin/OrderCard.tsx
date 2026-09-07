'use client';

import React from 'react';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatTime, getElapsedMinutes } from '@/utils/format';
import {
  Clock,
  Printer,
  ChevronRight,
  ChevronLeft,
  XCircle,
  CheckCircle2,
  ChefHat,
  BellRing,
  AlertTriangle,
  Store,
  Utensils,
  ShoppingBag,
  Truck,
  MapPin,
  User,
  Phone,
} from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancel: (orderId: string) => void;
  onPrint: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onCancel,
  onPrint,
}) => {
  const elapsed = getElapsedMinutes(order.createdAt);
  const isDelayed = elapsed > 20 && (order.status === 'novo' || order.status === 'preparando');

  const getOrderTypeBadge = () => {
    switch (order.orderType) {
      case 'mesa':
        return { label: `Mesa ${order.tableNumber || ''}`, icon: Utensils, bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'viagem':
        return { label: 'Para Viagem', icon: ShoppingBag, bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'delivery':
        return { label: 'Entrega Delivery', icon: Truck, bg: 'bg-emerald-100 text-emerald-950 border-emerald-300' };
      default:
        return { label: 'Balcão', icon: Store, bg: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const typeInfo = getOrderTypeBadge();
  const TypeIcon = typeInfo.icon;

  return (
    <div
      className={`bg-white rounded-3xl border-2 shadow-md transition-all flex flex-col justify-between overflow-hidden ${
        isDelayed
          ? 'border-red-400 ring-2 ring-red-400/20'
          : order.status === 'novo'
          ? 'border-amber-300'
          : order.status === 'preparando'
          ? 'border-blue-300'
          : 'border-emerald-300'
      }`}
    >
      {/* Topo do Card com Código de 6 Dígitos */}
      <div className="p-4 border-b border-stone-100 bg-stone-50/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-stone-900 text-white font-black font-mono text-base shadow-sm">
              #{order.trackingCode || order.shortCode}
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${typeInfo.bg}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              <span>{typeInfo.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold">
            <Clock className={`w-3.5 h-3.5 ${isDelayed ? 'text-red-600 animate-pulse' : 'text-stone-400'}`} />
            <span className={isDelayed ? 'text-red-600 font-extrabold' : 'text-stone-500'}>
              {elapsed} min ({formatTime(order.createdAt)})
            </span>
          </div>
        </div>

        {/* Nome do Cliente em Destaque */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-stone-900 leading-tight">
            {order.customerName}
          </h3>
          <span className="text-base font-black text-amber-600 font-display">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>

        {/* Meio de Pagamento & Troco */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60 text-xs">
          <span className="font-extrabold uppercase px-2 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[10px]">
            {order.paymentMethod}
          </span>
          {order.paymentMethod === 'dinheiro' && (
            <span className="text-[11px] font-bold text-emerald-700">
              {order.changeFor ? `Troco p/ ${formatCurrency(order.changeFor)} (Troco: ${formatCurrency(order.changeAmount || 0)})` : 'Sem troco'}
            </span>
          )}
        </div>
      </div>

      {/* Detalhes de Delivery se aplicável */}
      {order.orderType === 'delivery' && order.deliveryDetails && (
        <div className="p-3 mx-3 mt-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs space-y-1.5 text-emerald-950">
          <div className="flex items-center gap-1.5 font-black text-emerald-900">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dados para Entrega</span>
          </div>
          <div className="font-bold flex items-start gap-1 text-stone-900">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
            <span>
              {order.deliveryDetails.street}, {order.deliveryDetails.number}
              {order.deliveryDetails.complement ? ` (${order.deliveryDetails.complement})` : ''} - {order.deliveryDetails.neighborhood}
            </span>
          </div>
          {order.deliveryDetails.houseDetails && (
            <div className="text-[11px] text-stone-700 bg-white/90 p-1.5 rounded-lg border border-emerald-100">
              <strong className="text-stone-900">Casa/Fachada:</strong> {order.deliveryDetails.houseDetails}
            </div>
          )}
          {order.deliveryDetails.referencePoint && (
            <div className="text-[11px] text-stone-700 bg-white/90 p-1.5 rounded-lg border border-emerald-100">
              <strong className="text-stone-900">Ponto de Ref.:</strong> {order.deliveryDetails.referencePoint}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-emerald-200 text-[11px]">
            <span className="flex items-center gap-1 font-bold text-stone-800">
              <User className="w-3 h-3 text-emerald-600" />
              Procurar por: <strong>{order.deliveryDetails.contactPerson}</strong>
            </span>
            {order.deliveryDetails.contactPhone && (
              <span className="flex items-center gap-1 font-bold text-stone-800">
                <Phone className="w-3 h-3 text-emerald-600" />
                {order.deliveryDetails.contactPhone}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Corpo com Detalhamento dos Itens & Tags Visuais */}
      <div className="p-4 space-y-3 flex-1">
        {(order.items || []).map((item, idx) => {
          const isCustom = item.type === 'custom_pastel' && item.pastelDetails;

          return (
            <div
              key={item.id || idx}
              className="p-3 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-2 text-xs"
            >
              <div className="flex justify-between items-center font-extrabold text-stone-900">
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="text-amber-600 font-black">{item.quantity}x</span>
                  <span>
                    {isCustom
                      ? `${item.pastelDetails?.recipientLabel || `Pastel #${idx + 1}`} (${item.pastelDetails?.size?.name || 'Pastel'})`
                      : item.product?.name || 'Produto'}
                  </span>
                </span>
                <span className="text-stone-500 font-semibold text-xs">
                  {formatCurrency(item.totalPrice || 0)}
                </span>
              </div>

              {isCustom && item.pastelDetails && (
                <div className="space-y-1.5 pt-1 border-t border-stone-200/60">
                  {/* Sabores */}
                  {(item.pastelDetails.flavors || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-1 rounded">
                        Sabores:
                      </span>
                      {(item.pastelDetails.flavors || []).map((f) => (
                        <span
                          key={f.id}
                          className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-2xs"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Complementos */}
                  {(item.pastelDetails.complements || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-1 rounded">
                        Comp.:
                      </span>
                      {(item.pastelDetails.complements || []).map((c) => (
                        <span
                          key={c.id}
                          className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-2xs"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Molhos */}
                  {(item.pastelDetails.sauces || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-50 px-1 rounded">
                        Molhos:
                      </span>
                      {(item.pastelDetails.sauces || []).map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded-lg text-xs font-bold bg-orange-500 text-white shadow-2xs"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Observações específicas do item */}
                  {item.pastelDetails.notes && (
                    <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 font-bold text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{item.pastelDetails.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Observações Gerais do Pedido */}
        {order.notes && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            <strong>Obs Geral:</strong> &ldquo;{order.notes}&rdquo;
          </div>
        )}
      </div>

      {/* Ações de Avanço de Status e Impressão */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
        <button
          onClick={() => onPrint(order)}
          className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs"
          title="Imprimir comanda térmica"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Comanda</span>
        </button>

        {/* Botão de Avanço de Status */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {order.status === 'novo' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'preparando')}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>Fritar / Preparar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {order.status === 'preparando' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'novo')}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-200"
                title="Voltar para Novos"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'pronto')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                {order.orderType === 'delivery' ? (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Despachar Delivery</span>
                  </>
                ) : (
                  <>
                    <BellRing className="w-4 h-4" />
                    <span>Pronto p/ Retirada</span>
                  </>
                )}
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {order.status === 'pronto' && (
            <>
              <button
                onClick={() => onUpdateStatus(order.id, 'preparando')}
                className="p-2 rounded-xl text-stone-400 hover:bg-stone-200"
                title="Voltar para Preparo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpdateStatus(order.id, 'entregue')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{order.orderType === 'delivery' ? 'Confirmar Entrega' : 'Entregar Pedido'}</span>
              </button>
            </>
          )}

          {order.status === 'entregue' && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {order.orderType === 'delivery' ? 'Entregue no Local' : 'Entregue'}
            </span>
          )}

          {order.status !== 'entregue' && order.status !== 'cancelado' && (
            <button
              onClick={() => onCancel(order.id)}
              className="p-2 rounded-xl text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Cancelar pedido"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

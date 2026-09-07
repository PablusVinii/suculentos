'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatTime } from '@/utils/format';
import { playNewOrderChime } from '@/utils/audio';
import {
  Bell,
  ChefHat,
  Printer,
  X,
  Sparkles,
  ShoppingBag,
  Store,
  Utensils,
  Flame,
} from 'lucide-react';

interface NewOrderAlertModalProps {
  onOpenReceipt: (order: any) => void;
}

export const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({ onOpenReceipt }) => {
  const {
    incomingOrderAlert,
    setIncomingOrderAlert,
    updateOrderStatus,
    setAdminActiveTab,
    soundEnabled,
  } = useStore();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (incomingOrderAlert) {
      setVisible(true);
      if (soundEnabled) {
        playNewOrderChime();
      }
    } else {
      setVisible(false);
    }
  }, [incomingOrderAlert, soundEnabled]);

  if (!visible || !incomingOrderAlert) return null;

  const order = incomingOrderAlert;

  const handleStartPreparing = () => {
    updateOrderStatus(order.id, 'preparando');
    setAdminActiveTab('kanban');
    setIncomingOrderAlert(null);
  };

  const handleOpenComanda = () => {
    onOpenReceipt(order);
    setIncomingOrderAlert(null);
  };

  const handleDismiss = () => {
    setIncomingOrderAlert(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop com tom avermelhado suave para urgência de restaurante */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-amber-500 z-10 animate-slide-up ring-4 ring-amber-500/20">
        {/* Cabeçalho de Alerta Urgente da Cozinha */}
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-bold text-2xl shadow-lg animate-bounce">
                <Bell className="w-7 h-7 text-red-600 fill-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-wider animate-pulse">
                    Nova Comanda Recebida!
                  </span>
                </div>
                <h3 className="text-xl font-black font-display text-white">
                  Novo Pedido #{order.trackingCode || order.shortCode}
                </h3>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo com Detalhes do Pedido */}
        <div className="p-6 space-y-5">
          {/* Informações do Cliente e Local */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">
                Cliente
              </span>
              <h4 className="text-lg font-black text-stone-900 leading-tight">
                {order.customerName}
              </h4>
              <span className="text-xs font-bold text-stone-600 mt-0.5 inline-block">
                Local: <strong className="uppercase">{order.orderType}</strong>{' '}
                {order.tableNumber && `(Mesa ${order.tableNumber})`}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider block">
                Total do Pedido
              </span>
              <span className="text-2xl font-black text-amber-600 font-display">
                {formatCurrency(order.totalAmount)}
              </span>
              <span className="block text-[11px] font-extrabold uppercase text-stone-700">
                {order.paymentMethod}
                {order.changeFor && ` (Troco p/ ${formatCurrency(order.changeFor)})`}
              </span>
            </div>
          </div>

          {/* Lista Resumida dos Itens */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Itens para Preparar ({(order.items || []).reduce((a, b) => a + (b.quantity || 1), 0)}):</span>
            </span>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {(order.items || []).map((item, idx) => {
                const isCustom = item.type === 'custom_pastel' && item.pastelDetails;
                return (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-stone-900">
                      <span>
                        {item.quantity}x{' '}
                        {isCustom
                          ? `${item.pastelDetails?.recipientLabel || `Pastel #${idx + 1}`} (${item.pastelDetails?.size?.name || 'Pastel'})`
                          : item.product?.name || 'Produto'}
                      </span>
                      <span className="text-stone-500">{formatCurrency(item.totalPrice || 0)}</span>
                    </div>

                    {isCustom && item.pastelDetails && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(item.pastelDetails.flavors || []).map((f) => (
                          <span
                            key={f.id}
                            className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[10px]"
                          >
                            {f.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {order.notes && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
              <strong>Observação do Cliente:</strong> &ldquo;{order.notes}&rdquo;
            </div>
          )}

          {/* Ações Rápidas da Cozinha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleStartPreparing}
              className="py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>Iniciar Fritura / Preparo</span>
            </button>

            <button
              onClick={handleOpenComanda}
              className="py-3.5 px-4 bg-stone-900 hover:bg-black text-white font-bold rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Comanda Térmica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

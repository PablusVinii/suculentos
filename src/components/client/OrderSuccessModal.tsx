'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatTime } from '@/utils/format';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Copy,
  Check,
  ClipboardList,
  Sparkles,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    lastPlacedOrder,
    setClientActiveTab,
  } = useStore();

  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOrderSuccessOpen) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#f59e0b', '#ea580c', '#10b981', '#fbbf24'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOrderSuccessOpen]);

  if (!isOrderSuccessOpen || !lastPlacedOrder) return null;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(lastPlacedOrder.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTrackOrders = () => {
    setIsOrderSuccessOpen(false);
    setClientActiveTab('meus_pedidos');
  };

  const handleNewOrder = () => {
    setIsOrderSuccessOpen(false);
    setClientActiveTab('pastel');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div
        onClick={() => setIsOrderSuccessOpen(false)}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 text-center p-6 sm:p-8 animate-slide-up">
        {/* Ícone de Sucesso */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Pedido Enviado para a Cozinha!
        </div>

        <h2 className="text-2xl font-black text-stone-900 font-display">
          Pedido Confirmado, {lastPlacedOrder.customerName}!
        </h2>
        <p className="text-stone-500 text-xs sm:text-sm mt-1 mb-6">
          Sua comanda foi impressa e o pasteleiro já está preparando seu pedido frito na hora!
        </p>

        {/* Card do Código de 6 Dígitos de Acompanhamento */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-orange-500/25 mb-6">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-100 mb-2">
            <KeyRound className="w-4 h-4" />
            <span>Seu Código de Acompanhamento (6 Dígitos):</span>
          </div>

          <div className="flex items-center justify-center gap-2 my-2">
            <span className="text-4xl sm:text-5xl font-black tracking-widest font-mono drop-shadow-md">
              {lastPlacedOrder.trackingCode}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
          </button>

          <div className="flex items-center justify-center gap-3 text-xs text-amber-100 font-medium mt-4 pt-3 border-t border-white/20">
            <span>{formatTime(lastPlacedOrder.createdAt)}</span>
            <span>•</span>
            <span className="uppercase">{lastPlacedOrder.orderType === 'delivery' ? '🛵 Entrega Delivery' : lastPlacedOrder.orderType}</span>
            <span>•</span>
            <span>{formatCurrency(lastPlacedOrder.totalAmount)}</span>
          </div>
        </div>

        {/* Informações Específicas de Entrega Delivery */}
        {lastPlacedOrder.orderType === 'delivery' && lastPlacedOrder.deliveryDetails && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-left text-xs space-y-2 mb-6">
            <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>🛵 Endereço de Entrega:</span>
            </div>
            <p className="text-stone-800 font-medium">
              {lastPlacedOrder.deliveryDetails.street}, Nº {lastPlacedOrder.deliveryDetails.number} - {lastPlacedOrder.deliveryDetails.neighborhood}
              {lastPlacedOrder.deliveryDetails.complement && ` (${lastPlacedOrder.deliveryDetails.complement})`}
            </p>
            {lastPlacedOrder.deliveryDetails.houseDetails && (
              <p className="text-[11px] text-stone-600">
                <strong>Detalhes da casa:</strong> {lastPlacedOrder.deliveryDetails.houseDetails}
              </p>
            )}
            <p className="text-[11px] text-stone-700">
              <strong>Procurar por:</strong> {lastPlacedOrder.deliveryDetails.contactPerson}
            </p>
            <div className="p-2.5 rounded-xl bg-amber-100/70 text-[11px] text-amber-950 font-bold">
              🔔 Fique atento ao portão, campainha e celular quando o status mudar para <em>"Saiu para Entrega"</em>!
            </div>
          </div>
        )}

        {/* Informação sobre Consulta Segura */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-2 mb-6">
          <div className="flex items-start gap-2 text-stone-700">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Guarde seu código <strong className="text-stone-900 font-mono">#{lastPlacedOrder.trackingCode}</strong>. Na aba <strong>Acompanhar Pedido</strong>, você poderá digitar este código para ver exclusivamente o status da sua comanda!
            </p>
          </div>

          {lastPlacedOrder.changeAmount && lastPlacedOrder.changeAmount > 0 && (
            <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-stone-200">
              <span>Troco a receber:</span>
              <span>{formatCurrency(lastPlacedOrder.changeAmount)}</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2.5">
          <button
            id="track-my-order-button"
            onClick={handleTrackOrders}
            className="w-full flex items-center justify-center gap-2 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-md transition-all text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Acompanhar Meu Pedido com este Código</span>
          </button>

          <button
            onClick={handleNewOrder}
            className="w-full py-3 text-stone-600 hover:text-stone-900 font-bold rounded-2xl hover:bg-stone-100 transition-all text-xs"
          >
            Fazer Novo Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

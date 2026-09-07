'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatTime } from '@/utils/format';
import { playStatusUpdateChime, playSuccessChime } from '@/utils/audio';
import confetti from 'canvas-confetti';
import {
  ChefHat,
  BellRing,
  CheckCircle2,
  X,
  Sparkles,
  ClipboardList,
  Flame,
  ArrowRight,
  Truck,
} from 'lucide-react';

export const ClientStatusAlertModal: React.FC = () => {
  const {
    clientStatusAlert,
    setClientStatusAlert,
    setClientActiveTab,
    soundEnabled,
  } = useStore();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (clientStatusAlert) {
      setVisible(true);

      if (soundEnabled) {
        if (clientStatusAlert.newStatus === 'pronto') {
          playSuccessChime();
        } else {
          playStatusUpdateChime();
        }
      }

      if (clientStatusAlert.newStatus === 'pronto') {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#ea580c', '#3b82f6'],
          });
        } catch {
          // Confetti fallback
        }
      }
    } else {
      setVisible(false);
    }
  }, [clientStatusAlert, soundEnabled]);

  if (!visible || !clientStatusAlert) return null;

  const { order, newStatus } = clientStatusAlert;
  const isDelivery = order.orderType === 'delivery';

  const getStatusPresentation = () => {
    switch (newStatus) {
      case 'preparando':
        return {
          title: 'Seu Pastel Está Fritando! 🍳',
          subtitle: 'Massa fresca aberta, recheio caprichado e fritando na hora bem crocante.',
          badge: 'Na Frigideira / Em Preparo',
          headerBg: 'from-blue-600 via-indigo-600 to-blue-700',
          icon: ChefHat,
          iconBg: 'bg-blue-100 text-blue-700',
          badgeStyle: 'bg-blue-100 text-blue-900 border-blue-300',
        };
      case 'pronto':
        return {
          title: isDelivery ? '🛵 SAIU PARA ENTREGA! A CAMINHO!' : 'SEU PEDIDO ESTÁ PRONTO! 🔔',
          subtitle: isDelivery
            ? 'O entregador já está a caminho do seu endereço! Por favor, fique atento ao portão/interfone e celular.'
            : 'Seu lanche está quentinho e pronto para retirada ou entrega na mesa!',
          badge: isDelivery ? 'Saiu para Entrega' : 'Pronto para Retirada',
          headerBg: 'from-emerald-600 via-teal-600 to-emerald-700',
          icon: isDelivery ? Truck : BellRing,
          iconBg: 'bg-emerald-100 text-emerald-700',
          badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        };
      case 'entregue':
        return {
          title: 'Pedido Entregue! Bom Apetite! 🥟',
          subtitle: isDelivery
            ? 'Seu pedido foi entregue com sucesso no seu endereço. Aproveite!'
            : 'Obrigado pela preferência! Esperamos que ame o sabor da Suculentos.',
          badge: 'Concluído / Entregue',
          headerBg: 'from-stone-800 via-stone-900 to-black',
          icon: CheckCircle2,
          iconBg: 'bg-stone-100 text-stone-800',
          badgeStyle: 'bg-stone-100 text-stone-800 border-stone-300',
        };
      default:
        return {
          title: 'Status do Pedido Atualizado',
          subtitle: 'Houve uma atualização na sua comanda.',
          badge: newStatus.toUpperCase(),
          headerBg: 'from-amber-500 to-orange-500',
          icon: Sparkles,
          iconBg: 'bg-amber-100 text-amber-800',
          badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
        };
    }
  };

  const pres = getStatusPresentation();
  const Icon = pres.icon;

  const handleGoToTracking = () => {
    setClientStatusAlert(null);
    setClientActiveTab('meus_pedidos');
  };

  const handleDismiss = () => {
    setClientStatusAlert(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-100 z-10 animate-slide-up">
        {/* Cabeçalho com Gradiente Vibrante */}
        <div className={`bg-gradient-to-r ${pres.headerBg} p-6 text-white text-center relative`}>
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Ícone com Animação */}
          <div className={`w-16 h-16 rounded-3xl ${pres.iconBg} flex items-center justify-center mx-auto mb-3 shadow-lg ${newStatus === 'pronto' ? 'animate-bounce' : 'animate-pulse'}`}>
            <Icon className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider text-white mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atualização em Tempo Real</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-display leading-tight">
            {pres.title}
          </h3>
          <p className="text-xs sm:text-sm text-white/85 mt-1 max-w-xs mx-auto">
            {pres.subtitle}
          </p>
        </div>

        {/* Corpo do Alerta */}
        <div className="p-6 space-y-5">
          {/* Destaque do Código do Pedido */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
            <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider block">
              Código / Senha do Pedido
            </span>
            <span className="text-3xl font-black tracking-widest font-mono text-stone-900 block">
              #{order.trackingCode || order.shortCode}
            </span>
            <div className="flex items-center justify-center gap-2 text-xs text-stone-600 pt-1">
              <span>{order.customerName}</span>
              <span>•</span>
              <span className="uppercase font-bold">{order.orderType}</span>
              <span>•</span>
              <span className="font-bold text-amber-700">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Resumo Rápido dos Itens */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-stone-500 tracking-wider block">
              Itens da Comanda ({(order.items || []).reduce((a, b) => a + (b.quantity || 1), 0)}):
            </span>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {(order.items || []).map((item, idx) => (
                <div key={item.id || idx} className="flex justify-between font-bold text-stone-800">
                  <span>
                    {item.quantity}x{' '}
                    {item.type === 'custom_pastel'
                      ? `${item.pastelDetails?.recipientLabel || `Pastel #${idx + 1}`} (${item.pastelDetails?.size?.name || 'Pastel'})`
                      : item.product?.name || 'Produto'}
                  </span>
                  <span className="text-stone-500 font-semibold">{formatCurrency(item.totalPrice || 0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleGoToTracking}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Ver Acompanhamento Completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2.5 text-stone-600 hover:text-stone-900 font-bold text-xs rounded-xl hover:bg-stone-100 transition-colors"
            >
              OK, Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

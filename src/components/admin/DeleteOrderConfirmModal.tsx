'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { formatCurrency } from '@/utils/format';
import {
  AlertTriangle,
  Trash2,
  X,
  Store,
  Utensils,
  ShoppingBag,
  Truck,
  Loader2,
} from 'lucide-react';

interface DeleteOrderConfirmModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string) => Promise<void> | void;
}

export const DeleteOrderConfirmModal: React.FC<DeleteOrderConfirmModalProps> = ({
  order,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) return null;

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(order.id);
      onClose();
    } catch (err) {
      console.error('Erro ao excluir pedido:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getOrderTypeBadge = () => {
    switch (order.orderType) {
      case 'mesa':
        return { label: `Mesa ${order.tableNumber || ''}`, icon: Utensils };
      case 'viagem':
        return { label: 'Para Viagem', icon: ShoppingBag };
      case 'delivery':
        return { label: 'Delivery', icon: Truck };
      default:
        return { label: 'Balcão', icon: Store };
    }
  };

  const typeInfo = getOrderTypeBadge();
  const TypeIcon = typeInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop escuro com desfoque */}
      <div
        onClick={isDeleting ? undefined : onClose}
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
      />

      {/* Caixa do Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-red-500 z-10 animate-slide-up ring-4 ring-red-500/20">
        {/* Cabeçalho de Alerta Vermelho Destrutivo */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white relative">
          <button
            onClick={isDeleting ? undefined : onClose}
            disabled={isDeleting}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-lg shrink-0">
              <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-wider mb-1">
                Ação Irreversível ⚠️
              </span>
              <h3 className="text-xl font-black font-display leading-tight text-white">
                Excluir Pedido Permanentemente?
              </h3>
            </div>
          </div>
        </div>

        {/* Corpo com Detalhes do Pedido e Aviso */}
        <div className="p-6 space-y-4">
          {/* Card Resumo do Pedido a ser Apagado */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-stone-900 text-white font-mono font-black text-sm">
                #{order.trackingCode || order.shortCode}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-stone-200 text-stone-800 text-[11px]">
                <TypeIcon className="w-3.5 h-3.5" />
                <span>{typeInfo.label}</span>
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-stone-400 block">Cliente</span>
                <strong className="text-stone-900 text-sm">{order.customerName}</strong>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase text-stone-400 block">Total</span>
                <strong className="text-red-600 text-base font-black font-display">
                  {formatCurrency(order.totalAmount)}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 text-stone-600 text-[11px] flex justify-between">
              <span>Status atual: <strong className="uppercase">{order.status}</strong></span>
              <span>{(order.items || []).reduce((a, b) => a + (b.quantity || 1), 0)} itens</span>
            </div>
          </div>

          {/* Aviso Crítico de Ação Irreversível */}
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-950 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-black text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Atenção: Esta ação NÃO poderá ser desfeita!</span>
            </div>
            <p className="text-red-900/90 leading-relaxed text-[11px]">
              Ao confirmar a exclusão, todos os registros desta comanda, endereço de entrega e histórico serão <strong>removidos definitivamente</strong> do banco de dados na nuvem e de todas as telas em tempo real.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              Cancelar / Voltar
            </button>

            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Excluindo...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Sim, Excluir Pedido</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Order } from '@/types';
import { formatCurrency, formatTime } from '@/utils/format';
import { Printer, X } from 'lucide-react';

interface ThermalReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 animate-fade-in">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-stone-100 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-300 z-10 p-6 animate-slide-up">
        {/* Barra superior de ações */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-300">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-stone-700" />
            <span className="font-extrabold text-xs text-stone-700 uppercase tracking-wider">
              Comanda Térmica (80mm)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Papel Térmico Simulado */}
        <div
          id="printable-receipt"
          className="bg-white p-5 rounded-xl shadow-inner border border-stone-200 font-mono text-[11px] text-stone-900 space-y-3 leading-tight select-text"
        >
          {/* Cabeçalho do Estabelecimento */}
          <div className="text-center space-y-0.5 border-b border-dashed border-stone-400 pb-2">
            <h3 className="font-bold text-sm tracking-wider uppercase">
              *** SUCULENTOS PASTELARIA ***
            </h3>
            <p className="text-[10px] text-stone-600">Pastéis de Massa Fresca & Salgados</p>
            <p className="text-[10px] text-stone-600">
              {new Date(order.createdAt).toLocaleDateString('pt-BR')} - {formatTime(order.createdAt)}
            </p>
          </div>

          {/* Destaque do Pedido & Cliente */}
          <div className="text-center py-1 border-b border-dashed border-stone-400">
            <span className="text-xl font-extrabold block">
              CÓDIGO: #{order.trackingCode || order.shortCode}
            </span>
            <span className="font-bold text-xs uppercase block text-stone-800">
              CLIENTE: {order.customerName}
            </span>
            <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-0.5 rounded inline-block mt-1">
              LOCAL: {order.orderType.toUpperCase()}
              {order.tableNumber ? ` (${order.tableNumber})` : ''}
            </span>
          </div>

          {/* Lista de Itens */}
          <div className="space-y-3 py-1 border-b border-dashed border-stone-400">
            <div className="font-bold text-[10px] text-stone-500 uppercase flex justify-between">
              <span>QTD ITEM / RECHEIOS</span>
              <span>TOTAL</span>
            </div>

            {(order.items || []).map((item, index) => (
              <div key={item.id || index} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span>
                    {item.quantity}x{' '}
                    {item.type === 'custom_pastel'
                      ? `${(item.pastelDetails?.recipientLabel || `PASTEL #${index + 1}`).toUpperCase()} (${(item.pastelDetails?.size?.name || 'PASTEL').toUpperCase()})`
                      : (item.product?.name || 'PRODUTO').toUpperCase()}
                  </span>
                  <span>{formatCurrency(item.totalPrice || 0)}</span>
                </div>

                {/* Se for Pastel Personalizado */}
                {item.type === 'custom_pastel' && item.pastelDetails && (
                  <div className="pl-2 border-l-2 border-stone-300 space-y-0.5 text-[10px] text-stone-700">
                    <div>
                      <strong>SABORES:</strong>{' '}
                      {(item.pastelDetails.flavors || []).map((f) => f.name).join(', ')}
                    </div>
                    {(item.pastelDetails.complements || []).length > 0 && (
                      <div>
                        <strong>COMPL.:</strong>{' '}
                        {(item.pastelDetails.complements || []).map((c) => c.name).join(', ')}
                      </div>
                    )}
                    {(item.pastelDetails.sauces || []).length > 0 && (
                      <div>
                        <strong>MOLHOS:</strong>{' '}
                        {(item.pastelDetails.sauces || []).map((s) => s.name).join(', ')}
                      </div>
                    )}
                    {item.pastelDetails.notes && (
                      <div className="font-bold text-amber-900 bg-amber-50 p-1 rounded">
                        OBS: {item.pastelDetails.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Totais & Pagamento */}
          <div className="space-y-1 py-1 border-b border-dashed border-stone-400">
            <div className="flex justify-between font-extrabold text-xs">
              <span>TOTAL DO PEDIDO:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-stone-700 text-[10px]">
              <span>FORMA DE PAGAMENTO:</span>
              <span className="font-bold uppercase">{order.paymentMethod}</span>
            </div>
            {order.paymentMethod === 'dinheiro' && order.changeFor && (
              <>
                <div className="flex justify-between text-[10px]">
                  <span>PAGAMENTO EM DINHEIRO:</span>
                  <span>{formatCurrency(order.changeFor)}</span>
                </div>
                {order.changeAmount && order.changeAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-800 text-[10px]">
                    <span>TROCO A DEVOLVER:</span>
                    <span>{formatCurrency(order.changeAmount)}</span>
                  </div>
                )}
              </>
            )}
            {order.notes && (
              <div className="pt-1 text-[10px] text-stone-600">
                <strong>OBS. GERAL:</strong> {order.notes}
              </div>
            )}
          </div>

          {/* Rodapé do Cupom */}
          <div className="text-center pt-1 text-[9px] text-stone-500">
            <p>*** CONTROLE INTERNO DA COZINHA ***</p>
            <p className="mt-0.5">Frito na hora com carinho!</p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Comanda</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

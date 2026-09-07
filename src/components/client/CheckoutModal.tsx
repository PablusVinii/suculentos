'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PaymentMethod, OrderType } from '@/types';
import { formatCurrency } from '@/utils/format';
import { playSuccessChime } from '@/utils/audio';
import {
  X,
  CreditCard,
  Banknote,
  QrCode,
  Copy,
  Check,
  Store,
  Utensils,
  ShoppingBag,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    getCartTotal,
    createOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('balcao');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [nameError, setNameError] = useState(false);

  if (!isCheckoutOpen) return null;

  const totalAmount = getCartTotal();
  const changeForNumber = parseFloat(changeFor.replace(',', '.')) || 0;
  const calculatedChange = changeForNumber > totalAmount ? changeForNumber - totalAmount : 0;
  const isChangeInsufficient =
    paymentMethod === 'dinheiro' && changeForNumber > 0 && changeForNumber < totalAmount;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText('pix@suculentospastelaria.com.br');
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      setNameError(true);
      return;
    }

    createOrder({
      customerName: customerName.trim(),
      orderType,
      tableNumber: orderType === 'mesa' ? tableNumber : undefined,
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' && changeForNumber > 0 ? changeForNumber : undefined,
      notes: notes.trim() || undefined,
    });

    playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCheckoutOpen(false)}
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-100 z-10 animate-slide-up">
        {/* Header do Checkout */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Etapa Final
            </div>
            <h2 className="text-xl font-black font-display">Identificação & Pagamento</h2>
            <p className="text-amber-100 text-xs mt-0.5">
              Informe seu nome para chamarmos seu pedido quando estiver pronto!
            </p>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Nome do Cliente */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Seu Nome Completo ou Apelido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              id="customer-name-input"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="Ex: Carlos Oliveira"
              className={`w-full px-4 py-3 rounded-2xl border text-sm outline-none transition-all ${
                nameError
                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/50'
                  : 'border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-stone-50/50 focus:bg-white'
              }`}
            />
            {nameError && (
              <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Por favor, informe seu nome para o atendimento.
              </p>
            )}
          </div>

          {/* Tipo de Atendimento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Onde você vai saborear?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'balcao' as const, label: 'Balcão', icon: Store },
                { id: 'mesa' as const, label: 'Na Mesa', icon: Utensils },
                { id: 'viagem' as const, label: 'Para Viagem', icon: ShoppingBag },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = orderType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-500/20'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {orderType === 'mesa' && (
              <div className="mt-2.5 animate-fade-in">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Número da Mesa (ex: Mesa 04)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pix' as const, label: 'PIX', icon: QrCode, badge: 'Instantâneo' },
                { id: 'debito' as const, label: 'Débito', icon: CreditCard },
                { id: 'credito' as const, label: 'Crédito', icon: CreditCard },
                { id: 'dinheiro' as const, label: 'Espécie', icon: Banknote },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-1 ring-amber-500/20'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Painel Específico do Método de Pagamento */}
            <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-3">
              {paymentMethod === 'pix' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-800">Chave PIX (E-mail):</span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg transition-colors"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                  <code className="block p-2 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 font-mono select-all">
                    pix@suculentospastelaria.com.br
                  </code>
                  <p className="text-[11px] text-stone-500">
                    O QR Code ou comprovante pode ser apresentado no momento da entrega do lanche.
                  </p>
                </div>
              )}

              {(paymentMethod === 'debito' || paymentMethod === 'credito') && (
                <div className="flex items-center gap-2.5 text-stone-700">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs">
                    O pagamento será processado na maquininha física de cartões ao retirar ou na entrega da mesa.
                  </p>
                </div>
              )}

              {paymentMethod === 'dinheiro' && (
                <div className="space-y-2.5">
                  <label className="block font-bold text-stone-800 text-xs">
                    Precisa de troco para quanto?
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-bold">R$</span>
                    <input
                      type="number"
                      step="0.50"
                      min={totalAmount}
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      placeholder="Ex: 50.00 (ou deixe em branco se tiver valor exato)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Atalhos rápidos de troco */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-stone-500 font-semibold">Atalhos:</span>
                    {[20, 50, 100].map((val) => {
                      if (val <= totalAmount) return null;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setChangeFor(val.toString())}
                          className="px-2 py-0.5 rounded-lg bg-white border border-stone-200 hover:border-amber-300 text-[11px] font-bold text-stone-700"
                        >
                          R$ {val},00
                        </button>
                      );
                    })}
                  </div>

                  {calculatedChange > 0 && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold flex justify-between items-center text-xs">
                      <span>Troco a devolver:</span>
                      <span className="text-sm">{formatCurrency(calculatedChange)}</span>
                    </div>
                  )}

                  {isChangeInsufficient && (
                    <p className="text-xs text-red-600 font-bold">
                      O valor do troco precisa ser maior ou igual ao total do pedido ({formatCurrency(totalAmount)}).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Observações Gerais */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Observações Adicionais (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Chamar pelo apelido, guardanapos extras..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Resumo de Preço e Envio */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            <div className="flex justify-between items-center text-stone-900">
              <span className="text-sm font-bold">Total a pagar:</span>
              <span className="text-2xl font-black text-amber-600 font-display">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              id="confirm-order-button"
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform active:scale-98"
            >
              <span>Confirmar e Enviar Pedido 🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

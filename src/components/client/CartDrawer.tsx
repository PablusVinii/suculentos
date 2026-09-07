'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/format';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    setIsCheckoutOpen,
    setClientActiveTab,
  } = useStore();

  if (!isCartOpen) return null;

  const totalAmount = getCartTotal();
  const totalCount = getCartItemsCount();

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleBuildAnotherPastel = () => {
    setIsCartOpen(false);
    setClientActiveTab('pastel');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-up sm:animate-fade-in">
          {/* Header do Carrinho */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-stone-900 leading-tight font-display">
                  Seu Pedido
                </h2>
                <span className="text-xs text-stone-500">
                  {totalCount} {totalCount === 1 ? 'item selecionado' : 'itens selecionados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  title="Esvaziar carrinho"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-4xl">
                  🥟
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Seu carrinho está vazio
                </h3>
                <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                  Monte pastéis personalizados para você e seus acompanhantes ou escolha salgados e bebidas!
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setClientActiveTab('pastel');
                  }}
                  className="mt-4 px-5 py-2.5 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md hover:bg-amber-600 transition-all"
                >
                  Montar Meu Primeiro Pastel 🥟
                </button>
              </div>
            ) : (
              <>
                {/* Botão rápido para adicionar outro pastel */}
                <button
                  onClick={handleBuildAnotherPastel}
                  className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-amber-600" />
                  <span>+ Montar Mais um Pastel (Amigos / Família)</span>
                </button>

                {cart.map((item, index) => {
                  const isCustomPastel = item.type === 'custom_pastel' && item.pastelDetails;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-stone-200/90 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {isCustomPastel ? (
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-base">🥟</span>
                                <span className="font-extrabold text-stone-900 text-sm">
                                  {item.pastelDetails?.recipientLabel || `Pastel #${index + 1}`} ({item.pastelDetails?.size.name})
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-extrabold text-stone-900 text-sm">
                              {item.product?.name}
                            </span>
                          )}
                          <span className="text-xs font-bold text-amber-600 block mt-0.5">
                            {formatCurrency(item.unitPrice)} cada
                          </span>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-red-600 p-1 transition-colors"
                          title="Remover item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Detalhamento do Pastel Personalizado */}
                      {isCustomPastel && item.pastelDetails && (
                        <div className="text-xs space-y-1.5 pt-2 border-t border-stone-200/60">
                          {/* Sabores */}
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="font-bold text-stone-500 text-[10px] uppercase">
                              Sabores:
                            </span>
                            {item.pastelDetails.flavors.map((f) => (
                              <span
                                key={f.id}
                                className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold text-[11px]"
                              >
                                {f.name}
                              </span>
                            ))}
                          </div>

                          {/* Complementos */}
                          {item.pastelDetails.complements.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-bold text-stone-500 text-[10px] uppercase">
                                Comp.:
                              </span>
                              {item.pastelDetails.complements.map((c) => (
                                <span
                                  key={c.id}
                                  className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-semibold text-[11px]"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Molhos */}
                          {item.pastelDetails.sauces.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-bold text-stone-500 text-[10px] uppercase">
                                Molhos:
                              </span>
                              {item.pastelDetails.sauces.map((s) => (
                                <span
                                  key={s.id}
                                  className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 font-semibold text-[11px]"
                                >
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Observações */}
                          {item.pastelDetails.notes && (
                            <p className="text-[11px] text-stone-500 italic pt-1">
                              Obs: &ldquo;{item.pastelDetails.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}

                      {/* Controles de Quantidade e Total da Linha */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60">
                        <div className="flex items-center bg-white rounded-xl border border-stone-200 shadow-xs p-0.5">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, -1)}
                            className="w-7 h-7 rounded-lg text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, 1)}
                            className="w-7 h-7 rounded-lg text-stone-600 hover:bg-stone-100 flex items-center justify-center transition-colors font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-black text-stone-900 text-sm font-display">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer com Totais e Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-stone-50 space-y-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between font-medium">
                  <span>Subtotal ({totalCount} itens):</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-700">
                  <span>Taxa de Atendimento / Embalagem:</span>
                  <span>Grátis</span>
                </div>
                <div className="flex justify-between items-center text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total do Pedido:</span>
                  <span className="text-xl text-amber-600 font-display">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                id="cart-checkout-button"
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform active:scale-98"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

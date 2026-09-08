'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PaymentMethod, OrderType, DeliveryDetails } from '@/types';
import { formatCurrency } from '@/utils/format';
import { playSuccessChime } from '@/utils/audio';
import { getStoreOpenStatus } from '@/utils/schedule';
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
  Truck,
  MapPin,
  Home,
  UserCheck,
  Phone,
  Info,
  ShieldCheck,
  BellRing,
  Clock,
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    getCartTotal,
    createOrder,
    pixConfig,
    storeSchedule,
    showToast,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Campos de Entrega Delivery
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [houseDetails, setHouseDetails] = useState('');
  const [referencePoint, setReferencePoint] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const totalAmount = getCartTotal();
  const storeStatus = getStoreOpenStatus(storeSchedule);
  const isStoreClosed = !storeStatus.isOpen && storeSchedule.autoRejectOrdersWhenClosed;

  const changeForNumber = parseFloat(changeFor.replace(',', '.')) || 0;
  const calculatedChange = changeForNumber > totalAmount ? changeForNumber - totalAmount : 0;
  const isChangeInsufficient =
    paymentMethod === 'dinheiro' && changeForNumber > 0 && changeForNumber < totalAmount;

  const handleCopyPix = () => {
    const currentKey = pixConfig?.key || 'pix@suculentospastelaria.com.br';
    navigator.clipboard?.writeText(currentKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isStoreClosed) {
      showToast('⚠️ A pastelaria está fechada no momento. Não é possível enviar pedidos fora do horário.');
      return;
    }

    if (!customerName.trim()) {
      setNameError(true);
      return;
    }

    let deliveryDetailsObj: DeliveryDetails | undefined = undefined;

    if (orderType === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setDeliveryError('Por favor, preencha a Rua, Número e Bairro para a entrega.');
        return;
      }

      const assignedContact = contactPerson.trim() || customerName.trim();
      deliveryDetailsObj = {
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        complement: complement.trim() || undefined,
        houseDetails: houseDetails.trim() || undefined,
        referencePoint: referencePoint.trim() || undefined,
        contactPerson: assignedContact,
        contactPhone: contactPhone.trim() || undefined,
      };
    }

    createOrder({
      customerName: customerName.trim(),
      orderType,
      tableNumber: orderType === 'mesa' ? tableNumber.trim() : undefined,
      deliveryDetails: deliveryDetailsObj,
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
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Etapa Final
            </div>
            <h2 className="text-xl font-black font-display">Identificação & Pagamento</h2>
            <p className="text-amber-100 text-xs mt-0.5">
              Informe seus dados para entrega rápida ou preparo no balcão!
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
              Seu Nome Completo ou Como Prefere ser Chamado <span className="text-red-500">*</span>
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
              Como deseja receber seu pedido? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'delivery' as const, label: 'Entrega Delivery', icon: Truck, badge: 'Em Casa' },
                { id: 'viagem' as const, label: 'Para Viagem', icon: ShoppingBag, badge: 'Retirar' },
                { id: 'mesa' as const, label: 'Na Mesa', icon: Utensils, badge: 'No Local' },
                { id: 'balcao' as const, label: 'No Balcão', icon: Store, badge: 'Rápido' },
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = orderType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setOrderType(type.id);
                      setDeliveryError(null);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm ring-2 ring-amber-500/30'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                    <span>{type.label}</span>
                    <span className={`text-[9px] font-semibold mt-0.5 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`}>
                      {type.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Campo Específico para Mesa */}
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

          {/* Seção Completa de Endereço de Entrega (Delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-amber-50/70 border border-amber-200 animate-slide-up">
              <div className="flex items-center gap-2 text-amber-950 font-black text-sm border-b border-amber-200/80 pb-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Endereço Completo para Entrega</span>
              </div>

              {deliveryError && (
                <div className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deliveryError}</span>
                </div>
              )}

              {/* Rua e Número */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1">
                    Rua / Avenida <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      if (deliveryError) setDeliveryError(null);
                    }}
                    placeholder="Ex: Rua das Flores"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1">
                    Número <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      if (deliveryError) setDeliveryError(null);
                    }}
                    placeholder="Ex: 142"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-bold"
                  />
                </div>
              </div>

              {/* Bairro e Complemento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1">
                    Bairro <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={neighborhood}
                    onChange={(e) => {
                      setNeighborhood(e.target.value);
                      if (deliveryError) setDeliveryError(null);
                    }}
                    placeholder="Ex: Centro / Jardim das Rosas"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1">
                    Complemento / Apto (Opcional)
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Ex: Apto 204 Bloco B, Casa 2"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Detalhes da Casa / Residência */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1 flex items-center gap-1">
                  <Home className="w-3.5 h-3.5 text-amber-700" />
                  <span>Detalhes da Residência / Fachada</span>
                </label>
                <input
                  type="text"
                  value={houseDetails}
                  onChange={(e) => setHouseDetails(e.target.value)}
                  placeholder="Ex: Portão marrom de grade, casa dos fundos, interfone toca alto..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Ponto de Referência */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1">
                  Ponto de Referência (Opcional)
                </label>
                <input
                  type="text"
                  value={referencePoint}
                  onChange={(e) => setReferencePoint(e.target.value)}
                  placeholder="Ex: Próximo à padaria São Jorge, em frente à pracinha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Pessoa a Procurar e Telefone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1 border-t border-amber-200/80">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pessoa a ser Procurada <span className="text-red-600">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder={customerName ? `Ex: ${customerName} (ou familiar)` : 'Ex: Carlos / Maria (mãe)'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-amber-900 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                    <span>WhatsApp / Telefone para Avisos</span>
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Recomendações para uma Entrega Rápida e Perfeita */}
              <div className="p-3.5 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-black text-amber-900">
                  <BellRing className="w-4 h-4 text-amber-700 shrink-0 animate-bounce" />
                  <span>Recomendações Importantes para sua Entrega 🛵:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-amber-900 font-medium pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Fique atento no portão/celular:</strong> Assim que o pedido mudar para <em>"Saiu para Entrega"</em> aqui no app, fique no aguardo da campainha ou chamada.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Atenção aos Pets:</strong> Caso tenha animais domésticos, mantenha-os presos para maior segurança e rapidez do entregador.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span><strong>Pagamento Facilitado:</strong> Deixe o dinheiro ou cartão já em mãos para agilizar e receber seu pastel super crocante e quentinho!</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pix' as const, label: 'PIX', icon: QrCode, badge: 'Instantâneo' },
                { id: 'debito' as const, label: 'Débito', icon: CreditCard, badge: 'Na Maquininha' },
                { id: 'credito' as const, label: 'Crédito', icon: CreditCard, badge: 'Na Maquininha' },
                { id: 'dinheiro' as const, label: 'Dinheiro', icon: Banknote, badge: 'Espécie' },
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
                    <span className={`text-[9px] font-medium mt-0.5 ${isSelected ? 'text-amber-700' : 'text-stone-400'}`}>
                      {m.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Painel Específico do Método de Pagamento */}
            <div className="mt-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-3">
              {paymentMethod === 'pix' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-stone-800">
                      Chave PIX {pixConfig?.keyType === 'cpf' ? '(CPF)' : pixConfig?.keyType === 'cnpj' ? '(CNPJ)' : pixConfig?.keyType === 'telefone' ? '(Celular / WhatsApp)' : pixConfig?.keyType === 'aleatoria' ? '(Aleatória)' : '(E-mail)'}:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar Chave'}</span>
                    </button>
                  </div>
                  <code className="block p-2.5 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-800 font-mono font-bold select-all break-all shadow-xs">
                    {pixConfig?.key || 'pix@suculentospastelaria.com.br'}
                  </code>
                  {pixConfig?.receiverName && (
                    <div className="text-[11px] text-stone-600 flex items-center justify-between pt-0.5">
                      <span>Favorecido:</span>
                      <span className="font-bold text-stone-800">{pixConfig.receiverName}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-stone-500">
                    {pixConfig?.instructions || 'O comprovante pode ser apresentado no momento da entrega do lanche.'}
                  </p>
                </div>
              )}

              {(paymentMethod === 'debito' || paymentMethod === 'credito') && (
                <div className="flex items-center gap-2.5 text-stone-700">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-xs">
                    {orderType === 'delivery'
                      ? 'O entregador levará a maquininha física de cartões até a sua porta.'
                      : 'O pagamento será processado na maquininha física ao retirar no balcão ou na mesa.'}
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
              placeholder="Ex: Guardanapos extras, molho à parte..."
              className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs outline-none focus:border-amber-500"
            />
          </div>

          {/* Resumo de Preço e Envio */}
          <div className="pt-3 border-t border-stone-200 space-y-3">
            {isStoreClosed && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                  <strong>Loja Offline:</strong> {storeStatus.subText}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-stone-900">
              <span className="text-sm font-bold">Total a pagar:</span>
              <span className="text-2xl font-black text-amber-600 font-display">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              id="confirm-order-button"
              disabled={isStoreClosed}
              className={`w-full flex items-center justify-center gap-2 py-4 font-black text-base rounded-2xl shadow-lg transition-all transform active:scale-98 ${
                isStoreClosed
                  ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-600/25 cursor-pointer'
              }`}
            >
              {isStoreClosed ? (
                <>
                  <Clock className="w-5 h-5 text-stone-600" />
                  <span>Loja Fechada no Momento</span>
                </>
              ) : (
                <span>Confirmar e Enviar Pedido 🚀</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


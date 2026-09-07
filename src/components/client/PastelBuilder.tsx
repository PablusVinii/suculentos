'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { PastelSize } from '@/types';
import { formatCurrency } from '@/utils/format';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  User,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';

export const PastelBuilder: React.FC = () => {
  const {
    pastelSizes,
    ingredients,
    builderStep,
    builderSize,
    builderFlavors,
    builderComplements,
    builderSauces,
    builderNotes,
    builderRecipientLabel,
    setBuilderStep,
    setBuilderSize,
    toggleBuilderFlavor,
    toggleBuilderComplement,
    toggleBuilderSauce,
    selectAllAvailableFlavors,
    clearBuilderFlavors,
    setBuilderNotes,
    setBuilderRecipientLabel,
    addCustomPastelToCart,
    cart,
    setClientActiveTab,
  } = useStore();

  const [quantity, setQuantity] = useState(1);

  // Filtra ingredientes por categoria
  const flavors = ingredients.filter((i) => i.category === 'flavor');
  const complements = ingredients.filter((i) => i.category === 'complement');
  const sauces = ingredients.filter((i) => i.category === 'sauce');

  const flavorsLimit = builderSize.maxFlavors;
  const flavorsSelectedCount = builderFlavors.length;
  const isFlavorsLimitReached = flavorsSelectedCount >= flavorsLimit;

  // Verifica se pode avançar
  const canProceedFromStep2 = flavorsSelectedCount > 0;

  // Agrupa sabores por tags
  const flavorGroups = Array.from(
    new Set(flavors.map((f) => f.groupTag || 'Outros'))
  );

  const pastelsInCartCount = cart.filter((i) => i.type === 'custom_pastel').length;

  const handleSizeSelect = (size: PastelSize) => {
    setBuilderSize(size);
    setBuilderStep(2);
  };

  const handleAddAndBuildAnother = () => {
    if (builderFlavors.length === 0) {
      setBuilderStep(2);
      return;
    }
    addCustomPastelToCart({ quantity, openCart: false });
    setQuantity(1);
    setBuilderStep(1);
  };

  const handleAddAndGoToCart = () => {
    if (builderFlavors.length === 0) {
      setBuilderStep(2);
      return;
    }
    addCustomPastelToCart({ quantity, openCart: true });
    setQuantity(1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Banner de Boas-vindas / Carro-Chefe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white p-6 sm:p-8 mb-8 shadow-xl shadow-orange-950/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Faça quantos pastéis quiser para sua família ou amigos!
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-display mb-2">
            Monte o Pastel dos Seus Sonhos 🥟
          </h2>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Massa fresca super crocante, frita na hora. Você pode personalizar cada pastel individualmente, adicionar salgados e bebidas e finalizar tudo em uma única comanda!
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 text-9xl pointer-events-none select-none">
          🥟
        </div>
      </div>

      {/* Aviso de pastéis já no carrinho */}
      {pastelsInCartCount > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-stone-800 font-medium">
            <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Você já tem <strong>{pastelsInCartCount} {pastelsInCartCount === 1 ? 'pastel' : 'pastéis'}</strong> no seu carrinho. Monte quantos desejar antes de finalizar!
            </span>
          </div>
          <button
            onClick={() => useStore.getState().setIsCartOpen(true)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold whitespace-nowrap shadow-xs transition-colors"
          >
            Ver Carrinho Atual
          </button>
        </div>
      )}

      {/* Barra de Progresso do Wizard */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
          {[
            { step: 1, title: '1. Tamanho', desc: 'Preço fixo' },
            {
              step: 2,
              title: '2. Sabores',
              desc: `${flavorsSelectedCount}/${flavorsLimit} selecionados`,
            },
            {
              step: 3,
              title: '3. Complementos',
              desc: `${builderComplements.length} adicionados`,
            },
            {
              step: 4,
              title: '4. Molhos & Nome',
              desc: `${builderSauces.length} adicionados`,
            },
          ].map((item) => {
            const isCurrent = builderStep === item.step;
            const isCompleted = builderStep > item.step;
            return (
              <button
                key={item.step}
                onClick={() => setBuilderStep(item.step as 1 | 2 | 3 | 4)}
                className={`flex flex-col text-left p-2.5 sm:p-3 rounded-2xl border transition-all text-xs sm:text-sm ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950'
                    : 'border-stone-200 bg-white text-stone-500 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-0.5">
                  <span
                    className={
                      isCurrent
                        ? 'text-amber-700'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-stone-700'
                    }
                  >
                    {item.title}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-stone-500 truncate">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal do Wizard */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-8 shadow-sm mb-8">
        {/* =========================================================================
            ETAPA 1: ESCOLHA DO TAMANHO / PREÇO
        ========================================================================== */}
        {builderStep === 1 && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-black text-stone-900 font-display">
                Etapa 1: Selecione a Categoria do seu Pastel
              </h3>
              <p className="text-sm text-stone-500">
                O preço é fixo de acordo com a quantidade máxima de recheios que você deseja combinar.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pastelSizes.map((size) => {
                const isSelected = builderSize.id === size.id;
                return (
                  <div
                    key={size.id}
                    onClick={() => handleSizeSelect(size)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50/70 bg-white'
                    }`}
                  >
                    {size.badge && (
                      <span
                        className={`absolute -top-3 right-4 px-3 py-0.5 rounded-full text-xs font-black tracking-wide uppercase ${
                          size.isPopular
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {size.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-extrabold text-stone-900">
                          {size.name}
                        </span>
                        <span className="text-2xl font-black text-amber-600 font-display">
                          {formatCurrency(size.price)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 mb-4 leading-relaxed">
                        {size.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200/60 text-xs font-bold">
                      <span className="text-stone-500">
                        {size.id === 'tudinh' || size.id === 'lua_cheia'
                          ? 'Recheios: Todos liberados!'
                          : `Limite: Até ${size.maxFlavors} sabores`}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isSelected ? 'text-amber-700' : 'text-stone-400'
                        }`}
                      >
                        {isSelected ? 'Selecionado' : 'Escolher'}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setBuilderStep(2)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all"
              >
                <span>Avançar para Recheios</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 2: SELEÇÃO DE SABORES (COM TRAVA DINÂMICA DE LIMITE)
        ========================================================================== */}
        {builderStep === 2 && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-stone-900 font-display">
                    Etapa 2: Escolha os Sabores
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                    {builderSize.name} ({formatCurrency(builderSize.price)})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Selecione até{' '}
                  <strong className="text-stone-900">{flavorsLimit} sabores</strong> para
                  compor seu recheio.
                </p>
              </div>

              {/* Contador de Limite em Destaque */}
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-2xl font-black text-sm border flex items-center gap-2 ${
                    isFlavorsLimitReached
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  <span>
                    {flavorsSelectedCount} de {flavorsLimit}
                  </span>
                  {isFlavorsLimitReached ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                      Limite atingido
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">
                      restam {flavorsLimit - flavorsSelectedCount}
                    </span>
                  )}
                </div>

                {/* Ações Rápidas */}
                {(builderSize.id === 'tudinh' || builderSize.id === 'lua_cheia') && (
                  <button
                    onClick={selectAllAvailableFlavors}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    Marcar Todos
                  </button>
                )}
                {flavorsSelectedCount > 0 && (
                  <button
                    onClick={clearBuilderFlavors}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Limpar seleção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sugestão de Upsell */}
            {builderSize.id === '3_sabores' && isFlavorsLimitReached && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 flex items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 text-stone-800">
                  <Flame className="w-5 h-5 text-orange-600 shrink-0" />
                  <span>
                    Quer mais recheio? Mude para o <strong>5 Sabores</strong> por apenas{' '}
                    <strong className="text-orange-700">+R$ 2,00</strong>!
                  </span>
                </div>
                <button
                  onClick={() => {
                    const size5 = pastelSizes.find((s) => s.id === '5_sabores');
                    if (size5) setBuilderSize(size5);
                  }}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-extrabold whitespace-nowrap shadow-sm transition-all"
                >
                  Fazer Upgrade 🚀
                </button>
              </div>
            )}

            {/* Grid de Recheios */}
            <div className="space-y-6">
              {flavorGroups.map((group) => {
                const groupFlavors = flavors.filter((f) => (f.groupTag || 'Outros') === group);
                return (
                  <div key={group} className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      {group}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {groupFlavors.map((flavor) => {
                        const isSelected = builderFlavors.some((f) => f.id === flavor.id);
                        const isUnavailable = !flavor.available;
                        const isDisabled = isUnavailable || (!isSelected && isFlavorsLimitReached);

                        return (
                          <button
                            key={flavor.id}
                            disabled={isDisabled}
                            onClick={() => toggleBuilderFlavor(flavor)}
                            className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                              isSelected
                                ? 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20 font-bold scale-[1.02]'
                                : isUnavailable
                                ? 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                                : isDisabled
                                ? 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed'
                                : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 text-stone-800 bg-white shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <span
                                className={`text-xs sm:text-sm leading-snug font-bold ${
                                  isSelected ? 'text-white' : 'text-stone-900'
                                }`}
                              >
                                {flavor.name}
                              </span>
                              {isSelected ? (
                                <span className="w-5 h-5 rounded-full bg-white text-amber-600 flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              ) : isUnavailable ? (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                  Esgotado
                                </span>
                              ) : null}
                            </div>

                            <div className="text-[11px] opacity-80 flex items-center justify-between">
                              <span>{flavor.groupTag}</span>
                              {isSelected && <span className="text-[10px]">✓ Escolhido</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navegação de Etapas */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-200">
              <button
                onClick={() => setBuilderStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl font-bold transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar ao Tamanho</span>
              </button>

              <button
                disabled={!canProceedFromStep2}
                onClick={() => setBuilderStep(3)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all text-sm ${
                  canProceedFromStep2
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>Avançar para Complementos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 3: COMPLEMENTOS (MÚLTIPLA ESCOLHA LIVRE)
        ========================================================================== */}
        {builderStep === 3 && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-black text-stone-900 font-display">
                  Etapa 3: Escolha seus Complementos
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Múltipla escolha liberada! Selecione os adicionais que desejar (sem custo extra).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                {builderComplements.length} selecionados
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
              {complements.map((comp) => {
                const isSelected = builderComplements.some((c) => c.id === comp.id);
                const isUnavailable = !comp.available;

                return (
                  <button
                    key={comp.id}
                    disabled={isUnavailable}
                    onClick={() => toggleBuilderComplement(comp)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold'
                        : isUnavailable
                        ? 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                        : 'border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/30 text-stone-800 bg-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{comp.name}</span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : isUnavailable ? (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        Esgotado
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-stone-200">
              <button
                onClick={() => setBuilderStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl font-bold transition-all text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar aos Sabores</span>
              </button>

              <button
                onClick={() => setBuilderStep(4)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all text-sm"
              >
                <span>Avançar para Molhos & Finalizar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ETAPA 4: MOLHOS, RÓTULO DO PASTEL & AÇÕES DE ADIÇÃO
        ========================================================================== */}
        {builderStep === 4 && (
          <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-black text-stone-900 font-display">
                  Etapa 4: Molhos, Rótulo & Adicionar ao Pedido
                </h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Identifique este pastel caso esteja pedindo para alguém especial da família!
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                {builderSauces.length} selecionados
              </span>
            </div>

            {/* Grid de Molhos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {sauces.map((sauce) => {
                const isSelected = builderSauces.some((s) => s.id === sauce.id);
                const isUnavailable = !sauce.available;

                return (
                  <button
                    key={sauce.id}
                    disabled={isUnavailable}
                    onClick={() => toggleBuilderSauce(sauce)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                        : isUnavailable
                        ? 'border-stone-200 bg-stone-100 text-stone-400 opacity-60 cursor-not-allowed'
                        : 'border-stone-200 hover:border-orange-300 hover:bg-orange-50/30 text-stone-800 bg-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{sauce.name}</span>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-white text-orange-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : isUnavailable ? (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        Esgotado
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-stone-400">
                        <Plus className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Identificação de Para Quem é o Pastel & Observações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Para quem é este pastel? (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={builderRecipientLabel}
                  onChange={(e) => setBuilderRecipientLabel(e.target.value)}
                  placeholder="Ex: Para a Mãe, Pastel do João, Meu..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Observações para a Cozinha (Opcional)
                </label>
                <input
                  type="text"
                  value={builderNotes}
                  onChange={(e) => setBuilderNotes(e.target.value)}
                  placeholder="Ex: Bem frito e sequinho, caprichar no orégano..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-xs sm:text-sm transition-all"
                />
              </div>
            </div>

            {/* Resumo Visual Completo da Montagem */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <span className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Resumo do Pastel:</span>
                  {builderRecipientLabel && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-black">
                      {builderRecipientLabel}
                    </span>
                  )}
                </span>
                <span className="font-black text-amber-600 text-lg font-display">
                  {formatCurrency(builderSize.price * quantity)}
                </span>
              </div>

              {/* Sabores */}
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Recheios ({builderFlavors.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {builderFlavors.map((f) => (
                    <span
                      key={f.id}
                      className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300"
                    >
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Complementos */}
              {builderComplements.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Complementos ({builderComplements.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {builderComplements.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Molhos */}
              {builderSauces.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    Molhos ({builderSauces.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {builderSauces.map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-0.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ações de Quantidade e Adição ao Carrinho */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
              <button
                onClick={() => setBuilderStep(3)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl font-bold transition-all text-sm w-full sm:w-auto justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Voltar aos Complementos</span>
              </button>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                {/* Seletor de Quantidade de Pastéis Idênticos */}
                <div className="flex items-center bg-stone-100 rounded-2xl p-1 border border-stone-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-xl bg-white text-stone-700 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-black text-stone-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-xl bg-white text-stone-700 font-bold hover:bg-stone-200 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Opção 1: Adicionar ao Carrinho e Montar Outro */}
                <button
                  id="add-and-build-another-button"
                  onClick={handleAddAndBuildAnother}
                  className="px-4 py-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold rounded-2xl transition-all text-xs sm:text-sm border border-amber-300 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar & Montar Outro</span>
                </button>

                {/* Opção 2: Adicionar e Ver Carrinho / Finalizar */}
                <button
                  id="add-custom-pastel-button"
                  onClick={handleAddAndGoToCart}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 text-xs sm:text-sm"
                >
                  <span>Incluir no Carrinho</span>
                  <span>•</span>
                  <span>{formatCurrency(builderSize.price * quantity)}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Atalhos para Salgados e Bebidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <button
          onClick={() => setClientActiveTab('salgados')}
          className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              🥐
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-amber-700 transition-colors">
                Quer adicionar Salgados?
              </h4>
              <p className="text-xs text-stone-500">Coxinhas cremosas, empadas e kibes.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors" />
        </button>

        <button
          onClick={() => setClientActiveTab('bebidas')}
          className="p-5 rounded-3xl bg-white border border-stone-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              🥤
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm group-hover:text-amber-700 transition-colors">
                Bebidas & Sucos Gelados
              </h4>
              <p className="text-xs text-stone-500">Refrigerantes em lata e sucos da fruta.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 transition-colors" />
        </button>
      </div>
    </div>
  );
};

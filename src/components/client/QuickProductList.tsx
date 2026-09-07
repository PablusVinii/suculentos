'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ProductCategory, Product } from '@/types';
import { formatCurrency } from '@/utils/format';
import { Plus, Check, ShoppingBag, Search, Sparkles } from 'lucide-react';

interface QuickProductListProps {
  category: ProductCategory;
}

export const QuickProductList: React.FC<QuickProductListProps> = ({ category }) => {
  const { products, addQuickProductToCart } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const categoryProducts = products.filter((p) => p.category === category);

  const filteredProducts = categoryProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (product: Product) => {
    addQuickProductToCart(product, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1000);
  };

  const title = category === 'salgado' ? 'Salgados Prontos & Fritos' : 'Bebidas & Sucos Gelados';
  const subtitle =
    category === 'salgado'
      ? 'Coxinhas cremosas, empadas que derretem na boca e sobremesas quentinhas.'
      : 'Refrigerantes em lata, sucos naturais da fruta e água para acompanhar seu lanche.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header da Seção & Barra de Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{category === 'salgado' ? '🥐' : '🥤'}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
              {title}
            </h2>
          </div>
          <p className="text-stone-500 text-sm">{subtitle}</p>
        </div>

        {/* Busca rápida */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar em ${category === 'salgado' ? 'salgados' : 'bebidas'}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-3xl border border-dashed border-stone-300">
          <p className="text-stone-500 font-medium">Nenhum produto encontrado para &ldquo;{searchTerm}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const isAdded = addedAnimationId === product.id;
            const isUnavailable = !product.available;

            return (
              <div
                key={product.id}
                className={`group bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isUnavailable
                    ? 'border-stone-200 opacity-60'
                    : 'border-stone-200/80 hover:border-amber-400 hover:shadow-xl hover:shadow-orange-950/5'
                }`}
              >
                {/* Imagem com badge */}
                <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black tracking-wide uppercase bg-amber-500 text-white shadow-md">
                      {product.badge}
                    </span>
                  )}

                  {product.unit && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-black/60 backdrop-blur-md text-white">
                      {product.unit}
                    </span>
                  )}

                  {isUnavailable && (
                    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg">
                        Esgotado no Momento
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalhes do Produto */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900 mb-1 leading-snug group-hover:text-amber-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Preço e Botão Adicionar */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">
                        Preço
                      </span>
                      <span className="text-xl font-black text-amber-600 font-display">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <button
                      disabled={isUnavailable}
                      onClick={() => handleAdd(product)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm ${
                        isUnavailable
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-amber-500/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Adicionado!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

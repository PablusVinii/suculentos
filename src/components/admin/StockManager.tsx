'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatCurrency } from '@/utils/format';
import { Ingredient, Product, IngredientCategory, ProductCategory } from '@/types';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  CupSoda,
  UtensilsCrossed,
  X,
  Sparkles,
  Image as ImageIcon,
  Tag,
  DollarSign,
  PackageCheck,
  Check,
} from 'lucide-react';

type ItemType = 'flavor' | 'complement' | 'sauce' | 'salgado' | 'bebida';

interface PresetImage {
  label: string;
  url: string;
  category: 'salgado' | 'bebida';
}

const PRESET_IMAGES: PresetImage[] = [
  {
    label: 'Coxinha Catupiry',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    category: 'salgado',
  },
  {
    label: 'Empada de Frango',
    url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500&auto=format&fit=crop&q=80',
    category: 'salgado',
  },
  {
    label: 'Kibe Recheado',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
    category: 'salgado',
  },
  {
    label: 'Enroladinho',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=80',
    category: 'salgado',
  },
  {
    label: 'Pastel Doce / Churros',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    category: 'salgado',
  },
  {
    label: 'Coca-Cola / Refri',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    category: 'bebida',
  },
  {
    label: 'Guaraná / Lata',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    category: 'bebida',
  },
  {
    label: 'Suco Natural',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    category: 'bebida',
  },
  {
    label: 'Água Mineral',
    url: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=500&auto=format&fit=crop&q=80',
    category: 'bebida',
  },
  {
    label: 'Cerveja Gelada',
    url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=500&auto=format&fit=crop&q=80',
    category: 'bebida',
  },
];

const FLAVOR_GROUP_PRESETS = [
  'Carne',
  'Queijo',
  'Frango',
  'Frutos do Mar',
  'Suíno / Embutidos',
  'Especial',
  'Doce',
  'Vegetariano',
];

export const StockManager: React.FC = () => {
  const {
    ingredients,
    products,
    toggleIngredientAvailability,
    toggleProductAvailability,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addProduct,
    updateProduct,
    deleteProduct,
    resetStockToDefaults,
  } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<
    'all' | 'flavors' | 'complements' | 'sauces' | 'salgados' | 'bebidas'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: ItemType;
    data: Ingredient | Product;
  } | null>(null);

  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    isProduct: boolean;
  } | null>(null);

  // Formulário Modal State
  const [formType, setFormType] = useState<ItemType>('flavor');
  const [formName, setFormName] = useState('');
  const [formGroupTag, setFormGroupTag] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);

  // Filtros
  const flavors = ingredients.filter((i) => i.category === 'flavor');
  const complements = ingredients.filter((i) => i.category === 'complement');
  const sauces = ingredients.filter((i) => i.category === 'sauce');
  const salgados = products.filter((p) => p.category === 'salgado');
  const bebidas = products.filter((p) => p.category === 'bebida');

  const filteredFlavors = flavors.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.groupTag && f.groupTag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredComplements = complements.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSauces = sauces.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalgados = salgados.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBebidas = bebidas.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unavailableCount =
    ingredients.filter((i) => !i.available).length + products.filter((p) => !p.available).length;

  // Abrir Modal de Criação
  const handleOpenCreateModal = (defaultType: ItemType = 'flavor') => {
    setEditingItem(null);
    setFormType(defaultType);
    setFormName('');
    setFormGroupTag('Carne');
    setFormPrice(defaultType === 'salgado' ? '8.50' : defaultType === 'bebida' ? '6.00' : '');
    setFormDescription('');
    setFormImage(
      defaultType === 'salgado'
        ? PRESET_IMAGES[0].url
        : defaultType === 'bebida'
        ? PRESET_IMAGES[5].url
        : ''
    );
    setFormBadge('');
    setFormUnit(defaultType === 'salgado' ? 'Unidade' : defaultType === 'bebida' ? 'Lata 350ml' : '');
    setFormAvailable(true);
    setIsFormModalOpen(true);
  };

  // Abrir Modal de Edição de Ingrediente
  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditingItem({ type: ing.category, data: ing });
    setFormType(ing.category);
    setFormName(ing.name);
    setFormGroupTag(ing.groupTag || 'Carne');
    setFormPrice('');
    setFormDescription('');
    setFormImage('');
    setFormBadge('');
    setFormUnit('');
    setFormAvailable(ing.available);
    setIsFormModalOpen(true);
  };

  // Abrir Modal de Edição de Produto (Salgado / Bebida)
  const handleOpenEditProduct = (prod: Product) => {
    setEditingItem({ type: prod.category, data: prod });
    setFormType(prod.category);
    setFormName(prod.name);
    setFormGroupTag('');
    setFormPrice(prod.price.toString());
    setFormDescription(prod.description);
    setFormImage(prod.image);
    setFormBadge(prod.badge || '');
    setFormUnit(prod.unit || '');
    setFormAvailable(prod.available);
    setIsFormModalOpen(true);
  };

  // Salvar Criação ou Modificação
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (formType === 'flavor' || formType === 'complement' || formType === 'sauce') {
      // É um Ingrediente
      if (editingItem) {
        updateIngredient(editingItem.data.id, {
          name: formName.trim(),
          category: formType as IngredientCategory,
          groupTag: formType === 'flavor' ? formGroupTag.trim() : undefined,
          available: formAvailable,
        });
      } else {
        addIngredient({
          name: formName.trim(),
          category: formType as IngredientCategory,
          groupTag: formType === 'flavor' ? formGroupTag.trim() : undefined,
          available: formAvailable,
        });
      }
    } else {
      // É um Produto (Salgado ou Bebida)
      const numPrice = parseFloat(formPrice.replace(',', '.')) || 0;
      const defaultImg =
        formType === 'salgado' ? PRESET_IMAGES[0].url : PRESET_IMAGES[5].url;

      if (editingItem) {
        updateProduct(editingItem.data.id, {
          name: formName.trim(),
          category: formType as ProductCategory,
          price: numPrice,
          description: formDescription.trim() || 'Feito na hora com ingredientes selecionados.',
          image: formImage.trim() || defaultImg,
          badge: formBadge.trim() || undefined,
          unit: formUnit.trim() || undefined,
          available: formAvailable,
        });
      } else {
        addProduct({
          name: formName.trim(),
          category: formType as ProductCategory,
          price: numPrice,
          description: formDescription.trim() || 'Feito na hora com ingredientes selecionados.',
          image: formImage.trim() || defaultImg,
          badge: formBadge.trim() || undefined,
          unit: formUnit.trim() || undefined,
          available: formAvailable,
        });
      }
    }

    setIsFormModalOpen(false);
  };

  // Confirmar Exclusão
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.isProduct) {
      deleteProduct(itemToDelete.id);
    } else {
      deleteIngredient(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Header do Gerenciador de Estoque */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-stone-900 font-display">
              Gestão de Estoque & Cardápio ⚡
            </h2>
            {unavailableCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                {unavailableCount} itens pausados
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Inclua novos sabores, modifique preços/nomes, pause itens esgotados ou exclua produtos. Tudo sincroniza na hora com o totem e o cardápio do cliente.
          </p>
        </div>

        {/* Botões de Ação do Topo */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botão de Incluir Novo Item */}
          <button
            id="admin-add-item-button"
            onClick={() => handleOpenCreateModal('flavor')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Incluir Novo Item</span>
          </button>

          {/* Botão Restaurar Padrões */}
          <button
            onClick={resetStockToDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors border border-stone-200"
            title="Restaurar o cardápio e estoque para o padrão de fábrica"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Restaurar Padrões</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Sub-abas de Filtro */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all' as const, label: 'Todos os Itens' },
            { id: 'flavors' as const, label: `🥩 Sabores (${flavors.length})` },
            { id: 'complements' as const, label: `🌽 Complementos (${complements.length})` },
            { id: 'sauces' as const, label: `🥫 Molhos (${sauces.length})` },
            { id: 'salgados' as const, label: `🥐 Salgados (${salgados.length})` },
            { id: 'bebidas' as const, label: `🥤 Bebidas (${bebidas.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                activeSubTab === tab.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all"
          />
        </div>
      </div>

      {/* Seções de Itens do Cardápio */}
      <div className="space-y-8">
        {/* 1. SABORES / RECHEIOS DO PASTEL */}
        {(activeSubTab === 'all' || activeSubTab === 'flavors') && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥩</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Sabores & Recheios Principais ({filteredFlavors.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Itens que compõem os pastéis de 3 Sabores, 5 Sabores, Tudin'h e Lua Cheia
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal('flavor')}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Sabor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredFlavors.map((flavor) => {
                return (
                  <div
                    key={flavor.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      flavor.available
                        ? 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-amber-300 shadow-2xs'
                        : 'bg-red-50/50 border-red-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm block">
                          {flavor.name}
                        </span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200/80 text-stone-700">
                          {flavor.groupTag || 'Recheio'}
                        </span>
                      </div>

                      {/* Switch de Disponibilidade */}
                      <button
                        onClick={() => toggleIngredientAvailability(flavor.id)}
                        title={flavor.available ? 'Clique para pausar item' : 'Clique para ativar item'}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          flavor.available ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            flavor.available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Botões de Ação: Editar e Excluir */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] font-bold text-stone-500">
                        {flavor.available ? (
                          <span className="text-emerald-700">🟢 Ativo</span>
                        ) : (
                          <span className="text-red-600">🔴 Pausado</span>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditIngredient(flavor)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Editar este sabor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: flavor.id,
                              name: flavor.name,
                              isProduct: false,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
                          title="Excluir este sabor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. COMPLEMENTOS */}
        {(activeSubTab === 'all' || activeSubTab === 'complements') && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌽</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Complementos ({filteredComplements.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Ingredientes livres adicionados no passo 3 da montagem
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal('complement')}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Complemento</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredComplements.map((comp) => {
                return (
                  <div
                    key={comp.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      comp.available
                        ? 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-emerald-300 shadow-2xs'
                        : 'bg-red-50/50 border-red-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm block">
                          {comp.name}
                        </span>
                        <span className="text-[11px] text-stone-500">Adicional Livre</span>
                      </div>

                      <button
                        onClick={() => toggleIngredientAvailability(comp.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          comp.available ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            comp.available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] font-bold text-stone-500">
                        {comp.available ? (
                          <span className="text-emerald-700">🟢 Ativo</span>
                        ) : (
                          <span className="text-red-600">🔴 Pausado</span>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditIngredient(comp)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Editar este complemento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: comp.id,
                              name: comp.name,
                              isProduct: false,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
                          title="Excluir este complemento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MOLHOS */}
        {(activeSubTab === 'all' || activeSubTab === 'sauces') && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥫</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Molhos da Casa ({filteredSauces.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Molhos e acompanhamentos selecionados no passo 4 da montagem
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal('sauce')}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 font-extrabold text-xs border border-orange-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Molho</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredSauces.map((sauce) => {
                return (
                  <div
                    key={sauce.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      sauce.available
                        ? 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-orange-300 shadow-2xs'
                        : 'bg-red-50/50 border-red-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-stone-900 text-xs sm:text-sm block">
                          {sauce.name}
                        </span>
                        <span className="text-[11px] text-stone-500">Molho / Sachê</span>
                      </div>

                      <button
                        onClick={() => toggleIngredientAvailability(sauce.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          sauce.available ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            sauce.available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <span className="text-[11px] font-bold text-stone-500">
                        {sauce.available ? (
                          <span className="text-emerald-700">🟢 Ativo</span>
                        ) : (
                          <span className="text-red-600">🔴 Pausado</span>
                        )}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditIngredient(sauce)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Editar este molho"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: sauce.id,
                              name: sauce.name,
                              isProduct: false,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
                          title="Excluir este molho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. SALGADOS */}
        {(activeSubTab === 'all' || activeSubTab === 'salgados') && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥐</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Salgados Prontos ({filteredSalgados.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Itens de balcão adicionados com 1 clique no cardápio
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal('salgado')}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Novo Salgado</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSalgados.map((prod) => {
                return (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                      prod.available
                        ? 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-amber-300 shadow-2xs'
                        : 'bg-red-50/50 border-red-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                            {prod.name}
                          </h4>
                          {prod.badge && (
                            <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black shrink-0">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-amber-600 block mt-0.5">
                          {formatCurrency(prod.price)}
                        </span>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-tight">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleProductAvailability(prod.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            prod.available ? 'bg-emerald-500' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              prod.available ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-bold text-stone-500">
                          {prod.available ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Editar este produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: prod.id,
                              name: prod.name,
                              isProduct: true,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
                          title="Excluir este produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. BEBIDAS */}
        {(activeSubTab === 'all' || activeSubTab === 'bebidas') && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🥤</span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base font-display">
                    Bebidas Geladas ({filteredBebidas.length})
                  </h3>
                  <span className="text-xs text-stone-500 font-medium">
                    Refrigerantes, sucos, águas e cervejas
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleOpenCreateModal('bebida')}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 font-extrabold text-xs border border-blue-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nova Bebida</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBebidas.map((prod) => {
                return (
                  <div
                    key={prod.id}
                    className={`p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                      prod.available
                        ? 'bg-stone-50/60 border-stone-200/80 hover:bg-white hover:border-blue-300 shadow-2xs'
                        : 'bg-red-50/50 border-red-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                            {prod.name}
                          </h4>
                          {prod.badge && (
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-900 text-[10px] font-black shrink-0">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-amber-600 block mt-0.5">
                          {formatCurrency(prod.price)}
                        </span>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-tight">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleProductAvailability(prod.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            prod.available ? 'bg-emerald-500' : 'bg-stone-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              prod.available ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span className="text-[11px] font-bold text-stone-500">
                          {prod.available ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors"
                          title="Editar este produto"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              id: prod.id,
                              name: prod.name,
                              isProduct: true,
                            })
                          }
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
                          title="Excluir este produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE ITENS */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            onClick={() => setIsFormModalOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 z-10 animate-slide-up max-h-[90vh] flex flex-col">
            {/* Header do Modal */}
            <div className="bg-stone-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  {editingItem ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-display">
                    {editingItem ? 'Modificar Item do Cardápio' : 'Incluir Novo Item no Cardápio'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {editingItem
                      ? 'Atualize as informações do item selecionado'
                      : 'Cadastre um novo sabor, complemento, molho ou produto'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário com Scroll */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Seleção do Tipo de Item (se for novo item) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Tipo de Item:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'flavor' as const, label: '🥩 Sabor' },
                    { id: 'complement' as const, label: '🌽 Complemento' },
                    { id: 'sauce' as const, label: '🥫 Molho' },
                    { id: 'salgado' as const, label: '🥐 Salgado' },
                    { id: 'bebida' as const, label: '🥤 Bebida' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={!!editingItem}
                      onClick={() => {
                        setFormType(t.id);
                        if (t.id === 'salgado' && !formPrice) setFormPrice('8.50');
                        if (t.id === 'bebida' && !formPrice) setFormPrice('6.00');
                      }}
                      className={`p-2.5 rounded-xl text-xs font-extrabold text-center transition-all border ${
                        formType === t.id
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      } ${editingItem ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome do Item */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nome do {formType === 'flavor' ? 'Sabor' : formType === 'complement' ? 'Complemento' : formType === 'sauce' ? 'Molho' : 'Produto'}:
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Frango com Catupiry, Bacon Crocante, Coca-Cola 2L..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Campos Específicos para Sabores */}
              {formType === 'flavor' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Categoria do Recheio:
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {FLAVOR_GROUP_PRESETS.map((group) => (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setFormGroupTag(group)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          formGroupTag === group
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formGroupTag}
                    onChange={(e) => setFormGroupTag(e.target.value)}
                    placeholder="Ou digite outra categoria (ex: Especial da Casa)"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Campos Específicos para Produtos (Salgados & Bebidas) */}
              {(formType === 'salgado' || formType === 'bebida') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Preço */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Preço Unitário (R$):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                          R$
                        </span>
                        <input
                          type="text"
                          required
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="8,50"
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-black text-stone-900 outline-none focus:border-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Unidade / Medida */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Unidade / Porção:
                      </label>
                      <input
                        type="text"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        placeholder="Ex: Unidade 180g, Lata 350ml"
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Badge de Destaque */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Selo / Destaque (Opcional):
                    </label>
                    <input
                      type="text"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      placeholder="Ex: Mais Vendido, Novidade, Super Gelada..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Descrição do Produto:
                    </label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Descreva o produto para o cliente..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs text-stone-800 outline-none focus:border-amber-500 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Seletor de Foto / URL */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Foto do Produto:
                    </label>

                    {/* Presets Rápidos de Fotos */}
                    <div className="grid grid-cols-5 gap-2 mb-2">
                      {PRESET_IMAGES.filter((p) => p.category === formType).map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setFormImage(preset.url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all group ${
                            formImage === preset.url
                              ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                              : 'border-stone-200 hover:border-amber-400'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-12 object-cover"
                          />
                          <span className="block text-[9px] font-bold text-stone-700 bg-white/90 truncate px-1 py-0.5 text-center">
                            {preset.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="url"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="Ou cole o link de uma imagem externa (URL)"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-stone-50 text-[11px] text-stone-800 outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </>
              )}

              {/* Status de Disponibilidade Inicial */}
              <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-stone-900 block">
                    Disponível no Estoque
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Se ativado, o item fica visível e pronto para ser pedido no cardápio.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formAvailable ? 'bg-emerald-500' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Salvar Modificações' : 'Cadastrar Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div
            onClick={() => setItemToDelete(null)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-stone-200 z-10 animate-slide-up p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <Trash2 className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-stone-900 font-display">
                Excluir do Cardápio?
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Você tem certeza que deseja excluir <strong>"{itemToDelete.name}"</strong>? O item será removido de todas as listas e do totem.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md shadow-red-600/20 transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

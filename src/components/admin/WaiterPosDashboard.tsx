'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import {
  CartItem,
  OrderType,
  PaymentMethod,
  PastelSize,
  Ingredient,
  Product,
  Order,
} from '@/types';
import { formatCurrency } from '@/utils/format';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import {
  ChefHat,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Sparkles,
  ShoppingBag,
  UtensilsCrossed,
  RotateCcw,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';

export const WaiterPosDashboard: React.FC = () => {
  const {
    pastelSizes,
    ingredients,
    products,
    orders,
    adminUser,
    createAdminOrder,
    setAdminActiveTab,
    showToast,
  } = useStore();

  // --- Estado do Tipo de Pedido e Mesa ---
  const [orderType, setOrderType] = useState<OrderType>('mesa');
  const [selectedTable, setSelectedTable] = useState<string>('01');
  const [customTable, setCustomTable] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // --- Estado da Comanda / Itens Adicionados ---
  const [posItems, setPosItems] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // --- Estado de Pagamento ---
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('');

  // --- Filtros e Busca do Catálogo ---
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'pastel' | 'salgado' | 'bebida'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Modal de Montagem Rápida de Pastel ---
  const [isPastelModalOpen, setIsPastelModalOpen] = useState<boolean>(false);
  const [modalSize, setModalSize] = useState<PastelSize>(pastelSizes[1] || pastelSizes[0]);
  const [modalFlavors, setModalFlavors] = useState<Ingredient[]>([]);
  const [modalComplements, setModalComplements] = useState<Ingredient[]>([]);
  const [modalSauces, setModalSauces] = useState<Ingredient[]>([]);
  const [modalRecipient, setModalRecipient] = useState<string>('');
  const [modalItemNotes, setModalItemNotes] = useState<string>('');
  const [modalQuantity, setModalQuantity] = useState<number>(1);

  // --- Modal de Sucesso Pós-Lançamento e Impressão Térmica ---
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);

  // --- Mesas Ocupadas Atualmente (com pedidos em preparo ou novos) ---
  const activeTableMap = useMemo(() => {
    const map = new Map<string, Order>();
    orders
      .filter((o) => (o.status === 'novo' || o.status === 'preparando') && o.orderType === 'mesa' && o.tableNumber)
      .forEach((o) => {
        if (o.tableNumber && !map.has(o.tableNumber)) {
          map.set(o.tableNumber, o);
        }
      });
    return map;
  }, [orders]);

  // Lista padrão de mesas 1 a 16 para seleção rápida
  const quickTables = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'];

  // Ingredientes disponíveis por categoria
  const flavors = ingredients.filter((i) => i.category === 'flavor');
  const complements = ingredients.filter((i) => i.category === 'complement');
  const sauces = ingredients.filter((i) => i.category === 'sauce');

  // Agrupamento de sabores por tag (ex: Queijos, Carnes, etc.)
  const flavorGroups = useMemo(() => {
    const groups: { [key: string]: Ingredient[] } = {};
    flavors.forEach((f) => {
      const tag = f.groupTag || 'Tradicionais';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(f);
    });
    return groups;
  }, [flavors]);

  // Cálculos da Comanda
  const subtotal = useMemo(() => {
    return posItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [posItems]);

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const changeForNumber = parseFloat(changeFor.replace(',', '.')) || 0;
  const calculatedChange =
    paymentMethod === 'dinheiro' && changeForNumber > totalAmount ? changeForNumber - totalAmount : 0;

  // Filtro de produtos regulares
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        catalogCategory === 'all' ||
        (catalogCategory === 'salgado' && p.category === 'salgado') ||
        (catalogCategory === 'bebida' && p.category === 'bebida');

      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [products, catalogCategory, searchQuery]);

  // --- Ações de Produtos Regulares na Comanda ---
  const handleAddProduct = (product: Product) => {
    if (!product.available) {
      showToast(`⚠️ "${product.name}" está temporariamente pausado no estoque.`);
      return;
    }

    setPosItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.type === 'regular_product' && i.product?.id === product.id
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + 1;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: current.unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: `pos_prod_${product.id}_${Date.now()}`,
          type: 'regular_product',
          product,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
        };
        return [...prev, newItem];
      }
    });

    showToast(`➕ ${product.name} adicionado à comanda!`);
  };

  const handleUpdateItemQuantity = (itemId: string, delta: number) => {
    setPosItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setPosItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // --- Ações do Modal de Pastel ---
  const handleOpenPastelModal = (size?: PastelSize) => {
    const selectedSize = size || pastelSizes[1] || pastelSizes[0];
    setModalSize(selectedSize);
    setModalFlavors([]);
    setModalComplements([]);
    setModalSauces([]);
    setModalRecipient('');
    setModalItemNotes('');
    setModalQuantity(1);
    setIsPastelModalOpen(true);
  };

  const handleToggleModalFlavor = (flavor: Ingredient) => {
    if (!flavor.available) return;
    const exists = modalFlavors.some((f) => f.id === flavor.id);
    if (exists) {
      setModalFlavors((prev) => prev.filter((f) => f.id !== flavor.id));
    } else {
      if (modalFlavors.length >= modalSize.maxFlavors) {
        showToast(`Limite de ${modalSize.maxFlavors} sabores atingido para o tamanho ${modalSize.name}.`);
        return;
      }
      setModalFlavors((prev) => [...prev, flavor]);
    }
  };

  const handleToggleModalComplement = (comp: Ingredient) => {
    if (!comp.available) return;
    setModalComplements((prev) =>
      prev.some((c) => c.id === comp.id) ? prev.filter((c) => c.id !== comp.id) : [...prev, comp]
    );
  };

  const handleToggleModalSauce = (sauce: Ingredient) => {
    if (!sauce.available) return;
    setModalSauces((prev) =>
      prev.some((s) => s.id === sauce.id) ? prev.filter((s) => s.id !== sauce.id) : [...prev, sauce]
    );
  };

  const handleConfirmAddPastel = () => {
    if (modalFlavors.length === 0) {
      showToast('⚠️ Escolha pelo menos 1 recheio para o pastel!');
      return;
    }

    const newItem: CartItem = {
      id: `pos_pastel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'custom_pastel',
      pastelDetails: {
        size: modalSize,
        flavors: [...modalFlavors],
        complements: [...modalComplements],
        sauces: [...modalSauces],
        notes: modalItemNotes.trim() || undefined,
        recipientLabel: modalRecipient.trim() || undefined,
      },
      quantity: modalQuantity,
      unitPrice: modalSize.price,
      totalPrice: modalSize.price * modalQuantity,
    };

    setPosItems((prev) => [...prev, newItem]);
    setIsPastelModalOpen(false);
    showToast(`🥟 Pastel (${modalSize.name}) adicionado à comanda!`);
  };

  // Predefinições rápidas de observações do item
  const quickItemNotes = [
    '🔥 Massa bem frita e crocante',
    '✂️ Cortar ao meio',
    '🧀 Caprichar no queijo',
    '🚫 Sem orégano',
    '🌱 Bem leve / Pouco óleo',
    '🌶️ Molho de pimenta separado',
  ];

  // Limpar toda a comanda
  const handleClearPos = () => {
    if (posItems.length > 0 && !window.confirm('Deseja limpar todos os itens da comanda atual?')) {
      return;
    }
    setPosItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setDiscountAmount(0);
    setChangeFor('');
  };

  // --- Lançamento do Pedido na Cozinha ---
  const handleLaunchOrder = () => {
    if (posItems.length === 0) {
      showToast('⚠️ Adicione ao menos um item à comanda antes de lançar o pedido.');
      return;
    }

    const effectiveTable =
      orderType === 'mesa' ? (customTable.trim() ? customTable.trim() : selectedTable) : undefined;

    const finalCustomerName = customerName.trim()
      ? customerName.trim()
      : orderType === 'mesa'
      ? `Mesa ${effectiveTable || '01'}`
      : orderType === 'balcao'
      ? 'Cliente no Balcão'
      : 'Cliente Para Viagem';

    const orderNotesComplete = [
      orderNotes.trim(),
      discountAmount > 0 ? `[Desconto Aplicado: ${formatCurrency(discountAmount)}]` : '',
      customerPhone.trim() ? `[Contato: ${customerPhone.trim()}]` : '',
    ]
      .filter(Boolean)
      .join(' • ');

    const newOrder = createAdminOrder({
      customerName: finalCustomerName,
      orderType,
      tableNumber: effectiveTable,
      items: posItems,
      totalAmount,
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' && changeForNumber > 0 ? changeForNumber : undefined,
      notes: orderNotesComplete || undefined,
      attendantName: adminUser?.name || 'Atendente / Caixa',
    });

    setPlacedOrder(newOrder);

    // Limpa estado da tela para o próximo cliente
    setPosItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setOrderNotes('');
    setDiscountAmount(0);
    setChangeFor('');

    showToast(`🚀 Pedido #${newOrder.trackingCode} enviado para a cozinha!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in text-stone-900">
      {/* Barra Superior do Módulo PDV */}
      <div className="bg-stone-950 text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-display text-amber-400 tracking-tight">
                PDV & Pedidos de Mesa
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atendimento Rápido
              </span>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
              <span>Lançado por: <strong className="text-stone-200">{adminUser?.name || 'Caixa / Atendimento'}</strong></span>
              <span>•</span>
              <span className="text-amber-400/90 font-medium">Sincronização instantânea c/ Cozinha</span>
            </p>
          </div>
        </div>

        {/* Atalhos Rápidos da Cozinha e Histórico */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setAdminActiveTab('kanban')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-bold transition-all cursor-pointer hover:text-white"
            title="Ir para a fila da Cozinha"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-400" />
            <span>Fila da Cozinha</span>
            {orders.filter((o) => o.status === 'novo' || o.status === 'preparando').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-black">
                {orders.filter((o) => o.status === 'novo' || o.status === 'preparando').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminActiveTab('history')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-bold transition-all cursor-pointer hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Catálogo (Esquerda) + Comanda / Fechamento (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            COLUNA ESQUERDA: CATÁLOGO & SELEÇÃO DE ITENS (7 colunas no Desktop)
        ========================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Seletor do Tipo de Pedido (Mesa, Balcão, Viagem, Delivery) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-stone-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                Tipo de Atendimento
              </span>
              {orderType === 'mesa' && (
                <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Mesa Selecionada: {customTable.trim() ? `Mesa ${customTable}` : `Mesa ${selectedTable}`}
                </span>
              )}
            </div>

            {/* Botoes de Tipo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { id: 'mesa' as OrderType, label: 'Mesa / Salão', icon: '🪑' },
                { id: 'balcao' as OrderType, label: 'Balcão', icon: '🏪' },
                { id: 'viagem' as OrderType, label: 'Para Viagem', icon: '🛍️' },
                { id: 'delivery' as OrderType, label: 'Delivery', icon: '🛵' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setOrderType(type.id)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    orderType === type.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/60'
                  }`}
                >
                  <span className="text-base">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>

            {/* Seletor Visual de Mesas (se tipo for 'mesa') */}
            {orderType === 'mesa' && (
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Selecione o Número da Mesa:</span>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Livre
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span> Ocupada
                    </span>
                  </div>
                </div>

                {/* Grid das Mesas 01 a 16 */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {quickTables.map((tbl) => {
                    const isOccupied = activeTableMap.has(tbl);
                    const isSelected = selectedTable === tbl && !customTable;

                    return (
                      <button
                        key={tbl}
                        onClick={() => {
                          setSelectedTable(tbl);
                          setCustomTable('');
                        }}
                        className={`relative py-2.5 px-1 rounded-xl font-mono text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-600 scale-105'
                            : isOccupied
                            ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                            : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <span className="text-xs">M-{tbl}</span>
                        {isOccupied && (
                          <span
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                            title="Mesa com pedido em andamento"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Campo de Mesa Personalizada */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-stone-500 whitespace-nowrap">Ou digite outra mesa:</span>
                  <input
                    type="text"
                    placeholder="Ex: 22, Área Externa, VIP"
                    value={customTable}
                    onChange={(e) => setCustomTable(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Identificação do Cliente & Contato */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-100 mt-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Nome do Cliente (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Família Silva, Carlos..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Telefone / WhatsApp (opcional):
                </label>
                <input
                  type="tel"
                  placeholder="Ex: (11) 99999-9999"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Barra de Filtros e Busca do Cardápio */}
          <div className="bg-white rounded-3xl p-4 shadow-xs border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Abas de Categorias */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
                {[
                  { id: 'all', label: '🔥 Todos' },
                  { id: 'pastel', label: '🥟 Pastéis' },
                  { id: 'salgado', label: '🥐 Salgados' },
                  { id: 'bebida', label: '🥤 Bebidas' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCatalogCategory(cat.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      catalogCategory === cat.id
                        ? 'bg-stone-900 text-amber-400 shadow-sm'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Busca Rápida */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Seção 1: Pastéis Artesanais (Tamanhos para Montagem) */}
          {(catalogCategory === 'all' || catalogCategory === 'pastel') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <span>🥟 Pastéis Artesanais (Montagem Rápida)</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                    Personalizável
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pastelSizes.map((size) => (
                  <div
                    key={size.id}
                    className="bg-white rounded-2xl p-4 border border-stone-200/80 hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-display font-black text-stone-900 text-sm flex items-center gap-1.5">
                            {size.name}
                            {size.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                {size.badge}
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{size.description}</p>
                        </div>
                        <span className="font-display font-black text-amber-600 text-base">
                          {formatCurrency(size.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 mb-3">
                        <span className="bg-stone-100 px-2 py-0.5 rounded-md font-semibold">
                          Até {size.maxFlavors} recheios
                        </span>
                        <span>• Massa artesanal</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenPastelModal(size)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs shadow-xs transition-all cursor-pointer group-hover:scale-[1.01]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Montar {size.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção 2: Salgados, Doces e Bebidas */}
          {(catalogCategory === 'all' || catalogCategory === 'salgado' || catalogCategory === 'bebida') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <span>🥐 Salgados, Doces & Bebidas Geladas</span>
                  <span className="text-stone-400 text-[11px] font-medium">
                    ({filteredProducts.length} itens)
                  </span>
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-400 text-xs">
                  Nenhum produto encontrado para o filtro aplicado.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredProducts.map((prod) => {
                    const existingInPos = posItems.find(
                      (i) => i.type === 'regular_product' && i.product?.id === prod.id
                    );

                    return (
                      <div
                        key={prod.id}
                        className={`bg-white rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                          !prod.available
                            ? 'opacity-60 bg-stone-50 border-stone-200'
                            : existingInPos
                            ? 'border-amber-500 ring-1 ring-amber-500/30 shadow-xs'
                            : 'border-stone-200/80 hover:border-stone-300'
                        }`}
                      >
                        <div className="mb-2">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h4 className="font-bold text-stone-900 text-xs line-clamp-1">{prod.name}</h4>
                            <span className="font-display font-black text-stone-900 text-xs whitespace-nowrap">
                              {formatCurrency(prod.price)}
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-400 line-clamp-1">{prod.description}</p>
                        </div>

                        {/* Botões de Ação */}
                        {!prod.available ? (
                          <div className="py-1 text-center text-[10px] font-black text-rose-600 bg-rose-50 rounded-lg">
                            Esgotado
                          </div>
                        ) : existingInPos ? (
                          <div className="flex items-center justify-between bg-amber-50 rounded-xl p-1 border border-amber-200">
                            <button
                              onClick={() => handleUpdateItemQuantity(existingInPos.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-black text-xs text-amber-900 font-mono">
                              {existingInPos.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateItemQuantity(existingInPos.id, 1)}
                              className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-600 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddProduct(prod)}
                            className="w-full py-1.5 px-2 rounded-xl bg-stone-100 hover:bg-amber-500 hover:text-stone-950 text-stone-700 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            COLUNA DIREITA: COMANDA DO PEDIDO / FECHAMENTO (5 colunas no Desktop)
        ========================================================================== */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-stone-200 flex flex-col">
            {/* Topo da Comanda */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-stone-900 text-sm">
                    Comanda de Atendimento
                  </h3>
                  <span className="text-[10px] text-stone-400">
                    {orderType === 'mesa'
                      ? `Mesa ${customTable || selectedTable}`
                      : orderType === 'balcao'
                      ? 'Balcão'
                      : orderType === 'viagem'
                      ? 'Para Viagem'
                      : 'Delivery'}
                    {customerName.trim() ? ` • ${customerName.trim()}` : ''}
                  </span>
                </div>
              </div>

              {posItems.length > 0 && (
                <button
                  onClick={handleClearPos}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  title="Limpar comanda"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {/* Lista de Itens na Comanda */}
            <div className="py-3 max-h-[320px] overflow-y-auto space-y-2.5 no-scrollbar pr-1">
              {posItems.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-400" />
                  <p className="font-bold text-stone-500">Nenhum item na comanda ainda.</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Selecione um pastel ou produto ao lado para adicionar.
                  </p>
                </div>
              ) : (
                posItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-stone-900">
                            {item.type === 'custom_pastel'
                              ? `Pastel ${item.pastelDetails?.size.name}`
                              : item.product?.name}
                          </span>
                          {item.pastelDetails?.recipientLabel && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              🏷️ {item.pastelDetails.recipientLabel}
                            </span>
                          )}
                        </div>

                        {/* Detalhes de recheios do pastel */}
                        {item.type === 'custom_pastel' && item.pastelDetails && (
                          <div className="text-[10px] text-stone-600 mt-1 space-y-0.5">
                            <p className="line-clamp-2">
                              <strong className="text-stone-700">Recheios:</strong>{' '}
                              {item.pastelDetails.flavors.map((f) => f.name).join(', ')}
                            </p>
                            {item.pastelDetails.complements.length > 0 && (
                              <p className="text-stone-500 line-clamp-1">
                                <strong>Comp:</strong>{' '}
                                {item.pastelDetails.complements.map((c) => c.name).join(', ')}
                              </p>
                            )}
                            {item.pastelDetails.sauces.length > 0 && (
                              <p className="text-stone-500 line-clamp-1">
                                <strong>Molhos:</strong>{' '}
                                {item.pastelDetails.sauces.map((s) => s.name).join(', ')}
                              </p>
                            )}
                            {item.pastelDetails.notes && (
                              <p className="text-amber-700 font-semibold italic">
                                Obs: {item.pastelDetails.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Preço Total do Item */}
                      <span className="font-display font-black text-stone-900 text-xs whitespace-nowrap">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>

                    {/* Controles de Quantidade & Exclusão */}
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/50">
                      <span className="text-[10px] text-stone-400">
                        {formatCurrency(item.unitPrice)} un.
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateItemQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-xs px-1">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateItemQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-md bg-stone-200/80 hover:bg-stone-300 text-stone-800 flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-2 text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remover item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Fechamento & Pagamento */}
            <div className="pt-3.5 border-t border-stone-100 space-y-3.5">
              {/* Desconto / Cortesia Rápido */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">Subtotal:</span>
                <span className="font-bold text-stone-800">{formatCurrency(subtotal)}</span>
              </div>

              {/* Seletor de Método de Pagamento */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-1.5">
                  Forma de Pagamento:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'pix' as PaymentMethod, label: 'PIX', icon: '⚡' },
                    { id: 'debito' as PaymentMethod, label: 'Débito', icon: '💳' },
                    { id: 'credito' as PaymentMethod, label: 'Crédito', icon: '💳' },
                    { id: 'dinheiro' as PaymentMethod, label: 'Dinheiro', icon: '💵' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-2 rounded-xl text-center text-xs font-black transition-all cursor-pointer ${
                        paymentMethod === method.id
                          ? 'bg-stone-900 text-amber-400 shadow-sm ring-1 ring-stone-900'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <div className="text-sm">{method.icon}</div>
                      <div className="text-[10px] mt-0.5">{method.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculadora de Troco para Dinheiro */}
              {paymentMethod === 'dinheiro' && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">Troco para quanto?</span>
                    {calculatedChange > 0 && (
                      <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                        Troco: {formatCurrency(calculatedChange)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Ex: ${Math.ceil(totalAmount / 10) * 10 || 50}`}
                      value={changeFor}
                      onChange={(e) => setChangeFor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-mono text-xs font-bold outline-none"
                    />
                  </div>

                  {/* Atalhos de notas rápidas */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setChangeFor(totalAmount.toString())}
                      className="px-2 py-0.5 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-950 text-[10px] font-bold cursor-pointer"
                    >
                      Sem troco (Exato)
                    </button>
                    {[20, 50, 100].map((note) => {
                      if (note >= totalAmount) {
                        return (
                          <button
                            key={note}
                            onClick={() => setChangeFor(note.toString())}
                            className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 text-[10px] font-bold cursor-pointer"
                          >
                            R$ {note}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Observações Gerais da Comanda */}
              <div>
                <input
                  type="text"
                  placeholder="Observação do pedido (ex: mesa perto da janela...)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                />
              </div>

              {/* Total Geral em Destaque */}
              <div className="p-3.5 rounded-2xl bg-stone-950 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block">
                    Total a Cobrar
                  </span>
                  <span className="text-xs text-amber-400 font-medium">
                    {posItems.reduce((sum, i) => sum + i.quantity, 0)} itens
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-2xl text-amber-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Botão de Envio para a Cozinha */}
              <button
                onClick={handleLaunchOrder}
                disabled={posItems.length === 0}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  posItems.length > 0
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 hover:scale-[1.02] active:scale-95'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Lançar Pedido na Cozinha</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE MONTAGEM EXPRESSA DE PASTEL PARA O ATENDENTE
      ========================================================================== */}
      {isPastelModalOpen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-scale-in">
            {/* Header do Modal */}
            <div className="p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xl">
                  🥟
                </div>
                <div>
                  <h3 className="font-display font-black text-amber-400 text-base">
                    Montar Pastel Expresso
                  </h3>
                  <p className="text-xs text-stone-400">
                    Selecione o tamanho, recheios e observações para o cliente.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPastelModalOpen(false)}
                className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* 1. Escolha do Tamanho */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-2">
                  1. Tamanho do Pastel:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pastelSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => {
                        setModalSize(size);
                        if (modalFlavors.length > size.maxFlavors) {
                          setModalFlavors(modalFlavors.slice(0, size.maxFlavors));
                        }
                      }}
                      className={`p-2.5 rounded-2xl text-left transition-all border cursor-pointer ${
                        modalSize.id === size.id
                          ? 'bg-amber-500 text-stone-950 border-amber-600 font-black shadow-sm'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{size.name}</div>
                      <div className="text-[10px] opacity-80">Até {size.maxFlavors} recheios</div>
                      <div className="font-display font-black mt-1 text-xs">{formatCurrency(size.price)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Seleção de Sabores / Recheios */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-stone-600">
                    2. Escolha os Recheios ({modalFlavors.length}/{modalSize.maxFlavors}):
                  </label>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      modalFlavors.length === modalSize.maxFlavors
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {modalFlavors.length === modalSize.maxFlavors
                      ? 'Limite Máximo Atingido'
                      : `Pode escolher mais ${modalSize.maxFlavors - modalFlavors.length}`}
                  </span>
                </div>

                {/* Chips de Sabores por Grupos */}
                <div className="space-y-3">
                  {Object.entries(flavorGroups).map(([group, groupFlavors]) => (
                    <div key={group} className="space-y-1.5">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider">
                        {group}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {groupFlavors.map((flavor) => {
                          const isSelected = modalFlavors.some((f) => f.id === flavor.id);
                          return (
                            <button
                              key={flavor.id}
                              disabled={!flavor.available}
                              onClick={() => handleToggleModalFlavor(flavor)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500 text-stone-950 shadow-xs ring-1 ring-amber-600 scale-105'
                                  : !flavor.available
                                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed opacity-50'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{flavor.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Complementos */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-2">
                  3. Complementos (Opcional):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {complements.map((comp) => {
                    const isSelected = modalComplements.some((c) => c.id === comp.id);
                    return (
                      <button
                        key={comp.id}
                        disabled={!comp.available}
                        onClick={() => handleToggleModalComplement(comp)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {comp.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Molhos */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-stone-600 mb-2">
                  4. Molhos Especiais (Opcional):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {sauces.map((sauce) => {
                    const isSelected = modalSauces.some((s) => s.id === sauce.id);
                    return (
                      <button
                        key={sauce.id}
                        disabled={!sauce.available}
                        onClick={() => handleToggleModalSauce(sauce)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {sauce.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Identificador e Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Para quem é este pastel? (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Para o João, Sem Pimenta..."
                    value={modalRecipient}
                    onChange={(e) => setModalRecipient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Observação Específica:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Massa bem tostada..."
                    value={modalItemNotes}
                    onChange={(e) => setModalItemNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs focus:bg-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Atalhos de Observação Rápida */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {quickItemNotes.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => {
                      const clean = note.replace(/^[^\w\s]+/, '').trim();
                      setModalItemNotes((prev) => (prev ? `${prev}, ${clean}` : clean));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium cursor-pointer"
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              {/* Seletor de Quantidade */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">Qtd:</span>
                <div className="flex items-center bg-white border border-stone-300 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="w-7 h-7 rounded-lg text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-black text-xs px-2.5">{modalQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="w-7 h-7 rounded-lg text-stone-700 hover:bg-stone-100 flex items-center justify-center font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-xs font-bold text-amber-700 ml-2">
                  Total: {formatCurrency(modalSize.price * modalQuantity)}
                </span>
              </div>

              {/* Botão de Adicionar */}
              <button
                onClick={handleConfirmAddPastel}
                className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Adicionar à Comanda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CONFIRMAÇÃO DO PEDIDO LANÇADO COM SUCESSO
      ========================================================================== */}
      {placedOrder && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center animate-scale-in space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
              ✓
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Lançado com Sucesso!
              </span>
              <h3 className="font-display font-black text-stone-900 text-2xl mt-1">
                #{placedOrder.trackingCode}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {placedOrder.orderType === 'mesa'
                  ? `Mesa ${placedOrder.tableNumber}`
                  : placedOrder.orderType === 'balcao'
                  ? 'Balcão'
                  : 'Para Viagem'}{' '}
                • {placedOrder.customerName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1 text-left">
              <div className="flex justify-between text-stone-600">
                <span>Total do Pedido:</span>
                <strong className="text-stone-900 font-display text-sm">
                  {formatCurrency(placedOrder.totalAmount)}
                </strong>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Forma de Pagamento:</span>
                <span className="capitalize font-semibold">{placedOrder.paymentMethod}</span>
              </div>
              {placedOrder.changeAmount !== undefined && placedOrder.changeAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Troco a Devolver:</span>
                  <span>{formatCurrency(placedOrder.changeAmount)}</span>
                </div>
              )}
            </div>

            {/* Ações de Impressão e Próximo Pedido */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comanda Térmica (58mm / 80mm)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlacedOrder(null)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs transition-all cursor-pointer"
                >
                  ⚡ Novo Pedido
                </button>
                <button
                  onClick={() => {
                    setPlacedOrder(null);
                    setAdminActiveTab('kanban');
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Ver no Kanban →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão Térmica se acionado */}
      {isReceiptModalOpen && placedOrder && (
        <ThermalReceiptModal
          order={placedOrder}
          onClose={() => setIsReceiptModalOpen(false)}
        />
      )}
    </div>
  );
};

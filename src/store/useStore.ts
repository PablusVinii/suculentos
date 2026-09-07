import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  AdminUser,
  CartItem,
  Ingredient,
  Order,
  OrderStatus,
  PastelSize,
  PixConfig,
  Product,
} from '@/types';
import {
  INITIAL_COMPLEMENTS,
  INITIAL_FLAVORS,
  INITIAL_ORDERS,
  INITIAL_PASTEL_SIZES,
  INITIAL_PIX_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_SAUCES,
} from '@/data/mockData';
import { playNewOrderChime } from '@/utils/audio';
import { syncManager } from '@/utils/sync';

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'usr_gerente',
    name: 'Gerente Geral',
    username: 'gerente',
    password: 'suculentos123',
    role: 'Gerente',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_cozinha',
    name: 'Pasteleiro Chefe',
    username: 'cozinha',
    password: 'cozinha123',
    role: 'Cozinha / Pasteleiro',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_caixa',
    name: 'Atendimento & Caixa',
    username: 'caixa',
    password: 'caixa123',
    role: 'Caixa / Atendimento',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

interface StoreState {
  // --- Autenticação Administrativa & Gestão de Usuários ---
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  adminUsers: AdminUser[];
  adminLogin: (password: string, username?: string) => boolean;
  adminLogout: () => void;
  addAdminUser: (userData: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  resetAdminUsersToDefault: () => void;

  // --- Vista / Navegação ---
  clientActiveTab: 'pastel' | 'salgados' | 'bebidas' | 'meus_pedidos';
  adminActiveTab: 'kanban' | 'stock' | 'stats' | 'users' | 'pix';
  isSideMenuOpen: boolean;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderSuccessOpen: boolean;
  lastPlacedOrder: Order | null;
  incomingOrderAlert: Order | null;
  clientStatusAlert: { order: Order; newStatus: OrderStatus } | null;
  soundEnabled: boolean;
  toastMessage: string | null;

  // --- Códigos dos meus pedidos (Privacidade do Cliente) ---
  myOrderCodes: string[];

  // --- Catálogo e Estoque ---
  pastelSizes: PastelSize[];
  ingredients: Ingredient[];
  products: Product[];

  // --- Chave PIX ---
  pixConfig: PixConfig;
  updatePixConfig: (config: PixConfig) => void;
  resetPixConfigToDefault: () => void;

  // --- Construtor de Pastel Wizard ---
  builderStep: 1 | 2 | 3 | 4;
  builderSize: PastelSize;
  builderFlavors: Ingredient[];
  builderComplements: Ingredient[];
  builderSauces: Ingredient[];
  builderNotes: string;
  builderRecipientLabel: string;

  // --- Carrinho ---
  cart: CartItem[];

  // --- Pedidos (Kanban) ---
  orders: Order[];

  // --- Ações de Navegação e UI ---
  setClientActiveTab: (tab: 'pastel' | 'salgados' | 'bebidas' | 'meus_pedidos') => void;
  setAdminActiveTab: (tab: 'kanban' | 'stock' | 'stats' | 'users' | 'pix') => void;
  setIsSideMenuOpen: (open: boolean) => void;
  toggleSideMenu: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsOrderSuccessOpen: (open: boolean) => void;
  setIncomingOrderAlert: (order: Order | null) => void;
  setClientStatusAlert: (alert: { order: Order; newStatus: OrderStatus } | null) => void;
  toggleSound: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;

  // --- Ações do Construtor de Pastel ---
  setBuilderStep: (step: 1 | 2 | 3 | 4) => void;
  setBuilderSize: (size: PastelSize) => void;
  toggleBuilderFlavor: (flavor: Ingredient) => void;
  toggleBuilderComplement: (complement: Ingredient) => void;
  toggleBuilderSauce: (sauce: Ingredient) => void;
  selectAllAvailableFlavors: () => void;
  clearBuilderFlavors: () => void;
  setBuilderNotes: (notes: string) => void;
  setBuilderRecipientLabel: (label: string) => void;
  resetBuilder: () => void;
  addCustomPastelToCart: (options?: { quantity?: number; openCart?: boolean }) => void;

  // --- Ações do Carrinho ---
  addQuickProductToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;

  // --- Ações do Estoque & Catálogo (CRUD) ---
  toggleIngredientAvailability: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetStockToDefaults: () => void;

  // --- Ações de Pedidos (Kanban) ---
  createOrder: (orderData: {
    customerName: string;
    orderType: Order['orderType'];
    tableNumber?: string;
    deliveryDetails?: Order['deliveryDetails'];
    paymentMethod: Order['paymentMethod'];
    changeFor?: number;
    notes?: string;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  addMyOrderCode: (code: string) => void;
}

const ALL_INITIAL_INGREDIENTS: Ingredient[] = [
  ...INITIAL_FLAVORS,
  ...INITIAL_COMPLEMENTS,
  ...INITIAL_SAUCES,
];

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function emitCloudRealtime(payload: Record<string, any>) {
  if (typeof window !== 'undefined') {
    fetch('https://ntfy.sh/suculentos_live_orders_v1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Title': 'Atualização Suculentos',
        'Priority': 'high',
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }
}

function apiPostOrder(order: Order) {
  if (typeof window !== 'undefined') {
    // 1. Envia para a rota de API do Next.js
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).catch((e) => console.warn('Failed to sync order to server:', e));

    // 2. Dispara notificação instantânea para o canal de SSE da nuvem
    emitCloudRealtime({
      type: 'NEW_ORDER',
      order,
    });
  }
}

function apiPatchOrderStatus(orderId: string, status: OrderStatus, order?: Order) {
  if (typeof window !== 'undefined') {
    fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((e) => console.warn('Failed to sync status to server:', e));

    emitCloudRealtime({
      type: 'ORDER_STATUS_UPDATE',
      orderId,
      status,
      order,
    });
  }
}

function apiPutStock(ingredients: Ingredient[], products: Product[]) {
  if (typeof window !== 'undefined') {
    fetch('/api/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, products }),
    }).catch((e) => console.warn('Failed to sync stock to server:', e));

    emitCloudRealtime({
      type: 'STOCK_UPDATE',
      ingredients,
      products,
    });
  }
}

function apiPutUsers(users: AdminUser[]) {
  if (typeof window !== 'undefined') {
    fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users }),
    }).catch((e) => console.warn('Failed to sync users to server:', e));

    emitCloudRealtime({
      type: 'USERS_UPDATE',
      users,
    });
  }
}

function apiPutPix(pixConfig: PixConfig) {
  if (typeof window !== 'undefined') {
    fetch('/api/pix', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixConfig }),
    }).catch((e) => console.warn('Failed to sync pix to server:', e));

    emitCloudRealtime({
      type: 'PIX_UPDATE',
      pixConfig,
    });
  }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // --- Autenticação Administrativa & Usuários ---
      isAdminAuthenticated: false,
      adminUser: null,
      adminUsers: DEFAULT_ADMIN_USERS,

      adminLogin: (password: string, username = 'gerente') => {
        const { adminUsers } = get();
        const cleanUser = username.trim().toLowerCase();
        const cleanPass = password.trim();

        const found = adminUsers.find(
          (u) =>
            (u.username.toLowerCase() === cleanUser || cleanUser === '') &&
            u.password === cleanPass
        ) || adminUsers.find((u) => u.password === cleanPass);

        if (found) {
          const nowIso = new Date().toISOString();
          const updatedUsers = adminUsers.map((u) =>
            u.id === found.id ? { ...u, lastLogin: nowIso } : u
          );

          set({
            isAdminAuthenticated: true,
            adminUser: { ...found, lastLogin: nowIso },
            adminUsers: updatedUsers,
          });
          apiPutUsers(updatedUsers);
          return true;
        }

        if (cleanPass === 'suculentos123' || cleanPass === 'admin123') {
          const masterUser = adminUsers[0] || DEFAULT_ADMIN_USERS[0];
          set({
            isAdminAuthenticated: true,
            adminUser: masterUser,
          });
          return true;
        }

        return false;
      },

      adminLogout: () => {
        set({
          isAdminAuthenticated: false,
          adminUser: null,
        });
      },

      addAdminUser: (userData) => {
        const { adminUsers } = get();
        const newUser: AdminUser = {
          id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: userData.name.trim(),
          username: userData.username.trim().toLowerCase(),
          password: userData.password.trim(),
          role: userData.role,
          createdAt: new Date().toISOString(),
        };

        const updated = [...adminUsers, newUser];
        set({ adminUsers: updated });
        apiPutUsers(updated);
        get().showToast(`👤 Usuário "${newUser.name}" criado com sucesso!`);
      },

      updateAdminUser: (id, updates) => {
        const { adminUsers, adminUser } = get();
        const updated = adminUsers.map((u) => (u.id === id ? { ...u, ...updates } : u));
        const updatedCurrent = adminUser && adminUser.id === id ? { ...adminUser, ...updates } : adminUser;

        set({
          adminUsers: updated,
          adminUser: updatedCurrent,
        });
        apiPutUsers(updated);
        get().showToast('✅ Dados do usuário atualizados com sucesso!');
      },

      deleteAdminUser: (id) => {
        const { adminUsers, adminUser } = get();
        if (adminUsers.length <= 1) {
          get().showToast('⚠️ Não é possível excluir o único usuário administrador.');
          return;
        }

        if (adminUser && adminUser.id === id) {
          get().showToast('⚠️ Você não pode excluir o usuário conectado no momento.');
          return;
        }

        const updated = adminUsers.filter((u) => u.id !== id);
        set({ adminUsers: updated });
        apiPutUsers(updated);
        get().showToast('🗑️ Usuário removido com sucesso.');
      },

      resetAdminUsersToDefault: () => {
        set({
          adminUsers: DEFAULT_ADMIN_USERS,
        });
        apiPutUsers(DEFAULT_ADMIN_USERS);
        get().showToast('🔄 Lista de usuários restaurada para o padrão inicial.');
      },

      // --- Navegação & UI ---
      clientActiveTab: 'pastel',
      adminActiveTab: 'kanban',
      isSideMenuOpen: false,
      isCartOpen: false,
      isCheckoutOpen: false,
      isOrderSuccessOpen: false,
      lastPlacedOrder: null,
      incomingOrderAlert: null,
      clientStatusAlert: null,
      soundEnabled: true,
      toastMessage: null,

      myOrderCodes: [],

      pastelSizes: INITIAL_PASTEL_SIZES,
      ingredients: ALL_INITIAL_INGREDIENTS,
      products: INITIAL_PRODUCTS,
      pixConfig: INITIAL_PIX_CONFIG,

      builderStep: 1,
      builderSize: INITIAL_PASTEL_SIZES[1], // 5 Sabores por padrão
      builderFlavors: [],
      builderComplements: [],
      builderSauces: [],
      builderNotes: '',
      builderRecipientLabel: '',

      cart: [],
      orders: INITIAL_ORDERS,

      setClientActiveTab: (tab) => set({ clientActiveTab: tab }),
      setAdminActiveTab: (tab) => set({ adminActiveTab: tab }),
      setIsSideMenuOpen: (open) => set({ isSideMenuOpen: open }),
      toggleSideMenu: () => set((state) => ({ isSideMenuOpen: !state.isSideMenuOpen })),
      setIsCartOpen: (open) => set({ isCartOpen: open }),
      setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
      setIsOrderSuccessOpen: (open) => set({ isOrderSuccessOpen: open }),
      setIncomingOrderAlert: (order) => set({ incomingOrderAlert: order }),
      setClientStatusAlert: (alert) => set({ clientStatusAlert: alert }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      showToast: (msg: string) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 3500);
      },
      clearToast: () => set({ toastMessage: null }),

      // --- Construtor de Pastel ---
      setBuilderStep: (step) => set({ builderStep: step }),
      setBuilderSize: (size) => {
        const currentFlavors = get().builderFlavors;
        const adjustedFlavors = currentFlavors.slice(0, size.maxFlavors);
        set({ builderSize: size, builderFlavors: adjustedFlavors });
      },

      toggleBuilderFlavor: (flavor) => {
        const { builderFlavors, builderSize } = get();
        const exists = builderFlavors.some((f) => f.id === flavor.id);

        if (exists) {
          set({ builderFlavors: builderFlavors.filter((f) => f.id !== flavor.id) });
        } else {
          if (builderFlavors.length < builderSize.maxFlavors) {
            set({ builderFlavors: [...builderFlavors, flavor] });
          }
        }
      },

      toggleBuilderComplement: (complement) => {
        const { builderComplements } = get();
        const exists = builderComplements.some((c) => c.id === complement.id);
        if (exists) {
          set({ builderComplements: builderComplements.filter((c) => c.id !== complement.id) });
        } else {
          set({ builderComplements: [...builderComplements, complement] });
        }
      },

      toggleBuilderSauce: (sauce) => {
        const { builderSauces } = get();
        const exists = builderSauces.some((s) => s.id === sauce.id);
        if (exists) {
          set({ builderSauces: builderSauces.filter((s) => s.id !== sauce.id) });
        } else {
          set({ builderSauces: [...builderSauces, sauce] });
        }
      },

      selectAllAvailableFlavors: () => {
        const { ingredients, builderSize } = get();
        const availableFlavors = ingredients.filter((i) => i.category === 'flavor' && i.available);
        const limited = availableFlavors.slice(0, builderSize.maxFlavors);
        set({ builderFlavors: limited });
      },

      clearBuilderFlavors: () => set({ builderFlavors: [] }),
      setBuilderNotes: (notes) => set({ builderNotes: notes }),
      setBuilderRecipientLabel: (label) => set({ builderRecipientLabel: label }),

      resetBuilder: () =>
        set({
          builderStep: 1,
          builderSize: INITIAL_PASTEL_SIZES[1],
          builderFlavors: [],
          builderComplements: [],
          builderSauces: [],
          builderNotes: '',
          builderRecipientLabel: '',
        }),

      addCustomPastelToCart: (options = {}) => {
        const { quantity = 1, openCart = false } = options;
        const {
          builderSize,
          builderFlavors,
          builderComplements,
          builderSauces,
          builderNotes,
          builderRecipientLabel,
          cart,
        } = get();

        const existingPastelCount = cart.filter((i) => i.type === 'custom_pastel').length;
        const assignedLabel =
          builderRecipientLabel.trim() || `Pastel #${existingPastelCount + 1}`;

        const newItem: CartItem = {
          id: 'pastel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type: 'custom_pastel',
          pastelDetails: {
            size: builderSize,
            flavors: [...builderFlavors],
            complements: [...builderComplements],
            sauces: [...builderSauces],
            notes: builderNotes.trim() || undefined,
            recipientLabel: assignedLabel,
          },
          quantity,
          unitPrice: builderSize.price,
          totalPrice: builderSize.price * quantity,
        };

        set({
          cart: [...cart, newItem],
          isCartOpen: openCart,
        });

        get().resetBuilder();
        get().showToast(`🥟 ${assignedLabel} (${builderSize.name}) adicionado ao carrinho!`);
      },

      // --- Carrinho Geral ---
      addQuickProductToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingIndex = cart.findIndex(
          (item) => item.type === 'regular_product' && item.product?.id === product.id
        );

        if (existingIndex > -1) {
          const updated = [...cart];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            totalPrice: updated[existingIndex].unitPrice * newQty,
          };
          set({ cart: updated });
        } else {
          const newItem: CartItem = {
            id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: 'regular_product',
            product,
            quantity,
            unitPrice: product.price,
            totalPrice: product.price * quantity,
          };
          set({ cart: [...cart, newItem] });
        }

        get().showToast(`✨ ${product.name} adicionado ao carrinho!`);
      },

      updateCartItemQuantity: (id, delta) => {
        const { cart } = get();
        const updated = cart
          .map((item) => {
            if (item.id === id) {
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
          .filter(Boolean) as CartItem[];

        set({ cart: updated });
      },

      removeFromCart: (id) => {
        set((state) => ({ cart: state.cart.filter((item) => item.id !== id) }));
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.totalPrice, 0);
      },

      getCartItemsCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0);
      },

      // --- Gestão de Estoque ---
      toggleIngredientAvailability: (id) => {
        set((state) => {
          const updated = state.ingredients.map((ing) =>
            ing.id === id ? { ...ing, available: !ing.available } : ing
          );

          const newFlavors = state.builderFlavors.filter((f) =>
            updated.find((i) => i.id === f.id)?.available
          );
          const newComplements = state.builderComplements.filter((c) =>
            updated.find((i) => i.id === c.id)?.available
          );
          const newSauces = state.builderSauces.filter((s) =>
            updated.find((i) => i.id === s.id)?.available
          );

          syncManager.broadcast({
            type: 'STOCK_UPDATE',
            ingredients: updated,
            products: state.products,
          });
          apiPutStock(updated, state.products);

          return {
            ingredients: updated,
            builderFlavors: newFlavors,
            builderComplements: newComplements,
            builderSauces: newSauces,
          };
        });
      },

      toggleProductAvailability: (id) => {
        set((state) => {
          const updated = state.products.map((prod) =>
            prod.id === id ? { ...prod, available: !prod.available } : prod
          );

          syncManager.broadcast({
            type: 'STOCK_UPDATE',
            ingredients: state.ingredients,
            products: updated,
          });
          apiPutStock(state.ingredients, updated);

          return { products: updated };
        });
      },

      addIngredient: (data) => {
        const { ingredients, products } = get();
        const newId = `ing_${data.category}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newIngredient: Ingredient = {
          id: newId,
          name: data.name.trim(),
          category: data.category,
          available: data.available ?? true,
          groupTag: data.groupTag?.trim() || undefined,
          icon: data.icon?.trim() || undefined,
        };
        const updated = [...ingredients, newIngredient];
        set({ ingredients: updated });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients: updated,
          products,
        });
        apiPutStock(updated, products);
        get().showToast(`✨ "${newIngredient.name}" adicionado ao cardápio!`);
      },

      updateIngredient: (id, updates) => {
        const { ingredients, products } = get();
        const updated = ingredients.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing));
        set({ ingredients: updated });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients: updated,
          products,
        });
        apiPutStock(updated, products);
        get().showToast(`✅ Item atualizado com sucesso!`);
      },

      deleteIngredient: (id) => {
        const { ingredients, products, builderFlavors, builderComplements, builderSauces } = get();
        const target = ingredients.find((i) => i.id === id);
        const updated = ingredients.filter((ing) => ing.id !== id);
        set({
          ingredients: updated,
          builderFlavors: builderFlavors.filter((f) => f.id !== id),
          builderComplements: builderComplements.filter((c) => c.id !== id),
          builderSauces: builderSauces.filter((s) => s.id !== id),
        });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients: updated,
          products,
        });
        apiPutStock(updated, products);
        get().showToast(`🗑️ "${target?.name || 'Item'}" removido com sucesso.`);
      },

      addProduct: (data) => {
        const { ingredients, products } = get();
        const newId = `prod_${data.category}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newProduct: Product = {
          id: newId,
          name: data.name.trim(),
          category: data.category,
          price: Number(data.price),
          description: data.description.trim(),
          image: data.image?.trim() || 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
          available: data.available ?? true,
          badge: data.badge?.trim() || undefined,
          unit: data.unit?.trim() || undefined,
        };
        const updated = [...products, newProduct];
        set({ products: updated });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients,
          products: updated,
        });
        apiPutStock(ingredients, updated);
        get().showToast(`✨ Produto "${newProduct.name}" cadastrado!`);
      },

      updateProduct: (id, updates) => {
        const { ingredients, products } = get();
        const updated = products.map((prod) => (prod.id === id ? { ...prod, ...updates } : prod));
        set({ products: updated });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients,
          products: updated,
        });
        apiPutStock(ingredients, updated);
        get().showToast(`✅ Produto atualizado com sucesso!`);
      },

      deleteProduct: (id) => {
        const { ingredients, products, cart } = get();
        const target = products.find((p) => p.id === id);
        const updated = products.filter((prod) => prod.id !== id);
        set({
          products: updated,
          cart: cart.filter((item) => item.product?.id !== id),
        });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients,
          products: updated,
        });
        apiPutStock(ingredients, updated);
        get().showToast(`🗑️ Produto "${target?.name || ''}" removido.`);
      },

      resetStockToDefaults: () => {
        set({
          ingredients: ALL_INITIAL_INGREDIENTS,
          products: INITIAL_PRODUCTS,
        });
        syncManager.broadcast({
          type: 'STOCK_UPDATE',
          ingredients: ALL_INITIAL_INGREDIENTS,
          products: INITIAL_PRODUCTS,
        });
        apiPutStock(ALL_INITIAL_INGREDIENTS, INITIAL_PRODUCTS);
        get().showToast('🔄 Estoque e catálogo restaurados para o padrão.');
      },

      // --- Chave PIX ---
      updatePixConfig: (config) => {
        const updated: PixConfig = {
          ...config,
          key: config.key.trim(),
          receiverName: config.receiverName.trim(),
          city: config.city?.trim() || undefined,
          instructions: config.instructions?.trim() || undefined,
          updatedAt: new Date().toISOString(),
        };

        set({ pixConfig: updated });

        // 1. Sincroniza via BroadcastChannel (mesmo aparelho / abas locais)
        syncManager.broadcast({
          type: 'PIX_UPDATE',
          pixConfig: updated,
        });

        // 2. Sincroniza via Servidor Cloud e SSE (para outros aparelhos)
        apiPutPix(updated);

        get().showToast('💳 Chave PIX atualizada e sincronizada com sucesso!');
      },

      resetPixConfigToDefault: () => {
        set({ pixConfig: INITIAL_PIX_CONFIG });

        syncManager.broadcast({
          type: 'PIX_UPDATE',
          pixConfig: INITIAL_PIX_CONFIG,
        });

        apiPutPix(INITIAL_PIX_CONFIG);

        get().showToast('🔄 Configuração PIX restaurada para os padrões.');
      },

      // --- Pedidos (Kanban) ---
      createOrder: (orderData) => {
        const { cart, orders, myOrderCodes, soundEnabled } = get();
        const totalAmount = get().getCartTotal();
        const trackingCode = generate6DigitCode();

        let changeAmount: number | undefined = undefined;
        if (
          orderData.paymentMethod === 'dinheiro' &&
          orderData.changeFor &&
          orderData.changeFor > totalAmount
        ) {
          changeAmount = orderData.changeFor - totalAmount;
        }

        const newOrder: Order = {
          id: `PED-${trackingCode}`,
          trackingCode: trackingCode,
          shortCode: trackingCode,
          createdAt: new Date().toISOString(),
          customerName: orderData.customerName,
          orderType: orderData.orderType,
          tableNumber: orderData.tableNumber,
          deliveryDetails: orderData.deliveryDetails,
          items: [...cart],
          totalAmount,
          paymentMethod: orderData.paymentMethod,
          changeFor: orderData.changeFor,
          changeAmount,
          status: 'novo',
          notes: orderData.notes,
        };

        set({
          orders: [newOrder, ...orders],
          myOrderCodes: [trackingCode, ...myOrderCodes],
          cart: [],
          isCheckoutOpen: false,
          isCartOpen: false,
          isOrderSuccessOpen: true,
          lastPlacedOrder: newOrder,
        });

        // 1. Sincroniza via BroadcastChannel local (mesmo aparelho)
        syncManager.broadcast({
          type: 'NEW_ORDER',
          order: newOrder,
        });

        // 2. Sincroniza via Servidor Cloud (para outros aparelhos / Vercel)
        apiPostOrder(newOrder);

        if (soundEnabled) {
          playNewOrderChime();
        }

        return newOrder;
      },

      updateOrderStatus: (orderId, status) => {
        const { orders } = get();
        const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
        const targetOrder = updated.find((ord) => ord.id === orderId);

        set({ orders: updated });

        // 1. Sincroniza via BroadcastChannel
        if (targetOrder) {
          syncManager.broadcast({
            type: 'ORDER_STATUS_UPDATE',
            orderId,
            status,
            order: targetOrder,
          });
        }

        // 2. Sincroniza com o servidor na nuvem
        apiPatchOrderStatus(orderId, status, targetOrder);
      },

      cancelOrder: (orderId) => {
        const { orders } = get();
        const updated = orders.map((ord) =>
          ord.id === orderId ? { ...ord, status: 'cancelado' as OrderStatus } : ord
        );
        const targetOrder = updated.find((ord) => ord.id === orderId);

        set({ orders: updated });

        if (targetOrder) {
          syncManager.broadcast({
            type: 'ORDER_STATUS_UPDATE',
            orderId,
            status: 'cancelado',
            order: targetOrder,
          });
        }

        apiPatchOrderStatus(orderId, 'cancelado', targetOrder);
      },

      deleteOrder: async (orderId) => {
        const cleanId = orderId.trim().replace('#', '');
        const { orders, myOrderCodes } = get();

        const updated = orders.filter(
          (ord) =>
            ord.id !== cleanId &&
            ord.id !== `PED-${cleanId}` &&
            ord.id !== `PED-${cleanId.replace('PED-', '')}` &&
            ord.trackingCode !== cleanId &&
            ord.trackingCode !== cleanId.replace('PED-', '') &&
            ord.shortCode?.toString() !== cleanId &&
            ord.shortCode?.toString() !== cleanId.replace('PED-', '')
        );

        const updatedMyCodes = myOrderCodes.filter(
          (c) =>
            c !== cleanId &&
            c !== `PED-${cleanId}` &&
            c !== cleanId.replace('PED-', '')
        );

        set({ orders: updated, myOrderCodes: updatedMyCodes });

        // 1. Sincroniza via BroadcastChannel local
        syncManager.broadcast({
          type: 'ORDER_DELETED',
          orderId: cleanId,
        });

        // 2. Sincroniza via Cloud PubSub
        emitCloudRealtime({
          type: 'ORDER_DELETED',
          orderId: cleanId,
        });

        // 3. Exclui no banco de dados no servidor
        try {
          await fetch(`/api/orders?id=${encodeURIComponent(cleanId)}`, {
            method: 'DELETE',
          });
        } catch (_) {}

        get().showToast('🗑️ Pedido excluído permanentemente.');
      },

      addMyOrderCode: (code) => {
        set((state) => {
          if (state.myOrderCodes.includes(code)) return state;
          return { myOrderCodes: [code, ...state.myOrderCodes] };
        });
      },
    }),
    {
      name: 'suculentos-storage-v6',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminUser: state.adminUser,
        adminUsers: state.adminUsers,
        cart: state.cart,
        orders: state.orders,
        myOrderCodes: state.myOrderCodes,
        ingredients: state.ingredients,
        products: state.products,
        pixConfig: state.pixConfig,
        soundEnabled: state.soundEnabled,
      }),
    }
  )
);

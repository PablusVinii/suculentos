import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  AdminUser,
  Ingredient,
  Order,
  OrderStatus,
  Product,
} from '@/types';
import {
  INITIAL_COMPLEMENTS,
  INITIAL_FLAVORS,
  INITIAL_ORDERS,
  INITIAL_PASTEL_SIZES,
  INITIAL_PRODUCTS,
  INITIAL_SAUCES,
} from '@/data/mockData';

const ALL_INITIAL_INGREDIENTS: Ingredient[] = [
  ...INITIAL_FLAVORS,
  ...INITIAL_COMPLEMENTS,
  ...INITIAL_SAUCES,
];

const DEFAULT_ADMIN_USERS: AdminUser[] = [
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

interface ServerDatabase {
  orders: Order[];
  ingredients: Ingredient[];
  products: Product[];
  users: AdminUser[];
  lastUpdated: string;
}

// In-memory global store to survive hot-reloads and concurrent serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __suculentos_db: ServerDatabase | undefined;
}

const DB_FILE_PATH = path.join(
  process.env.TMPDIR || os.tmpdir() || '/tmp',
  'suculentos_db_prod_v2.json'
);

function getInitialDatabase(): ServerDatabase {
  return {
    orders: INITIAL_ORDERS,
    ingredients: ALL_INITIAL_INGREDIENTS,
    products: INITIAL_PRODUCTS,
    users: DEFAULT_ADMIN_USERS,
    lastUpdated: new Date().toISOString(),
  };
}

function loadDatabase(): ServerDatabase {
  if (global.__suculentos_db) {
    return global.__suculentos_db;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as ServerDatabase;
      if (parsed && Array.isArray(parsed.orders)) {
        global.__suculentos_db = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar banco do disco, usando dados iniciais:', err);
  }

  const initial = getInitialDatabase();
  global.__suculentos_db = initial;
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: ServerDatabase): void {
  db.lastUpdated = new Date().toISOString();
  global.__suculentos_db = db;

  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    // In some restricted environments writeFileSync might fail, but globalThis remains intact
    console.warn('Aviso: Falha ao persistir em arquivo (usando memória):', err);
  }
}

export const serverStorage = {
  // --- Pedidos ---
  async getOrders(): Promise<Order[]> {
    const db = loadDatabase();
    return db.orders;
  },

  async getOrderByCode(code: string): Promise<Order | null> {
    const db = loadDatabase();
    const clean = code.trim().replace('#', '').replace('PED-', '');
    return (
      db.orders.find(
        (o) =>
          o.trackingCode === clean ||
          o.shortCode.toString() === clean ||
          o.id === `PED-${clean}`
      ) || null
    );
  },

  async createOrder(order: Order): Promise<Order> {
    const db = loadDatabase();
    // Prepend new order
    const exists = db.orders.some((o) => o.id === order.id);
    if (!exists) {
      db.orders = [order, ...db.orders];
    }
    saveDatabase(db);
    return order;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order | null> {
    const db = loadDatabase();
    let updatedOrder: Order | null = null;

    db.orders = db.orders.map((o) => {
      if (o.id === orderId) {
        updatedOrder = { ...o, status };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      saveDatabase(db);
    }

    return updatedOrder;
  },

  // --- Estoque e Cardápio ---
  async getStock(): Promise<{ ingredients: Ingredient[]; products: Product[] }> {
    const db = loadDatabase();
    return {
      ingredients: db.ingredients,
      products: db.products,
    };
  },

  async updateStock(
    ingredients: Ingredient[],
    products: Product[]
  ): Promise<void> {
    const db = loadDatabase();
    db.ingredients = ingredients;
    db.products = products;
    saveDatabase(db);
  },

  // --- Usuários ---
  async getUsers(): Promise<AdminUser[]> {
    const db = loadDatabase();
    return db.users;
  },

  async updateUsers(users: AdminUser[]): Promise<void> {
    const db = loadDatabase();
    db.users = users;
    saveDatabase(db);
  },

  // --- Sincronização Geral ---
  async getSyncData() {
    const db = loadDatabase();
    return {
      orders: db.orders,
      ingredients: db.ingredients,
      products: db.products,
      users: db.users,
      lastUpdated: db.lastUpdated,
    };
  },
};

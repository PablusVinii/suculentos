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

// Global in-memory cache
declare global {
  // eslint-disable-next-line no-var
  var __suculentos_db: ServerDatabase | undefined;
  // eslint-disable-next-line no-var
  var __suculentos_last_fetch: number | undefined;
}

const MASTER_CLOUD_DB_ID = 'ff808181a067127101a07cb9db2c3a2e';
const MASTER_CLOUD_DB_URL = `https://api.restful-api.dev/objects/${MASTER_CLOUD_DB_ID}`;
const REALTIME_TOPIC_URL = 'https://ntfy.sh/suculentos_live_orders_v1';

const DB_FILE_PATH = path.join(
  process.env.TMPDIR || os.tmpdir() || '/tmp',
  'suculentos_db_prod_v3.json'
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

// Dispara notificação instantânea em tempo real para todos os dispositivos conectados
async function broadcastRealtimeEvent(payload: Record<string, any>) {
  try {
    await fetch(REALTIME_TOPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Title': 'Atualização Suculentos',
        'Priority': 'high',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Falha silenciosa de broadcast
  }
}

// Carrega dados da Nuvem Master (Vercel Serverless Multi-Instance Sync)
async function fetchCloudDatabase(): Promise<ServerDatabase | null> {
  try {
    // Se Upstash Redis / Vercel KV estiver configurado via variáveis de ambiente
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      const kvRes = await fetch(`${kvUrl}/get/suculentos_master_db`, {
        headers: { Authorization: `Bearer ${kvToken}` },
        cache: 'no-store',
      });
      if (kvRes.ok) {
        const kvData = await kvRes.json();
        if (kvData && kvData.result) {
          const parsed = typeof kvData.result === 'string' ? JSON.parse(kvData.result) : kvData.result;
          if (parsed && Array.isArray(parsed.orders)) {
            return parsed as ServerDatabase;
          }
        }
      }
    }

    // Cloud Master Store padrão (zero configuração necessária)
    const res = await fetch(MASTER_CLOUD_DB_URL, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data && Array.isArray(json.data.orders)) {
        return json.data as ServerDatabase;
      }
    }
  } catch (err) {
    console.warn('Aviso: Falha ao buscar banco da nuvem, usando cache local:', err);
  }
  return null;
}

// Salva dados na Nuvem Master
async function persistCloudDatabase(db: ServerDatabase): Promise<void> {
  try {
    // 1. Upstash Redis / Vercel KV se configurado
    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    if (kvUrl && kvToken) {
      fetch(`${kvUrl}/set/suculentos_master_db`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(db),
      }).catch(() => {});
    }

    // 2. Cloud Master Store
    await fetch(MASTER_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'suculentos_pastelaria_database_prod',
        data: db,
      }),
    });
  } catch (err) {
    console.warn('Aviso: Falha ao persistir na nuvem master:', err);
  }
}

async function loadDatabaseAsync(): Promise<ServerDatabase> {
  const now = Date.now();
  const lastFetch = global.__suculentos_last_fetch || 0;

  // Revalida a cada 2 segundos no serverless para sincronizar entre diferentes Lambdas
  if (global.__suculentos_db && now - lastFetch < 2000) {
    return global.__suculentos_db;
  }

  // Tenta carregar da nuvem
  const cloudData = await fetchCloudDatabase();
  if (cloudData && Array.isArray(cloudData.orders)) {
    global.__suculentos_db = cloudData;
    global.__suculentos_last_fetch = now;
    // Salva localmente em /tmp também
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(cloudData, null, 2), 'utf-8');
    } catch (_) {}
    return cloudData;
  }

  // Se a nuvem falhou ou está vazia, tenta o /tmp local
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
  } catch (err) {}

  // Fallback para inicial
  const initial = getInitialDatabase();
  global.__suculentos_db = initial;
  global.__suculentos_last_fetch = now;
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: ServerDatabase): void {
  db.lastUpdated = new Date().toISOString();
  global.__suculentos_db = db;
  global.__suculentos_last_fetch = Date.now();

  // Salva no /tmp local
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (_) {}

  // Persiste na nuvem de forma assíncrona
  persistCloudDatabase(db);
}

export const serverStorage = {
  // --- Pedidos ---
  async getOrders(): Promise<Order[]> {
    const db = await loadDatabaseAsync();
    return db.orders;
  },

  async getOrderByCode(code: string): Promise<Order | null> {
    const db = await loadDatabaseAsync();
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
    const db = await loadDatabaseAsync();
    const exists = db.orders.some((o) => o.id === order.id);
    if (!exists) {
      db.orders = [order, ...db.orders];
    }
    saveDatabase(db);

    // Dispara broadcast em tempo real para a cozinha e painel admin
    broadcastRealtimeEvent({
      type: 'NEW_ORDER',
      order,
    });

    return order;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order | null> {
    const db = await loadDatabaseAsync();
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

      // Dispara broadcast em tempo real para o cliente acompanhar
      broadcastRealtimeEvent({
        type: 'ORDER_STATUS_UPDATE',
        orderId,
        status,
        order: updatedOrder,
      });
    }

    return updatedOrder;
  },

  // --- Estoque e Cardápio ---
  async getStock(): Promise<{ ingredients: Ingredient[]; products: Product[] }> {
    const db = await loadDatabaseAsync();
    return {
      ingredients: db.ingredients,
      products: db.products,
    };
  },

  async updateStock(
    ingredients: Ingredient[],
    products: Product[]
  ): Promise<void> {
    const db = await loadDatabaseAsync();
    db.ingredients = ingredients;
    db.products = products;
    saveDatabase(db);

    broadcastRealtimeEvent({
      type: 'STOCK_UPDATE',
      ingredients,
      products,
    });
  },

  // --- Usuários ---
  async getUsers(): Promise<AdminUser[]> {
    const db = await loadDatabaseAsync();
    return db.users;
  },

  async updateUsers(users: AdminUser[]): Promise<void> {
    const db = await loadDatabaseAsync();
    db.users = users;
    saveDatabase(db);

    broadcastRealtimeEvent({
      type: 'USERS_UPDATE',
      users,
    });
  },

  // --- Sincronização Geral ---
  async getSyncData() {
    const db = await loadDatabaseAsync();
    return {
      orders: db.orders,
      ingredients: db.ingredients,
      products: db.products,
      users: db.users,
      lastUpdated: db.lastUpdated,
    };
  },
};

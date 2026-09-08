import { Ingredient, Order, OrderStatus, PixConfig, Product, StoreScheduleConfig } from '@/types';
import { useStore } from '@/store/useStore';

export type SyncMessage =
  | { type: 'NEW_ORDER'; order: Order }
  | { type: 'ORDER_STATUS_UPDATE'; orderId: string; status: OrderStatus; order?: Order }
  | { type: 'ORDER_DELETED'; orderId: string }
  | { type: 'STOCK_UPDATE'; ingredients: Ingredient[]; products: Product[]; stockUpdatedAt?: number }
  | { type: 'USERS_UPDATE'; users: any[] }
  | { type: 'PIX_UPDATE'; pixConfig: PixConfig }
  | { type: 'SCHEDULE_UPDATE'; storeSchedule: StoreScheduleConfig };

class CrossTabSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((message: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('suculentos_live_sync');
          this.channel.onmessage = (event) => {
            const data = event.data as SyncMessage;
            this.handleInternalSync(data);
            this.notifyListeners(data);
          };
        } catch (err) {
          console.warn('BroadcastChannel not supported or error initializing:', err);
        }
      }

      // Fallback cross-tab via window storage event (atualização imediata entre abas)
      window.addEventListener('storage', (e) => {
        if (e.key === 'suculentos_cross_tab_event' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue) as SyncMessage;
            this.handleInternalSync(data);
            this.notifyListeners(data);
          } catch (_) {}
        }
      });
    }
  }

  private handleInternalSync(msg: SyncMessage) {
    if (!msg || !msg.type) return;
    try {
      if (msg.type === 'PIX_UPDATE' && msg.pixConfig) {
        useStore.setState({ pixConfig: msg.pixConfig });
      } else if (msg.type === 'SCHEDULE_UPDATE' && msg.storeSchedule) {
        useStore.setState({ storeSchedule: msg.storeSchedule });
      } else if (msg.type === 'STOCK_UPDATE' && msg.ingredients && msg.products) {
        useStore.setState({
          ingredients: msg.ingredients,
          products: msg.products,
          stockUpdatedAt: msg.stockUpdatedAt || Date.now(),
        });
      } else if (msg.type === 'USERS_UPDATE' && msg.users) {
        useStore.setState({ adminUsers: msg.users });
      }
    } catch (_) {}
  }

  public subscribe(listener: (message: SyncMessage) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(message: SyncMessage) {
    this.listeners.forEach((l) => {
      try {
        l(message);
      } catch {
        // Ignore listener error
      }
    });
  }

  public broadcast(message: SyncMessage) {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // Ignore broadcast error
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'suculentos_cross_tab_event',
          JSON.stringify({ ...message, _t: Date.now() })
        );
      } catch (_) {}
    }
    this.handleInternalSync(message);
    this.notifyListeners(message);
  }
}

export const syncManager = new CrossTabSyncManager();


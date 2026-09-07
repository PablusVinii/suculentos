import { Ingredient, Order, OrderStatus, Product } from '@/types';

export type SyncMessage =
  | { type: 'NEW_ORDER'; order: Order }
  | { type: 'ORDER_STATUS_UPDATE'; orderId: string; status: OrderStatus; order?: Order }
  | { type: 'STOCK_UPDATE'; ingredients: Ingredient[]; products: Product[] };

class CrossTabSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((message: SyncMessage) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('suculentos_live_sync');
        this.channel.onmessage = (event) => {
          const data = event.data as SyncMessage;
          this.notifyListeners(data);
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported or error initializing:', err);
      }
    }
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
    this.notifyListeners(message);
  }
}

export const syncManager = new CrossTabSyncManager();

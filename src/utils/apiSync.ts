import { useStore } from '@/store/useStore';
import { playNewOrderChime } from './audio';
import { Order, OrderStatus } from '@/types';

const REALTIME_SSE_URL = 'https://ntfy.sh/suculentos_live_orders_v1/sse';
const REALTIME_POST_URL = 'https://ntfy.sh/suculentos_live_orders_v1';

class ServerSyncManager {
  private intervalId: any = null;
  private isFetching = false;
  private knownOrderIds = new Set<string>();
  private lastOrderStatusMap = new Map<string, string>();
  private initialized = false;
  private eventSource: EventSource | null = null;

  // Dispara evento em tempo real via Cloud PubSub
  public async emitRealtimeEvent(payload: Record<string, any>) {
    try {
      if (typeof window !== 'undefined') {
        fetch(REALTIME_POST_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Title': 'Atualização Suculentos',
            'Priority': 'high',
          },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }
    } catch (_) {}
  }

  // Inicia conexão SSE em tempo real (latência < 100ms)
  public startRealtimeSSE() {
    if (typeof window === 'undefined' || this.eventSource) return;

    try {
      const es = new EventSource(REALTIME_SSE_URL);
      this.eventSource = es;

      es.onmessage = (event) => {
        try {
          if (!event.data) return;
          const ssePayload = JSON.parse(event.data);
          // ntfy.sh envia o corpo da mensagem no campo message
          const msg = typeof ssePayload.message === 'string' ? JSON.parse(ssePayload.message) : ssePayload;

          if (!msg || !msg.type) return;

          const state = useStore.getState();

          if (msg.type === 'NEW_ORDER' && msg.order) {
            const newOrder: Order = msg.order;
            this.knownOrderIds.add(newOrder.id);
            this.lastOrderStatusMap.set(newOrder.id, newOrder.status);

            useStore.setState((prev) => {
              const exists = prev.orders.some((o) => o.id === newOrder.id);
              if (exists) return prev;
              return { orders: [newOrder, ...prev.orders] };
            });

            // Se o painel admin estiver ativo, notifica com popup e som
            if (state.isAdminAuthenticated) {
              state.setIncomingOrderAlert(newOrder);
              if (state.soundEnabled) {
                playNewOrderChime();
              }
            }
          } else if (msg.type === 'ORDER_STATUS_UPDATE') {
            const { orderId, status, order } = msg;
            this.lastOrderStatusMap.set(orderId, status);

            useStore.setState((prev) => ({
              orders: prev.orders.map((o) =>
                o.id === orderId ? { ...o, status: status as OrderStatus } : o
              ),
            }));

            // Notifica o cliente dono do pedido
            const myCodes = state.myOrderCodes;
            const trackingCode = order?.trackingCode || order?.shortCode?.toString() || orderId.replace('PED-', '');
            const isMyOrder =
              myCodes.includes(trackingCode) ||
              myCodes.includes(orderId) ||
              myCodes.includes(orderId.replace('PED-', ''));

            if (isMyOrder && order) {
              state.setClientStatusAlert({
                order: { ...order, status: status as OrderStatus },
                newStatus: status as OrderStatus,
              });
              if (state.soundEnabled) {
                playNewOrderChime();
              }
            }
          } else if (msg.type === 'ORDER_DELETED' && msg.orderId) {
            const { orderId } = msg;
            this.knownOrderIds.delete(orderId);
            this.lastOrderStatusMap.delete(orderId);

            useStore.setState((prev) => ({
              orders: prev.orders.filter((o) => o.id !== orderId),
            }));
          } else if (msg.type === 'STOCK_UPDATE' && msg.ingredients && msg.products) {
            useStore.setState({
              ingredients: msg.ingredients,
              products: msg.products,
              stockUpdatedAt: msg.stockUpdatedAt || Date.now(),
            });
          } else if (msg.type === 'USERS_UPDATE' && msg.users) {
            useStore.setState({
              adminUsers: msg.users,
            });
          } else if (msg.type === 'PIX_UPDATE' && msg.pixConfig) {
            useStore.setState({
              pixConfig: msg.pixConfig,
            });
          } else if (msg.type === 'SCHEDULE_UPDATE' && msg.storeSchedule) {
            useStore.setState({
              storeSchedule: msg.storeSchedule,
            });
          }
        } catch (_) {}
      };

      es.onerror = () => {
        // Reconexão automática é tratada nativamente pelo EventSource
      };
    } catch (err) {
      console.warn('EventSource não suportado ou bloqueado:', err);
    }
  }

  public stopRealtimeSSE() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Busca dados completos via API HTTP REST (fallback seguro)
  public async fetchLatestData() {
    if (this.isFetching) return;
    this.isFetching = true;

    try {
      const res = await fetch('/api/sync', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        this.isFetching = false;
        return;
      }

      const data = await res.json();
      if (!data) {
        this.isFetching = false;
        return;
      }

      const {
        orders: rawServerOrders,
        ingredients: serverIngs,
        products: serverProds,
        users: serverUsers,
      } = data;

      const serverOrders: Order[] = Array.isArray(rawServerOrders)
        ? rawServerOrders.map((o: any) => ({
            ...o,
            items: Array.isArray(o.items) ? o.items : [],
          }))
        : [];

      const state = useStore.getState();

      if (serverOrders.length > 0 || Array.isArray(rawServerOrders)) {
        if (!this.initialized) {
          // Primeira carga: registra os IDs conhecidos
          serverOrders.forEach((o) => {
            this.knownOrderIds.add(o.id);
            this.lastOrderStatusMap.set(o.id, o.status);
          });
          this.initialized = true;

          // Fonte da verdade: a lista oficial de pedidos do servidor
          useStore.setState({ orders: serverOrders });
        } else {
          // Checa se há novos pedidos feitos por clientes em outros dispositivos
          const newOrdersFromOtherDevices = serverOrders.filter(
            (so) => !this.knownOrderIds.has(so.id)
          );

          if (newOrdersFromOtherDevices.length > 0) {
            newOrdersFromOtherDevices.forEach((no) => {
              this.knownOrderIds.add(no.id);
              this.lastOrderStatusMap.set(no.id, no.status);
            });

            // Se o painel admin estiver aberto, alerta imediatamente com som e popup!
            if (state.isAdminAuthenticated) {
              const latestNew = newOrdersFromOtherDevices[0];
              state.setIncomingOrderAlert(latestNew);
              if (state.soundEnabled) {
                playNewOrderChime();
              }
            }
          }

          // Checa se algum pedido deste cliente teve seu status alterado pela cozinha
          const myCodes = state.myOrderCodes;
          serverOrders.forEach((so) => {
            const lastStatus = this.lastOrderStatusMap.get(so.id);
            const isMyOrder =
              myCodes.includes(so.trackingCode) ||
              myCodes.includes(so.shortCode.toString()) ||
              myCodes.includes(so.id) ||
              myCodes.includes(so.id.replace('PED-', ''));

            if (isMyOrder && lastStatus && lastStatus !== so.status) {
              this.lastOrderStatusMap.set(so.id, so.status);
              // Notifica o cliente imediatamente com popup sonoro!
              state.setClientStatusAlert({
                order: so,
                newStatus: so.status,
              });
              if (state.soundEnabled) {
                playNewOrderChime();
              }
            } else {
              this.lastOrderStatusMap.set(so.id, so.status);
            }
          });

          // Atualiza o estado Zustand com os pedidos sincronizados do servidor
          this.knownOrderIds = new Set(serverOrders.map((o) => o.id));
          useStore.setState({ orders: serverOrders });
        }
      }

      if (Array.isArray(serverIngs) && Array.isArray(serverProds)) {
        const currentIngs = state.ingredients;
        const currentProds = state.products;
        const serverStockUpdatedAt = typeof data.stockUpdatedAt === 'number' ? data.stockUpdatedAt : 0;
        const localStockUpdatedAt = typeof state.stockUpdatedAt === 'number' ? state.stockUpdatedAt : 0;

        // Se o servidor tem uma versão mais recente do estoque (atualizada por outro admin/dispositivo)
        if (serverStockUpdatedAt > localStockUpdatedAt) {
          useStore.setState({
            ingredients: serverIngs,
            products: serverProds,
            stockUpdatedAt: serverStockUpdatedAt,
          });
        }
        // Se o cliente local tem alterações mais recentes que o servidor ainda não salvou (ex: desativou produtos e recarregou a página)
        else if (localStockUpdatedAt > serverStockUpdatedAt) {
          // Não sobrescreve o local! Sincroniza o estoque local com o servidor para manter consistente
          fetch('/api/stock', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: currentIngs,
              products: currentProds,
              stockUpdatedAt: localStockUpdatedAt,
            }),
          }).catch(() => {});
        }
        // Se ambos têm timestamps iguais (ou 0), mas há diferenças nos dados
        else if (
          JSON.stringify(currentIngs) !== JSON.stringify(serverIngs) ||
          JSON.stringify(currentProds) !== JSON.stringify(serverProds)
        ) {
          // Se o local tem itens pausados ou customizados e o servidor veio com todos ativos (padrão), preserva o local
          const localHasPaused = currentProds.some((p) => !p.available) || currentIngs.some((i) => !i.available);
          const serverHasPaused = serverProds.some((p) => !p.available) || serverIngs.some((i) => !i.available);

          if (localHasPaused && !serverHasPaused) {
            const now = Date.now();
            useStore.setState({ stockUpdatedAt: now });
            fetch('/api/stock', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ingredients: currentIngs,
                products: currentProds,
                stockUpdatedAt: now,
              }),
            }).catch(() => {});
          } else {
            useStore.setState({
              ingredients: serverIngs,
              products: serverProds,
              stockUpdatedAt: serverStockUpdatedAt || Date.now(),
            });
          }
        }
      }

      if (Array.isArray(serverUsers) && serverUsers.length > 0) {
        const currentUsers = state.adminUsers;
        if (JSON.stringify(currentUsers) !== JSON.stringify(serverUsers)) {
          useStore.setState({ adminUsers: serverUsers });
        }
      }

      if (data.pixConfig && typeof data.pixConfig.key === 'string') {
        const currentPix = state.pixConfig;
        const isPixChanged =
          !currentPix ||
          currentPix.key !== data.pixConfig.key ||
          currentPix.keyType !== data.pixConfig.keyType ||
          currentPix.receiverName !== data.pixConfig.receiverName ||
          currentPix.city !== data.pixConfig.city ||
          currentPix.instructions !== data.pixConfig.instructions ||
          (data.pixConfig.updatedAt && data.pixConfig.updatedAt !== currentPix.updatedAt);

        if (isPixChanged) {
          useStore.setState({ pixConfig: data.pixConfig });
        }
      }

      if (data.storeSchedule && Array.isArray(data.storeSchedule.schedule)) {
        const currentSchedule = state.storeSchedule;
        const isScheduleChanged =
          !currentSchedule ||
          currentSchedule.mode !== data.storeSchedule.mode ||
          currentSchedule.closedMessage !== data.storeSchedule.closedMessage ||
          (data.storeSchedule.updatedAt && data.storeSchedule.updatedAt !== currentSchedule.updatedAt) ||
          JSON.stringify(currentSchedule.schedule) !== JSON.stringify(data.storeSchedule.schedule);

        if (isScheduleChanged) {
          useStore.setState({ storeSchedule: data.storeSchedule });
        }
      }
    } catch (err) {
      // Falha silenciosa de rede com nova tentativa no próximo ciclo
    } finally {
      this.isFetching = false;
    }
  }

  public startPolling(intervalMs = 2500) {
    this.startRealtimeSSE();
    if (this.intervalId) return;
    this.fetchLatestData();
    this.intervalId = setInterval(() => {
      this.fetchLatestData();
    }, intervalMs);
  }

  public stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.stopRealtimeSSE();
  }
}

export const serverSync = new ServerSyncManager();


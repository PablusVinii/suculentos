import { useStore } from '@/store/useStore';
import { playNewOrderChime } from './audio';
import { Order } from '@/types';

class ServerSyncManager {
  private intervalId: any = null;
  private isFetching = false;
  private knownOrderIds = new Set<string>();
  private lastOrderStatusMap = new Map<string, string>();
  private initialized = false;

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
        orders: serverOrders,
        ingredients: serverIngs,
        products: serverProds,
        users: serverUsers,
      } = data;

      const state = useStore.getState();

      if (Array.isArray(serverOrders)) {
        const localOrders = state.orders;

        if (!this.initialized) {
          // Primeira carga: registra os IDs conhecidos
          serverOrders.forEach((o) => {
            this.knownOrderIds.add(o.id);
            this.lastOrderStatusMap.set(o.id, o.status);
          });
          this.initialized = true;
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
            } else {
              this.lastOrderStatusMap.set(so.id, so.status);
            }
          });

          // Atualiza o estado Zustand com os pedidos sincronizados
          useStore.setState({ orders: serverOrders });
        }
      }

      if (Array.isArray(serverIngs) && Array.isArray(serverProds)) {
        useStore.setState({
          ingredients: serverIngs,
          products: serverProds,
        });
      }

      if (Array.isArray(serverUsers) && serverUsers.length > 0) {
        useStore.setState({ adminUsers: serverUsers });
      }
    } catch (err) {
      // Falha silenciosa de rede com tentativa na próxima iteração
    } finally {
      this.isFetching = false;
    }
  }

  public startPolling(intervalMs = 2500) {
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
  }
}

export const serverSync = new ServerSyncManager();

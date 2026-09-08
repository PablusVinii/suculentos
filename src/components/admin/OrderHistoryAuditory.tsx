'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Order, OrderStatus, OrderType } from '@/types';
import { formatCurrency, formatTime, getDayKey, getDayLabel } from '@/utils/format';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { DeleteOrderConfirmModal } from './DeleteOrderConfirmModal';
import {
  History,
  Calendar,
  Search,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Utensils,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: any }
> = {
  novo: {
    label: 'Novo / Recebido',
    color: 'text-amber-800',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    icon: Clock,
  },
  preparando: {
    label: 'Em Preparo / Fritando',
    color: 'text-orange-800',
    bg: 'bg-orange-100',
    border: 'border-orange-300',
    icon: RefreshCw,
  },
  pronto: {
    label: 'Pronto / Aguardando Retirada',
    color: 'text-blue-800',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    icon: CheckCircle2,
  },
  entregue: {
    label: 'Entregue / Concluído',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    icon: CheckCircle2,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-800',
    bg: 'bg-red-100',
    border: 'border-red-300',
    icon: XCircle,
  },
};

const ORDER_TYPE_LABELS: Record<OrderType, { label: string; emoji: string }> = {
  balcao: { label: 'Balcão', emoji: '🏪' },
  mesa: { label: 'Mesa', emoji: '🪑' },
  delivery: { label: 'Delivery', emoji: '🛵' },
  viagem: { label: 'Para Viagem', emoji: '🥡' },
};

export const OrderHistoryAuditory: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder } = useStore();

  // Estados de Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedOrderType, setSelectedOrderType] = useState<string>('todos');
  const [selectedPayment, setSelectedPayment] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'ontem' | '7dias' | 'custom'>('todos');
  const [customDate, setCustomDate] = useState('');

  // Estados de UI
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});
  const [selectedPrintOrder, setSelectedPrintOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const toggleDayCollapse = (dayKey: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [dayKey]: !prev[dayKey],
    }));
  };

  // Filtragem dos Pedidos
  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return orders.filter((o) => {
      // Filtro de Busca
      const searchLower = searchTerm.toLowerCase().trim();
      const codeMatch =
        o.id.toLowerCase().includes(searchLower) ||
        (o.shortCode && o.shortCode.toString().includes(searchLower)) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(searchLower));
      const customerMatch = (o.customerName || '').toLowerCase().includes(searchLower);
      const notesMatch = (o.notes || '').toLowerCase().includes(searchLower);
      const itemsMatch = (o.items || []).some((item) => {
        if (item.type === 'regular_product') {
          return (item.product?.name || '').toLowerCase().includes(searchLower);
        }
        if (item.type === 'custom_pastel' && item.pastelDetails) {
          const flavors = item.pastelDetails.flavors.map((f) => f.name).join(' ');
          const comps = item.pastelDetails.complements.map((c) => c.name).join(' ');
          return (flavors + ' ' + comps + ' ' + (item.pastelDetails.recipientLabel || '')).toLowerCase().includes(searchLower);
        }
        return false;
      });

      if (searchTerm && !codeMatch && !customerMatch && !notesMatch && !itemsMatch) {
        return false;
      }

      // Filtro de Status
      if (selectedStatus !== 'todos' && o.status !== selectedStatus) {
        return false;
      }

      // Filtro de Tipo de Pedido
      if (selectedOrderType !== 'todos' && o.orderType !== selectedOrderType) {
        return false;
      }

      // Filtro de Pagamento
      if (selectedPayment !== 'todos') {
        if (selectedPayment === 'cartao' && o.paymentMethod !== 'credito' && o.paymentMethod !== 'debito') {
          return false;
        } else if (selectedPayment !== 'cartao' && o.paymentMethod !== selectedPayment) {
          return false;
        }
      }

      // Filtro de Data
      const orderDateStr = o.createdAt ? o.createdAt.split('T')[0] : '';
      if (dateFilter === 'hoje' && orderDateStr !== todayStr) {
        return false;
      }
      if (dateFilter === 'ontem' && orderDateStr !== yesterdayStr) {
        return false;
      }
      if (dateFilter === '7dias') {
        const orderDate = new Date(o.createdAt);
        if (orderDate < sevenDaysAgo) return false;
      }
      if (dateFilter === 'custom' && customDate && orderDateStr !== customDate) {
        return false;
      }

      return true;
    });
  }, [orders, searchTerm, selectedStatus, selectedOrderType, selectedPayment, dateFilter, customDate]);

  // Agrupamento por Dia
  const groupedOrdersByDay = useMemo(() => {
    const groups: Record<
      string,
      {
        dayKey: string;
        dayLabel: string;
        dateObj: Date;
        orders: Order[];
        totalRevenue: number;
        statusCounts: Record<OrderStatus, number>;
      }
    > = {};

    filteredOrders.forEach((order) => {
      const dayKey = getDayKey(order.createdAt);
      if (!groups[dayKey]) {
        groups[dayKey] = {
          dayKey,
          dayLabel: getDayLabel(order.createdAt),
          dateObj: new Date(order.createdAt),
          orders: [],
          totalRevenue: 0,
          statusCounts: {
            novo: 0,
            preparando: 0,
            pronto: 0,
            entregue: 0,
            cancelado: 0,
          },
        };
      }

      groups[dayKey].orders.push(order);
      if (order.status !== 'cancelado') {
        groups[dayKey].totalRevenue += order.totalAmount || 0;
      }
      if (groups[dayKey].statusCounts[order.status] !== undefined) {
        groups[dayKey].statusCounts[order.status]++;
      }
    });

    // Ordena os pedidos de cada dia do mais recente para o mais antigo
    Object.values(groups).forEach((g) => {
      g.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    // Ordena os dias do mais recente para o mais antigo
    return Object.values(groups).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  }, [filteredOrders]);

  // Métricas Totais do Filtro
  const auditMetrics = useMemo(() => {
    const totalCount = filteredOrders.length;
    const totalRevenue = filteredOrders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const deliveredCount = filteredOrders.filter((o) => o.status === 'entregue').length;
    const cancelledCount = filteredOrders.filter((o) => o.status === 'cancelado').length;
    const inProgressCount = filteredOrders.filter((o) => o.status === 'novo' || o.status === 'preparando' || o.status === 'pronto').length;
    const avgTicket = totalCount > 0 && (totalCount - cancelledCount) > 0 ? totalRevenue / (totalCount - cancelledCount) : 0;

    return {
      totalCount,
      totalRevenue,
      deliveredCount,
      cancelledCount,
      inProgressCount,
      avgTicket,
    };
  }, [filteredOrders]);

  const handlePrintAuditReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Top Header com Título e Ação de Impressão */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xl border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display flex items-center gap-2.5">
                <span>Histórico & Auditoria de Pedidos</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-extrabold bg-stone-900 text-amber-400">
                  {orders.length} comandas
                </span>
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
                Auditoria cronológica separada por dia com status, detalhes de montagem e valores.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrintAuditReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            title="Imprimir relatório para auditoria e fechamento"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas da Auditoria */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Auditado</span>
            <ShoppingBag className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 font-display">
            {auditMetrics.totalCount}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">Pedidos registrados</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Faturamento</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-display">
            {formatCurrency(auditMetrics.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Exclui cancelados</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Entregues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 font-display">
            {auditMetrics.deliveredCount}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            {auditMetrics.totalCount > 0 ? `${Math.round((auditMetrics.deliveredCount / auditMetrics.totalCount) * 100)}% de conclusão` : '0%'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Cancelados</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600 font-display">
            {auditMetrics.cancelledCount}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">
            {auditMetrics.totalCount > 0 ? `${Math.round((auditMetrics.cancelledCount / auditMetrics.totalCount) * 100)}% cancelamentos` : '0%'}
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Ticket Médio</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-display">
            {formatCurrency(auditMetrics.avgTicket)}
          </div>
          <p className="text-[11px] text-stone-500 font-medium">Média por comanda</p>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
        {/* Barra de Busca + Período */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, código (#849201), sabor, bebida..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'todos', label: 'Todos os Dias' },
                { id: 'hoje', label: 'Hoje' },
                { id: 'ontem', label: 'Ontem' },
                { id: '7dias', label: 'Últimos 7 Dias' },
                { id: 'custom', label: 'Data Específica' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateFilter(btn.id)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  dateFilter === btn.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/80 text-stone-700'
                }`}
              >
                {btn.label}
              </button>
            ))}

            {dateFilter === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
              />
            )}
          </div>
        </div>

        {/* Filtros de Status, Tipo de Pedido e Pagamento */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap pt-3 border-t border-stone-100 text-xs font-medium">
          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-bold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-bold text-xs outline-none focus:border-amber-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="novo">🟡 Novo / Recebido</option>
              <option value="preparando">🟠 Em Preparo</option>
              <option value="pronto">🔵 Pronto</option>
              <option value="entregue">🟢 Entregue / Concluído</option>
              <option value="cancelado">🔴 Cancelado</option>
            </select>
          </div>

          {/* Tipo de Pedido */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-bold">Local:</span>
            <select
              value={selectedOrderType}
              onChange={(e) => setSelectedOrderType(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-bold text-xs outline-none focus:border-amber-500"
            >
              <option value="todos">Todos os Locais</option>
              <option value="balcao">🏪 Balcão</option>
              <option value="mesa">🪑 Mesa</option>
              <option value="delivery">🛵 Delivery</option>
              <option value="viagem">🥡 Para Viagem</option>
            </select>
          </div>

          {/* Pagamento */}
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-bold">Pagamento:</span>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 font-bold text-xs outline-none focus:border-amber-500"
            >
              <option value="todos">Todos os Pagamentos</option>
              <option value="pix">⚡ PIX</option>
              <option value="cartao">💳 Cartão Crédito/Débito</option>
              <option value="dinheiro">💵 Dinheiro</option>
            </select>
          </div>

          {(searchTerm || selectedStatus !== 'todos' || selectedOrderType !== 'todos' || selectedPayment !== 'todos' || dateFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('todos');
                setSelectedOrderType('todos');
                setSelectedPayment('todos');
                setDateFilter('todos');
                setCustomDate('');
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 underline ml-auto cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Dias Agrupados */}
      {groupedOrdersByDay.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl mx-auto">
            📋
          </div>
          <h3 className="text-lg font-black text-stone-800 font-display">
            Nenhum pedido encontrado nos filtros selecionados
          </h3>
          <p className="text-stone-500 text-xs sm:text-sm max-w-md mx-auto">
            Tente ajustar os termos de pesquisa ou selecionar outro período de auditoria.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedOrdersByDay.map((dayGroup) => {
            const isCollapsed = collapsedDays[dayGroup.dayKey] || false;

            return (
              <div
                key={dayGroup.dayKey}
                className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden transition-all"
              >
                {/* Cabeçalho do Dia (Separador Diário) */}
                <div
                  onClick={() => toggleDayCollapse(dayGroup.dayKey)}
                  className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-800 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black font-display text-white flex items-center gap-2">
                        <span>{dayGroup.dayLabel}</span>
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-0.5 flex-wrap">
                        <span>{dayGroup.orders.length} {dayGroup.orders.length === 1 ? 'pedido' : 'pedidos'}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">
                          Faturamento: {formatCurrency(dayGroup.totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resumo de Status do Dia & Botão de Recolher */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {dayGroup.statusCounts.entregue > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {dayGroup.statusCounts.entregue} entregues
                      </span>
                    )}

                    {(dayGroup.statusCounts.novo + dayGroup.statusCounts.preparando + dayGroup.statusCounts.pronto) > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dayGroup.statusCounts.novo + dayGroup.statusCounts.preparando + dayGroup.statusCounts.pronto} em andamento
                      </span>
                    )}

                    {dayGroup.statusCounts.cancelado > 0 && (
                      <span className="px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-extrabold flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {dayGroup.statusCounts.cancelado} cancelados
                      </span>
                    )}

                    <div className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white ml-1">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Tabela / Cards de Pedidos do Dia */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-100">
                    {dayGroup.orders.map((order) => {
                      const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.novo;
                      const orderTypeInfo = ORDER_TYPE_LABELS[order.orderType] || ORDER_TYPE_LABELS.balcao;

                      return (
                        <div
                          key={order.id}
                          className={`p-4 sm:p-6 transition-colors ${
                            order.status === 'cancelado'
                              ? 'bg-red-50/20 hover:bg-red-50/40 opacity-75'
                              : 'hover:bg-stone-50/80'
                          }`}
                        >
                          {/* Linha Superior: Código, Horário, Cliente, Status e Total */}
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                            <div className="flex items-center gap-3 flex-wrap">
                              {/* Código e Hora */}
                              <div className="flex items-center gap-2">
                                <span className="text-base sm:text-lg font-black font-display text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                                  #{order.shortCode || order.trackingCode || order.id.replace('PED-', '')}
                                </span>
                                <span className="text-xs font-bold text-stone-500 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                                  {formatTime(order.createdAt)}
                                </span>
                              </div>

                              {/* Cliente e Tipo */}
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm sm:text-base text-stone-900">
                                  {order.customerName}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1">
                                  <span>{orderTypeInfo.emoji}</span>
                                  <span>{orderTypeInfo.label}</span>
                                  {order.tableNumber && <span>#{order.tableNumber}</span>}
                                </span>
                              </div>
                            </div>

                            {/* Status, Valor e Ações */}
                            <div className="flex items-center gap-3 justify-between lg:justify-end flex-wrap">
                              {/* Seletor Rápido de Status para Auditoria */}
                              <div className="flex items-center gap-1.5">
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                                >
                                  <option value="novo">🟡 Novo</option>
                                  <option value="preparando">🟠 Preparando</option>
                                  <option value="pronto">🔵 Pronto</option>
                                  <option value="entregue">🟢 Entregue</option>
                                  <option value="cancelado">🔴 Cancelado</option>
                                </select>
                              </div>

                              {/* Total do Pedido */}
                              <div className="text-right">
                                <div className="text-base sm:text-lg font-black text-stone-900 font-display">
                                  {formatCurrency(order.totalAmount)}
                                </div>
                                <div className="text-[10px] font-bold text-stone-500 uppercase">
                                  {order.paymentMethod === 'pix' && '⚡ PIX'}
                                  {order.paymentMethod === 'credito' && '💳 Crédito'}
                                  {order.paymentMethod === 'debito' && '💳 Débito'}
                                  {order.paymentMethod === 'dinheiro' && (
                                    <span>
                                      💵 Dinheiro {order.changeFor ? `(Troco p/ ${formatCurrency(order.changeFor)})` : ''}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Ações de Impressão e Exclusão */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => setSelectedPrintOrder(order)}
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 transition-colors cursor-pointer"
                                  title="Imprimir Comanda Térmica (80mm)"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setOrderToDelete(order)}
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-700 transition-colors cursor-pointer"
                                  title="Excluir Comanda Permanentemente"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Detalhes de Entrega se for Delivery */}
                          {order.deliveryDetails && (
                            <div className="mt-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-stone-700 flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <div className="font-bold text-stone-900">
                                  Entrega em: {order.deliveryDetails.street}, Nº {order.deliveryDetails.number} - {order.deliveryDetails.neighborhood}
                                  {order.deliveryDetails.complement && ` (${order.deliveryDetails.complement})`}
                                </div>
                                {order.deliveryDetails.houseDetails && (
                                  <div className="text-stone-600">
                                    Residência: {order.deliveryDetails.houseDetails}
                                  </div>
                                )}
                                {order.deliveryDetails.referencePoint && (
                                  <div className="text-stone-600">
                                    Ref: {order.deliveryDetails.referencePoint}
                                  </div>
                                )}
                                <div className="text-stone-600">
                                  Contato: {order.deliveryDetails.contactPerson}
                                  {order.deliveryDetails.contactPhone && ` • Tel: ${order.deliveryDetails.contactPhone}`}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Itens do Pedido */}
                          <div className="mt-3 space-y-2">
                            <div className="text-xs font-extrabold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Utensils className="w-3.5 h-3.5" />
                              <span>Itens do Pedido ({(order.items || []).length}):</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {(order.items || []).map((item, itemIdx) => {
                                if (item.type === 'custom_pastel' && item.pastelDetails) {
                                  const { size, flavors, complements, sauces, notes, recipientLabel } = item.pastelDetails;

                                  return (
                                    <div
                                      key={item.id || itemIdx}
                                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between font-black text-stone-900">
                                        <div className="flex items-center gap-1.5">
                                          <span>🥟</span>
                                          <span>{item.quantity}x {size.name}</span>
                                          {recipientLabel && (
                                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                              {recipientLabel}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-amber-700 font-display">
                                          {formatCurrency(item.totalPrice)}
                                        </span>
                                      </div>

                                      {/* Sabores */}
                                      <div className="text-stone-700 leading-tight">
                                        <span className="font-bold text-stone-900">Sabores ({flavors.length}): </span>
                                        <span>{flavors.map((f) => f.name).join(', ')}</span>
                                      </div>

                                      {/* Complementos */}
                                      {complements && complements.length > 0 && (
                                        <div className="text-stone-600 text-[11px] leading-tight">
                                          <span className="font-bold text-stone-800">Complementos: </span>
                                          <span>{complements.map((c) => c.name).join(', ')}</span>
                                        </div>
                                      )}

                                      {/* Molhos */}
                                      {sauces && sauces.length > 0 && (
                                        <div className="text-stone-600 text-[11px] leading-tight">
                                          <span className="font-bold text-stone-800">Molhos: </span>
                                          <span>{sauces.map((s) => s.name).join(', ')}</span>
                                        </div>
                                      )}

                                      {/* Observações do Pastel */}
                                      {notes && (
                                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-900 text-[11px] font-medium border border-amber-200/60">
                                          Obs: {notes}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Produto Regular (Salgado ou Bebida)
                                return (
                                  <div
                                    key={item.id || itemIdx}
                                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-base">
                                        {item.product?.category === 'bebida' ? '🥤' : '🥐'}
                                      </span>
                                      <div>
                                        <span className="font-bold text-stone-900">
                                          {item.quantity}x {item.product?.name || 'Produto'}
                                        </span>
                                        {item.product?.unit && (
                                          <span className="text-[10px] text-stone-500 block">
                                            {item.product.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-black text-amber-700 font-display">
                                      {formatCurrency(item.totalPrice)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Observações Gerais da Comanda */}
                          {order.notes && (
                            <div className="mt-2.5 p-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-medium">
                              <span className="font-bold text-stone-900">Observação do Cliente: </span>
                              {order.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Impressão Térmica */}
      <ThermalReceiptModal
        order={selectedPrintOrder}
        onClose={() => setSelectedPrintOrder(null)}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteOrderConfirmModal
        order={orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={deleteOrder}
      />
    </div>
  );
};

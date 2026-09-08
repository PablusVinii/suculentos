export type PastelCategoryId = '3_sabores' | '5_sabores' | 'tudinh' | 'lua_cheia';

export interface PastelSize {
  id: PastelCategoryId;
  name: string;
  price: number;
  maxFlavors: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
}

export type IngredientCategory = 'flavor' | 'complement' | 'sauce';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  available: boolean;
  groupTag?: string; // e.g., 'Queijo', 'Carne', 'Frutos do Mar'
  icon?: string;
}

export type ProductCategory = 'salgado' | 'bebida';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  available: boolean;
  badge?: string;
  unit?: string;
}

export interface PastelCustomization {
  size: PastelSize;
  flavors: Ingredient[];
  complements: Ingredient[];
  sauces: Ingredient[];
  notes?: string;
  recipientLabel?: string; // e.g. "Para o Carlos", "Pastel 1"
}

export interface CartItem {
  id: string;
  type: 'custom_pastel' | 'regular_product';
  product?: Product;
  pastelDetails?: PastelCustomization;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'pix' | 'debito' | 'credito' | 'dinheiro';
export type OrderType = 'balcao' | 'mesa' | 'viagem' | 'delivery';
export type OrderStatus = 'novo' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface DeliveryDetails {
  street: string; // Rua / Avenida
  number: string; // Número
  neighborhood: string; // Bairro
  complement?: string; // Complemento (ex: Apto 302, Bloco B, Casa dos Fundos)
  houseDetails?: string; // Detalhes da residência (ex: Portão marrom, muro verde, campainha preta)
  referencePoint?: string; // Ponto de referência (ex: Próximo à padaria Silva)
  contactPerson: string; // Nome da pessoa a ser procurada na entrega
  contactPhone?: string; // WhatsApp / Telefone para contato
}

export interface Order {
  id: string; // e.g. "PED-849201"
  trackingCode: string; // 6 dígitos aleatórios, e.g. "849201"
  shortCode: number | string; // 849201
  createdAt: string;
  customerName: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryDetails?: DeliveryDetails;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  changeAmount?: number;
  status: OrderStatus;
  notes?: string;
}

export type AdminRole = 'Gerente' | 'Cozinha / Pasteleiro' | 'Caixa / Atendimento';

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: AdminRole;
  createdAt: string;
  lastLogin?: string;
}

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';

export interface PixConfig {
  key: string;
  keyType: PixKeyType;
  receiverName: string;
  city?: string;
  instructions?: string;
  updatedAt?: string;
}

export type StoreScheduleMode = 'auto' | 'always_open' | 'always_closed';

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  dayName: string; // Ex: 'Segunda-feira'
  shortName: string; // Ex: 'Seg'
  isOpen: boolean; // Se a loja abre neste dia da semana
  openTime: string; // Ex: '18:00' (formato HH:MM)
  closeTime: string; // Ex: '23:30' ou '01:00' (formato HH:MM)
}

export interface StoreScheduleConfig {
  mode: StoreScheduleMode;
  schedule: DaySchedule[];
  closedMessage: string;
  autoRejectOrdersWhenClosed: boolean;
  updatedAt?: string;
}

export interface StoreStatusResult {
  isOpen: boolean;
  statusText: string;
  subText: string;
  badgeColor: string;
  nextOpenText?: string;
  isOverride: boolean;
  mode: StoreScheduleMode;
}


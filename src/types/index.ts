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
export type OrderType = 'balcao' | 'mesa' | 'viagem';
export type OrderStatus = 'novo' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface Order {
  id: string; // e.g. "PED-849201"
  trackingCode: string; // 6 dígitos aleatórios, e.g. "849201"
  shortCode: number | string; // 849201
  createdAt: string;
  customerName: string;
  orderType: OrderType;
  tableNumber?: string;
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

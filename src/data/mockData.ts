import { PastelSize, Ingredient, Product, Order } from '@/types';

export const INITIAL_PASTEL_SIZES: PastelSize[] = [
  {
    id: '3_sabores',
    name: '3 Sabores',
    price: 10.0,
    maxFlavors: 3,
    description: 'Escolha até 3 opções de recheios principais.',
    badge: 'Econômico',
  },
  {
    id: '5_sabores',
    name: '5 Sabores',
    price: 12.0,
    maxFlavors: 5,
    description: 'O preferido da casa! Combine até 5 recheios caprichados.',
    badge: 'Mais Pedido ⭐',
    isPopular: true,
  },
  {
    id: 'tudinh',
    name: "Tudin'h",
    price: 15.0,
    maxFlavors: 12,
    description: 'Para quem quer fartura total! Todos os sabores liberados.',
    badge: 'Super Recheado',
  },
  {
    id: 'lua_cheia',
    name: 'Lua Cheia',
    price: 20.0,
    maxFlavors: 12,
    description: 'Tamanho especial gigante em formato meia-lua com recheio duplo.',
    badge: 'Tamanho Especial 🌕',
  },
];

export const INITIAL_FLAVORS: Ingredient[] = [
  { id: 'fl_mussarela', name: 'Q. Mussarela', category: 'flavor', available: true, groupTag: 'Queijos' },
  { id: 'fl_catupiry', name: 'Q. Catupiry', category: 'flavor', available: true, groupTag: 'Queijos' },
  { id: 'fl_cheddar', name: 'Q. Cheddar', category: 'flavor', available: true, groupTag: 'Queijos' },
  { id: 'fl_coalho', name: 'Q. Coalho', category: 'flavor', available: true, groupTag: 'Queijos' },
  { id: 'fl_carne_moida', name: 'Carne Moída', category: 'flavor', available: true, groupTag: 'Carnes' },
  { id: 'fl_charque', name: 'Charque', category: 'flavor', available: true, groupTag: 'Carnes' },
  { id: 'fl_carne_sol', name: 'Carne de Sol', category: 'flavor', available: true, groupTag: 'Carnes' },
  { id: 'fl_camarao', name: 'Camarão', category: 'flavor', available: true, groupTag: 'Frutos do Mar' },
  { id: 'fl_calabresa', name: 'Calabresa', category: 'flavor', available: true, groupTag: 'Embutidos' },
  { id: 'fl_bacon', name: 'Bacon Crocante', category: 'flavor', available: true, groupTag: 'Embutidos' },
  { id: 'fl_frango', name: 'Frango Desfiado', category: 'flavor', available: true, groupTag: 'Aves' },
  { id: 'fl_presunto', name: 'Presunto Ralado', category: 'flavor', available: true, groupTag: 'Embutidos' },
];

export const INITIAL_COMPLEMENTS: Ingredient[] = [
  { id: 'cp_milho', name: 'Milho Verde', category: 'complement', available: true },
  { id: 'cp_ervilha', name: 'Ervilha Fresca', category: 'complement', available: true },
  { id: 'cp_batata_palha', name: 'Batata Palha', category: 'complement', available: true },
  { id: 'cp_cebola', name: 'Cebola Roxa/Branca', category: 'complement', available: true },
  { id: 'cp_tomate', name: 'Tomate Picado', category: 'complement', available: true },
  { id: 'cp_oregano', name: 'Orégano Especial', category: 'complement', available: true },
  { id: 'cp_azeitona', name: 'Azeitona Fatiada', category: 'complement', available: true },
  { id: 'cp_ovo_codorna', name: 'Ovo de Codorna', category: 'complement', available: true },
  { id: 'cp_uva_passa', name: 'Uva Passa', category: 'complement', available: true },
];

export const INITIAL_SAUCES: Ingredient[] = [
  { id: 'sc_casa', name: 'Molho da Casa (Especial Verde)', category: 'sauce', available: true },
  { id: 'sc_tradicional', name: 'Molho Tradicional de Ervas', category: 'sauce', available: true },
  { id: 'sc_mostarda', name: 'Mostarda Amarela', category: 'sauce', available: true },
  { id: 'sc_ketchup', name: 'Ketchup Rústico', category: 'sauce', available: true },
  { id: 'sc_pimenta', name: 'Molho de Pimenta da Casa', category: 'sauce', available: true },
  { id: 'sc_barbecue', name: 'Molho Barbecue Defumado', category: 'sauce', available: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_coxinha',
    name: 'Coxinha Suprema c/ Catupiry',
    category: 'salgado',
    price: 8.5,
    description: 'Massa crocante com recheio cremoso de peito de frango desfiado e Catupiry genuíno.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    available: true,
    badge: 'Mais Vendido',
    unit: 'Unidade 180g',
  },
  {
    id: 'prod_empada',
    name: 'Empada de Frango Cremoso',
    category: 'salgado',
    price: 7.5,
    description: 'Massa podre que derrete na boca com frango finamente temperado.',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Unidade 140g',
  },
  {
    id: 'prod_kibe',
    name: 'Kibe Recheado c/ Queijo',
    category: 'salgado',
    price: 8.0,
    description: 'Trigo selecionado, carne bovina de primeira e coração de queijo derretido.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Unidade 160g',
  },
  {
    id: 'prod_enroladinho',
    name: 'Enroladinho Presunto & Queijo',
    category: 'salgado',
    price: 7.0,
    description: 'Massa macia e dourada recheada com queijo mussarela e presunto especial.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Unidade 150g',
  },
  {
    id: 'prod_pastel_doce',
    name: 'Pastel Doce Nutella & Ninho',
    category: 'salgado',
    price: 9.5,
    description: 'Massa crocante açucarada com canela recheada de Nutella pura e leite Ninho.',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=80',
    available: true,
    badge: 'Sobremesa ⭐',
    unit: 'Unidade',
  },
  {
    id: 'prod_coca_lata',
    name: 'Coca-Cola Original 350ml',
    category: 'bebida',
    price: 6.0,
    description: 'Lata trincando de gelada.',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Lata 350ml',
  },
  {
    id: 'prod_guarana_lata',
    name: 'Guaraná Antarctica 350ml',
    category: 'bebida',
    price: 5.5,
    description: 'Sabor original da Amazônia bem gelado.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Lata 350ml',
  },
  {
    id: 'prod_suco_laranja',
    name: 'Suco de Laranja Natural 500ml',
    category: 'bebida',
    price: 8.0,
    description: 'Extraído na hora da fruta selecionada, 100% puro e sem conservantes.',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=80',
    available: true,
    badge: 'Natural',
    unit: 'Garrafinha 500ml',
  },
  {
    id: 'prod_suco_maracuja',
    name: 'Suco de Maracujá da Fruta 500ml',
    category: 'bebida',
    price: 8.5,
    description: 'Refrescante, cremoso e preparado com a polpa fresca do maracujá.',
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Garrafinha 500ml',
  },
  {
    id: 'prod_agua_sem_gas',
    name: 'Água Mineral Crystal 500ml',
    category: 'bebida',
    price: 4.0,
    description: 'Água mineral natural sem gás bem gelada.',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Garrafa 500ml',
  },
  {
    id: 'prod_agua_com_gas',
    name: 'Água Mineral com Gás 500ml',
    category: 'bebida',
    price: 4.5,
    description: 'Água mineral gaseificada refrescante.',
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=500&auto=format&fit=crop&q=80',
    available: true,
    unit: 'Garrafa 500ml',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'PED-481920',
    trackingCode: '481920',
    shortCode: '481920',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    customerName: 'Rodrigo Medeiros',
    orderType: 'balcao',
    items: [
      {
        id: 'item_1',
        type: 'custom_pastel',
        pastelDetails: {
          size: INITIAL_PASTEL_SIZES[1], // 5 Sabores
          flavors: [
            INITIAL_FLAVORS[6], // Carne de Sol
            INITIAL_FLAVORS[3], // Q. Coalho
            INITIAL_FLAVORS[9], // Bacon
            INITIAL_FLAVORS[1], // Q. Catupiry
            INITIAL_FLAVORS[10], // Frango
          ],
          complements: [
            INITIAL_COMPLEMENTS[0], // Milho
            INITIAL_COMPLEMENTS[3], // Cebola
            INITIAL_COMPLEMENTS[5], // Orégano
          ],
          sauces: [
            INITIAL_SAUCES[0], // Molho da Casa
            INITIAL_SAUCES[4], // Pimenta
          ],
          notes: 'Bem frito e crocante!',
        },
        quantity: 1,
        unitPrice: 12.0,
        totalPrice: 12.0,
      },
      {
        id: 'item_2',
        type: 'regular_product',
        product: INITIAL_PRODUCTS[5], // Coca-Cola
        quantity: 1,
        unitPrice: 6.0,
        totalPrice: 6.0,
      },
    ],
    totalAmount: 18.0,
    paymentMethod: 'pix',
    status: 'preparando',
    notes: 'Cliente aguardando no balcão.',
  },
  {
    id: 'PED-925104',
    trackingCode: '925104',
    shortCode: '925104',
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    customerName: 'Mariana Castro',
    orderType: 'mesa',
    tableNumber: '04',
    items: [
      {
        id: 'item_3',
        type: 'custom_pastel',
        pastelDetails: {
          size: INITIAL_PASTEL_SIZES[0], // 3 Sabores
          flavors: [
            INITIAL_FLAVORS[0], // Q. Mussarela
            INITIAL_FLAVORS[4], // Carne Moída
            INITIAL_FLAVORS[8], // Calabresa
          ],
          complements: [
            INITIAL_COMPLEMENTS[2], // Batata Palha
            INITIAL_COMPLEMENTS[4], // Tomate
          ],
          sauces: [
            INITIAL_SAUCES[1], // Tradicional
            INITIAL_SAUCES[3], // Ketchup
          ],
        },
        quantity: 2,
        unitPrice: 10.0,
        totalPrice: 20.0,
      },
      {
        id: 'item_4',
        type: 'regular_product',
        product: INITIAL_PRODUCTS[7], // Suco Laranja
        quantity: 2,
        unitPrice: 8.0,
        totalPrice: 16.0,
      },
    ],
    totalAmount: 36.0,
    paymentMethod: 'dinheiro',
    changeFor: 50.0,
    changeAmount: 14.0,
    status: 'novo',
    notes: 'Entregar na mesa 04.',
  },
  {
    id: 'PED-734812',
    trackingCode: '734812',
    shortCode: '734812',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    customerName: 'Gabriel Fonseca',
    orderType: 'viagem',
    items: [
      {
        id: 'item_5',
        type: 'custom_pastel',
        pastelDetails: {
          size: INITIAL_PASTEL_SIZES[2], // Tudin'h
          flavors: INITIAL_FLAVORS.slice(0, 8),
          complements: INITIAL_COMPLEMENTS.slice(0, 4),
          sauces: [INITIAL_SAUCES[0], INITIAL_SAUCES[5]],
        },
        quantity: 1,
        unitPrice: 15.0,
        totalPrice: 15.0,
      },
    ],
    totalAmount: 15.0,
    paymentMethod: 'credito',
    status: 'pronto',
    notes: 'Embalagem para viagem.',
  },
];

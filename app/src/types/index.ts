// ═══════════════════════════════════════════════════════════════
// HOLLY CLUB - TIPOS Y DEFINICIONES
// ═══════════════════════════════════════════════════════════════

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  table: string;
  items: OrderItem[];
  total: number;
  payAmount: number;
  change: number;
  status: OrderStatus;
  date: string;
  time: string;
  timestamp: number;
  synced: boolean;
}

export interface SalesData {
  date: string;
  total: number;
  orders: number;
  items: number;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: { name: string; quantity: number; total: number }[];
  salesByDate: SalesData[];
  salesByTable: { table: string; total: number; orders: number }[];
}

export type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface FilterOptions {
  range: DateRange;
  startDate?: string;
  endDate?: string;
  table?: string;
}

export interface SyncConfig {
  scriptUrl: string;
  enabled: boolean;
  lastSync: number | null;
  status: 'idle' | 'syncing' | 'error' | 'synced';
}

export interface EncryptedData {
  iv: string;
  data: string;
}

export const PRODUCT_CATEGORIES = [
  { id: 'beers', name: 'Cervezas', icon: '🍺' },
  { id: 'non-alcoholic', name: 'No Alcohólicas', icon: '🥤' },
  { id: 'liquors', name: 'Licores', icon: '🥃' },
  { id: 'additionals', name: 'Adicionales', icon: '✨' },
] as const;

export const PRODUCTS: Product[] = [
  // Cervezas
  { id: 'poker', name: 'Cerveza Poker', price: 5000, category: 'beers', icon: '🍺', image: '/products/poker.jpg' },
  { id: 'aguila-light', name: 'Águila Light', price: 5000, category: 'beers', icon: '🍺', image: '/products/aguila-light.jpg' },
  { id: 'aguila-original', name: 'Águila Original', price: 5000, category: 'beers', icon: '🍺', image: '/products/aguila-original.jpg' },
  { id: 'club-colombia', name: 'Club Colombia', price: 6000, category: 'beers', icon: '🍺', image: '/products/club-colombia.jpg' },
  { id: 'corona', name: 'Cerveza Corona', price: 10000, category: 'beers', icon: '🍺', image: '/products/corona.jpg' },
  { id: 'stella', name: 'Stella Artois', price: 10000, category: 'beers', icon: '🍺', image: '/products/stella.jpg' },
  { id: 'redds', name: "Redd's", price: 4000, category: 'beers', icon: '🍺', image: '/products/redds.jpg' },
  
  // No Alcohólicas
  { id: 'gatorade', name: 'Gatorade', price: 6000, category: 'non-alcoholic', icon: '🥤', image: '/products/gatorade.jpg' },
  { id: 'squash', name: 'Squash', price: 5000, category: 'non-alcoholic', icon: '🥤', image: '/products/squash.jpg' },
  { id: 'soda', name: 'Soda', price: 3000, category: 'non-alcoholic', icon: '🥤', image: '/products/soda.jpg' },
  { id: 'agua', name: 'Agua', price: 3000, category: 'non-alcoholic', icon: '💧', image: '/products/agua.jpg' },
  { id: 'electro-lit', name: 'Electro Lit', price: 10000, category: 'non-alcoholic', icon: '⚡', image: '/products/electro-lit.jpg' },
  { id: 'bom-fest', name: 'Bom Fest', price: 8000, category: 'non-alcoholic', icon: '🥤', image: '/products/bom-fest.jpg' },
  { id: 'red-bull', name: 'Red Bull', price: 12000, category: 'non-alcoholic', icon: '🥤', image: '/products/red-bull.jpg' },
  
  // Licores
  { id: 'buchanans', name: "Buchanan's Whisky", price: 250000, category: 'liquors', icon: '🥃', image: '/products/buchanans.jpg' },
  { id: 'aguardiente-amarillo', name: 'Aguardiente Amarillo', price: 85000, category: 'liquors', icon: '🥃', image: '/products/aguardiente-amarillo.jpg' },
  { id: 'tapa-azul', name: 'Tapa Azul (Bot.)', price: 80000, category: 'liquors', icon: '🥃', image: '/products/tapa-azul.jpg' },
  { id: 'ron-viejo', name: 'Ron Viejo de Caldas', price: 90000, category: 'liquors', icon: '🥃', image: '/products/ron-viejo.jpg' },
  
  // Adicionales
  { id: 'vaso-michelado', name: 'Vaso Michelado', price: 2000, category: 'additionals', icon: '🧊', image: '/products/vaso-michelado.jpg' },
];

export interface Product {
  id: number;
  name: string;
  size: string;
  price: number;
  category: string;
  brand: string;
  desc: string;
  mrp: number;
  off: number;
  image: string | null;
}

export interface CartItems {
  [productId: number]: number;
}

export interface Order {
  id: number;
  date: string;
  time: string;
  items: CartItems;
  total: number;
}

export interface Inventory {
  [productId: number]: number;
}

export type ViewState = 'home' | 'profile';
export type ProfileTabState = 'history' | 'inventory';

export interface NewProductForm {
  name: string;
  mrp: string;
  category: string;
  brand: string;
  size: string;
  desc: string;
  stock: string;
  off: string;
}

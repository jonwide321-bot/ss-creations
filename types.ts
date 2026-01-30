
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  gallery: string[];
  rating: number;
  highlights: string[];
  options?: {
    name: string;
    values: string[];
  }[];
  stock: number;
  detailedDescription: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFreeShipping?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Recommendation {
  suggestion: string;
  reason: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderDetails {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  paymentMethod: string;
  status: OrderStatus;
  date: string;
}

export interface StoreSettings {
  baseShippingFee: number;
}

export interface ShippingRate {
  id: string;
  district_name: string;
  rate: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  expiry_date?: string; // ISO String
  active: boolean;
  // Legacy support for migration
  discount_percent?: number; 
}

export interface Promotion {
  id: string;
  badge_text: string;
  title: string;
  description: string;
  bg_color: string;
  text_color: string;
  cta_text: string;
  link_url: string;
  active: boolean;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  visitor_id: string;
}

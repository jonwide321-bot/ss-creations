import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://ophglrtxjdjqxoixebzc.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGdscnR4amRqcXhvaXhlYnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODc1NDksImV4cCI6MjA4NTI2MzU0OX0.SuqtsjKJUegIuK6I1v3iYi4X6tsCoXm8pAoH2NsbJw4'; 

const getEnv = (key: string): string => {
  try {
    if (typeof window !== 'undefined' && (window as any).env && (window as any).env[key]) return (window as any).env[key];
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) return import.meta.env[key];
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
  } catch (e) {}
  if (key === 'VITE_SUPABASE_URL') return DEFAULT_URL;
  if (key === 'VITE_SUPABASE_ANON_KEY') return DEFAULT_KEY;
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 20);

/**
 * ═══════════════════════════════════════════
   Advanced API Cache Manager (Fixes TTFB)
   ═══════════════════════════════════════════
 */
class APICache {
  private prefix = 'ss_cache_v3_'; // Version bump to clear old buggy caches
  private durations = {
    products: 15 * 60 * 1000,      
    promotions: 15 * 60 * 1000,    
    settings: 60 * 60 * 1000,      
    orders: 30 * 1000,              // 30 seconds for orders (very short)
    wishlist: 10 * 60 * 1000,      
    coupons: 30 * 60 * 1000,       
    shipping: 120 * 60 * 1000      
  };

  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(this.prefix + key);
      if (!cached) return null;
      
      const { data, timestamp, type } = JSON.parse(cached);
      const duration = this.durations[type as keyof typeof this.durations] || 5 * 60 * 1000;
      
      if (Date.now() - timestamp > duration) {
        return null; // Expired
      }
      
      return data as T;
    } catch (error) {
      return null;
    }
  }

  set<T>(key: string, data: T, type: keyof typeof this.durations): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        type
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheData));
    } catch (error) {}
  }

  invalidate(types: (keyof typeof this.durations)[]): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const cached = localStorage.getItem(key);
          if (!cached) return;
          const { type } = JSON.parse(cached);
          if (types.includes(type)) {
            localStorage.removeItem(key);
          }
        } catch (e) {}
      }
    });
  }

  clearAll() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

const apiCache = new APICache();

const mapProductFromDB = (p: any) => ({
  id: p?.id || 'err-' + Math.random(),
  name: p?.name || 'Untitled Treasure',
  description: p?.description || '',
  price: Number(p?.price || 0),
  originalPrice: p?.original_price ? Number(p.original_price) : undefined,
  category: p?.category || 'Uncategorized',
  image: p?.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48',
  gallery: Array.isArray(p?.gallery) ? p.gallery : [p?.image || ''],
  rating: Number(p?.rating || 4.5),
  highlights: Array.isArray(p?.highlights) ? p.highlights : [],
  stock: Number(p?.stock || 0),
  detailedDescription: p?.detailed_description || p?.description || '',
  isBestSeller: Boolean(p?.is_best_seller),
  isNewArrival: Boolean(p?.is_new_arrival),
  isFreeShipping: Boolean(p?.is_free_shipping)
});

const mapProductToDB = (p: any) => ({
  name: p.name,
  description: p.description || '',
  price: parseFloat(p.price?.toString() || '0'),
  original_price: p.originalPrice ? parseFloat(p.originalPrice.toString()) : null,
  category: p.category || 'Uncategorized',
  image: p.image || '',
  stock: parseInt(p.stock?.toString() || '0'),
  is_best_seller: Boolean(p.isBestSeller),
  is_new_arrival: Boolean(p.isNewArrival),
  is_free_shipping: Boolean(p.isFreeShipping),
  gallery: p.gallery || [],
  highlights: p.highlights || [],
  detailed_description: p.detailedDescription || p.description || ''
});

const mapOrderFromDB = (o: any) => {
  const customerData = o.customers;
  const itemsData = o.order_items || [];

  return {
    id: o.id,
    total: Number(o.total || 0),
    subtotal: Number(o.subtotal || 0),
    shippingFee: Number(o.shipping_fee || 0),
    discount: Number(o.discount || 0),
    status: o.status || 'Pending',
    paymentMethod: o.payment_method || 'Unknown',
    date: o.date || o.created_at || new Date().toISOString(),
    shippingAddress: {
      name: customerData?.name || 'Guest User',
      email: customerData?.email || '',
      phone: customerData?.phone || '',
      address: customerData?.address || '',
      city: customerData?.city || ''
    },
    items: itemsData.map((oi: any) => ({
      ...(oi.products ? mapProductFromDB(oi.products) : { id: oi.product_id, name: 'Item', price: Number(oi.price) }),
      quantity: oi.quantity || 1,
      price: Number(oi.price || 0)
    }))
  };
};

export const db = {
  products: {
    async getAll() {
      const cached = apiCache.get<any[]>('all_products');
      
      const fetchPromise = (async () => {
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        apiCache.set('all_products', data, 'products');
        return (data || []).map(mapProductFromDB);
      })();

      if (cached) {
        fetchPromise.catch(console.error);
        return cached.map(mapProductFromDB);
      }

      return await fetchPromise;
    },
    async upsert(product: any) {
      const dbData = mapProductToDB(product);
      const result = product.id && product.id.length > 20 
        ? await supabase.from('products').update(dbData).eq('id', product.id).select()
        : await supabase.from('products').insert(dbData).select();
      if (result.error) throw result.error;
      
      apiCache.invalidate(['products']);
      return mapProductFromDB(result.data?.[0]);
    },
    async delete(id: string) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      apiCache.invalidate(['products']);
    },
    async uploadImage(file: File) {
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      return publicUrl;
    }
  },
  orders: {
    async getAll(forceRefresh = false) {
      if (!forceRefresh) {
        const cached = apiCache.get<any[]>('all_orders');
        if (cached) {
          // Trigger BG refresh for orders too
          this.fetchAndCacheOrders().catch(console.error);
          return cached;
        }
      } else {
        apiCache.invalidate(['orders']);
      }

      return await this.fetchAndCacheOrders();
    },

    async fetchAndCacheOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (*) ,
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Orders Error:", error);
        throw error;
      }

      const mapped = (data || []).map(mapOrderFromDB);
      apiCache.set('all_orders', mapped, 'orders');
      return mapped;
    },

    async create(orderDetails: any, cartItems: any[]) {
      try {
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', orderDetails.shippingAddress.email.toLowerCase())
          .maybeSingle();

        let customerId;
        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: cErr } = await supabase.from('customers').insert({
            email: orderDetails.shippingAddress.email.toLowerCase(),
            name: orderDetails.shippingAddress.name,
            phone: orderDetails.shippingAddress.phone,
            address: orderDetails.shippingAddress.address,
            city: orderDetails.shippingAddress.city
          }).select().single();
          if (cErr) throw cErr;
          customerId = newCustomer.id;
        }

        const { error: oErr } = await supabase.from('orders').insert({
          id: orderDetails.id,
          customer_id: customerId,
          total: orderDetails.total,
          subtotal: orderDetails.subtotal,
          shipping_fee: orderDetails.shippingFee,
          discount: orderDetails.discount,
          status: 'Pending',
          payment_method: orderDetails.paymentMethod,
          date: new Date().toISOString()
        });
        if (oErr) throw oErr;

        const items = cartItems.map(item => ({ 
          order_id: orderDetails.id, 
          product_id: item.id, 
          quantity: item.quantity, 
          price: item.price 
        }));
        const { error: iErr } = await supabase.from('order_items').insert(items);
        if (iErr) throw iErr;
        
        apiCache.invalidate(['orders']);
        return true;
      } catch (err: any) {
        console.error("Order Submission Error:", err);
        throw err;
      }
    },
    async updateStatus(id: string, status: string) {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
      apiCache.invalidate(['orders']);
    }
  },
  settings: {
    async get() {
      const cached = apiCache.get<any>('store_settings');
      if (cached) return cached;

      const { data, error } = await supabase.from('settings').select('value').eq('key', 'store_settings').maybeSingle();
      const val = (error || !data) ? { baseShippingFee: 500.00 } : data.value;
      apiCache.set('store_settings', val, 'settings');
      return val;
    },
    async update(value: any) {
      const { error } = await supabase.from('settings').upsert({ key: 'store_settings', value });
      if (error) throw error;
      apiCache.invalidate(['settings']);
    }
  },
  coupons: {
    async getAll() {
      const cached = apiCache.get<any[]>('all_coupons');
      if (cached) return cached;

      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      const val = data || [];
      apiCache.set('all_coupons', val, 'coupons');
      return val;
    },
    async create(coupon: any) {
      const { data, error } = await supabase.from('coupons').insert({
        code: coupon.code.trim().toUpperCase(),
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
        min_order_amount: Number(coupon.min_order_amount || 0),
        active: true
      }).select();
      if (error) throw error;
      apiCache.invalidate(['coupons']);
      return data?.[0];
    },
    async delete(id: string) {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw error;
      apiCache.invalidate(['coupons']);
    },
    async toggleActive(id: string, active: boolean) {
      const { error } = await supabase.from('coupons').update({ active }).eq('id', id);
      if (error) throw error;
      apiCache.invalidate(['coupons']);
    },
    async validate(code: string, subtotal: number) {
      const { data: coupon, error } = await supabase.from('coupons').select('*').eq('code', code.trim().toUpperCase()).eq('active', true).maybeSingle();
      if (error || !coupon) return { success: false, message: 'Invalid or inactive code.' };
      if (subtotal < Number(coupon.min_order_amount)) return { success: false, message: `Min order Rs. ${Number(coupon.min_order_amount).toLocaleString()} required.` };
      let discount = coupon.discount_type === 'percentage' ? (subtotal * Number(coupon.discount_value)) / 100 : Number(coupon.discount_value);
      return { success: true, coupon, discountAmount: Math.min(discount, subtotal) };
    }
  },
  shippingRates: {
    async getAll() {
      const cached = apiCache.get<any[]>('shipping_rates');
      if (cached) return cached;

      const { data, error } = await supabase.from('shipping_rates').select('*');
      const val = data || [];
      apiCache.set('shipping_rates', val, 'shipping');
      return val;
    }
  },
  promotions: {
    async getAll() {
      const cached = apiCache.get<any[]>('all_promotions');
      if (cached) return cached;

      const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
      const val = data || [];
      apiCache.set('all_promotions', val, 'promotions');
      return val;
    }
  },
  wishlist: {
    async get(visitor_id: string) {
      const cached = apiCache.get<string[]>(`wishlist_${visitor_id}`);
      if (cached) return cached;

      const { data, error } = await supabase.from('wishlists').select('product_id').eq('visitor_id', visitor_id);
      const val = (data || []).map(d => d.product_id);
      apiCache.set(`wishlist_${visitor_id}`, val, 'wishlist');
      return val;
    },
    async add(visitor_id: string, product_id: string) {
      await supabase.from('wishlists').insert({ visitor_id, product_id });
      apiCache.invalidate(['wishlist']);
    },
    async remove(visitor_id: string, product_id: string) {
      await supabase.from('wishlists').delete().eq('visitor_id', visitor_id).eq('product_id', product_id);
      apiCache.invalidate(['wishlist']);
    }
  }
};
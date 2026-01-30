
import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://ophglrtxjdjqxoixebzc.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9waGdscnR4amRqcXhvaXhlYnpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2ODc1NDksImV4cCI6MjA4NTI2MzU0OX0.SuqtsjKJUegIuK6I1v3iYi4X6tsCoXm8pAoH2NsbJw4'; 

const getEnv = (key: string): string => {
  try {
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

export const isStripeKeyError = () => {
  if (!supabaseAnonKey) return false;
  return supabaseAnonKey.startsWith('sb_') || supabaseAnonKey.startsWith('pk_');
};

export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey && supabaseAnonKey.length > 20);

const mapProductFromDB = (p: any) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: Number(p.price),
  originalPrice: p.original_price ? Number(p.original_price) : undefined,
  category: p.category,
  image: p.image,
  gallery: Array.isArray(p.gallery) ? p.gallery : [p.image],
  rating: Number(p.rating || 4.5),
  highlights: Array.isArray(p.highlights) ? p.highlights : [],
  stock: Number(p.stock || 0),
  detailedDescription: p.detailed_description || p.description,
  isBestSeller: !!p.is_best_seller,
  isNewArrival: !!p.is_new_arrival,
  isFreeShipping: !!p.is_free_shipping
});

const mapProductToDB = (p: any) => ({
  name: p.name,
  description: p.description,
  price: p.price,
  original_price: p.originalPrice || null,
  category: p.category,
  image: p.image,
  gallery: p.gallery || [p.image],
  rating: p.rating || 4.5,
  highlights: p.highlights || [],
  stock: p.stock || 0,
  detailed_description: p.detailedDescription || p.description,
  is_best_seller: !!p.isBestSeller,
  is_new_arrival: !!p.isNewArrival,
  is_free_shipping: !!p.isFreeShipping
});

export const db = {
  products: {
    async getAll() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }
      return (data || []).map(mapProductFromDB);
    },
    async upsert(product: any) {
      const dbData = mapProductToDB(product);
      
      let result;
      if (product.id && product.id.length > 10) {
        result = await supabase.from('products').update(dbData).eq('id', product.id).select();
      } else {
        result = await supabase.from('products').insert(dbData).select();
      }

      if (result.error) throw result.error;
      return mapProductFromDB(result.data[0]);
    },
    async delete(id: string) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    async uploadImage(file: File) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage error:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    }
  },
  orders: {
    async getAll() {
      const { data, error } = await supabase.from('orders').select(`*, customers (*), order_items (*, products (*))`).order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map(o => ({
        id: o.id,
        total: Number(o.total || 0),
        subtotal: Number(o.subtotal || 0),
        shippingFee: Number(o.shipping_fee || 0),
        discount: Number(o.discount || 0),
        status: o.status || 'Pending',
        paymentMethod: o.payment_method || 'Unknown',
        date: o.date || new Date().toLocaleDateString(),
        shippingAddress: {
          name: o.customers?.name || 'Guest',
          email: o.customers?.email || '',
          phone: o.customers?.phone || '',
          address: o.customers?.address || '',
          city: o.customers?.city || ''
        },
        items: (o.order_items || []).map((oi: any) => ({
          ...(oi.products ? mapProductFromDB(oi.products) : {}),
          quantity: oi.quantity || 1,
          price: Number(oi.price || 0)
        }))
      }));
    },
    async create(orderDetails: any, cartItems: any[]) {
      const { data: customer, error: cErr } = await supabase.from('customers').upsert({
        email: orderDetails.shippingAddress.email,
        name: orderDetails.shippingAddress.name,
        phone: orderDetails.shippingAddress.phone,
        address: orderDetails.shippingAddress.address,
        city: orderDetails.shippingAddress.city
      }, { onConflict: 'email' }).select().single();
      
      if (cErr) throw cErr;

      const { error: oErr } = await supabase.from('orders').insert({
        id: orderDetails.id,
        customer_id: customer.id,
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
    },
    async updateStatus(id: string, status: string) {
      await supabase.from('orders').update({ status }).eq('id', id);
    }
  },
  coupons: {
    async getAll() {
      const { data, error } = await supabase.from('coupons').select('*');
      return data || [];
    },
    async create(coupon: any) {
      const { data, error } = await supabase.from('coupons').insert(coupon).select();
      if (error) throw error;
      return data[0];
    },
    async delete(id: string) {
      await supabase.from('coupons').delete().eq('id', id);
    },
    async toggleActive(id: string, active: boolean) {
      await supabase.from('coupons').update({ active }).eq('id', id);
    }
  },
  wishlist: {
    async get(visitor_id: string) {
      const { data, error } = await supabase.from('wishlists').select('product_id').eq('visitor_id', visitor_id);
      return (data || []).map(d => d.product_id);
    },
    async add(visitor_id: string, product_id: string) {
      await supabase.from('wishlists').insert({ visitor_id, product_id });
    },
    async remove(visitor_id: string, product_id: string) {
      await supabase.from('wishlists').delete().eq('visitor_id', visitor_id).eq('product_id', product_id);
    }
  },
  settings: {
    async get() {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'store_settings').single();
      return data?.value || { baseShippingFee: 500.00 };
    },
    async update(value: any) {
      await supabase.from('settings').upsert({ key: 'store_settings', value });
    }
  },
  shippingRates: {
    async getAll() {
      const { data, error } = await supabase.from('shipping_rates').select('*').order('district_name');
      if (error) {
        console.warn("Shipping rates table might be missing. Using defaults.");
        return [];
      }
      return data || [];
    },
    async upsert(rate: any) {
      const { data, error } = await supabase.from('shipping_rates').upsert(rate).select();
      if (error) throw error;
      return data[0];
    },
    async updateRate(id: string, rate: number) {
      const { error } = await supabase.from('shipping_rates').update({ rate }).eq('id', id);
      if (error) throw error;
    }
  }
};

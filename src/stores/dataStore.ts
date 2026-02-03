import { create } from 'zustand';
import { getSupabase } from '@/lib/supabase/client';
import {
  Identity,
  Website,
  Platform,
  Card,
  Advertiser,
  PlatformAccount,
  Order,
} from '@/types';

interface DataState {
  identities: Identity[];
  websites: Website[];
  platforms: Platform[];
  cards: Card[];
  advertisers: Advertiser[];
  accounts: PlatformAccount[];
  orders: Order[];
  isLoading: boolean;
  isInitialized: boolean;

  // Initialize - fetch all data from Supabase
  initialize: () => Promise<void>;

  // Identity actions
  addIdentity: (data: Omit<Identity, 'id' | 'created_at' | 'updated_at'>) => Promise<Identity>;
  updateIdentity: (id: string, data: Partial<Identity>) => Promise<Identity | null>;
  deleteIdentity: (id: string) => Promise<boolean>;
  getIdentity: (id: string) => Identity | undefined;

  // Website actions
  addWebsite: (data: Omit<Website, 'id' | 'created_at' | 'updated_at'>) => Promise<Website>;
  updateWebsite: (id: string, data: Partial<Website>) => Promise<Website | null>;
  deleteWebsite: (id: string) => Promise<boolean>;
  getWebsite: (id: string) => Website | undefined;

  // Card actions
  addCard: (data: Omit<Card, 'id' | 'created_at' | 'updated_at'>) => Promise<Card>;
  updateCard: (id: string, data: Partial<Card>) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
  getCard: (id: string) => Card | undefined;
  getCardsByIdentity: (identityId: string) => Card[];

  // Advertiser actions
  addAdvertiser: (data: Omit<Advertiser, 'id' | 'created_at' | 'updated_at'>) => Promise<Advertiser>;
  updateAdvertiser: (id: string, data: Partial<Advertiser>) => Promise<Advertiser | null>;
  deleteAdvertiser: (id: string) => Promise<boolean>;
  getAdvertiser: (id: string) => Advertiser | undefined;
  getAdvertisersByPlatform: (platformId: string) => Advertiser[];

  // Account actions
  addAccount: (data: Omit<PlatformAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<PlatformAccount>;
  updateAccount: (id: string, data: Partial<PlatformAccount>) => Promise<PlatformAccount | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  getAccount: (id: string) => PlatformAccount | undefined;
  getAccountsByPlatform: (platformId: string) => PlatformAccount[];

  // Order actions
  addOrder: (data: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  getOrder: (id: string) => Order | undefined;
  getOrdersByPlatform: (platformId: string) => Order[];

  // Platform actions
  getPlatform: (id: string) => Platform | undefined;
  getPlatformBySlug: (slug: string) => Platform | undefined;

  // Refresh data from Supabase
  refreshData: () => Promise<void>;
}

export const useDataStore = create<DataState>()((set, get) => ({
  identities: [],
  websites: [],
  platforms: [],
  cards: [],
  advertisers: [],
  accounts: [],
  orders: [],
  isLoading: false,
  isInitialized: false,

  // Initialize - fetch all data from Supabase
  initialize: async () => {
    if (get().isInitialized) return;

    set({ isLoading: true });
    const supabase = getSupabase();

    try {
      const [
        { data: identities },
        { data: websites },
        { data: platforms },
        { data: cards },
        { data: advertisers },
        { data: accounts },
        { data: orders },
      ] = await Promise.all([
        supabase.from('identities').select('*').order('created_at', { ascending: false }),
        supabase.from('websites').select('*').order('created_at', { ascending: false }),
        supabase.from('platforms').select('*').order('name'),
        supabase.from('cards').select('*').order('created_at', { ascending: false }),
        supabase.from('advertisers').select('*').order('created_at', { ascending: false }),
        supabase.from('platform_accounts').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('order_date', { ascending: false }),
      ]);

      set({
        identities: identities || [],
        websites: websites || [],
        platforms: platforms || [],
        cards: cards || [],
        advertisers: advertisers || [],
        accounts: accounts || [],
        orders: orders || [],
        isLoading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Error initializing data store:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  refreshData: async () => {
    set({ isInitialized: false });
    await get().initialize();
  },

  // Identity actions
  addIdentity: async (data) => {
    const supabase = getSupabase();
    const { data: newIdentity, error } = await supabase
      .from('identities')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      identities: [newIdentity, ...state.identities],
    }));

    return newIdentity;
  },

  updateIdentity: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('identities')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      identities: state.identities.map((i) => (i.id === id ? updated : i)),
    }));

    return updated;
  },

  deleteIdentity: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('identities').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      identities: state.identities.filter((i) => i.id !== id),
    }));

    return true;
  },

  getIdentity: (id) => get().identities.find((i) => i.id === id),

  // Website actions
  addWebsite: async (data) => {
    const supabase = getSupabase();
    const { data: newWebsite, error } = await supabase
      .from('websites')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      websites: [newWebsite, ...state.websites],
    }));

    return newWebsite;
  },

  updateWebsite: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('websites')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      websites: state.websites.map((w) => (w.id === id ? updated : w)),
    }));

    return updated;
  },

  deleteWebsite: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('websites').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      websites: state.websites.filter((w) => w.id !== id),
    }));

    return true;
  },

  getWebsite: (id) => get().websites.find((w) => w.id === id),

  // Card actions
  addCard: async (data) => {
    const supabase = getSupabase();
    const { data: newCard, error } = await supabase
      .from('cards')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      cards: [newCard, ...state.cards],
    }));

    return newCard;
  },

  updateCard: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('cards')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? updated : c)),
    }));

    return updated;
  },

  deleteCard: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('cards').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      cards: state.cards.filter((c) => c.id !== id),
    }));

    return true;
  },

  getCard: (id) => get().cards.find((c) => c.id === id),
  getCardsByIdentity: (identityId) =>
    get().cards.filter((c) => c.identity_id === identityId),

  // Advertiser actions
  addAdvertiser: async (data) => {
    const supabase = getSupabase();
    const { data: newAdvertiser, error } = await supabase
      .from('advertisers')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      advertisers: [newAdvertiser, ...state.advertisers],
    }));

    return newAdvertiser;
  },

  updateAdvertiser: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('advertisers')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      advertisers: state.advertisers.map((a) => (a.id === id ? updated : a)),
    }));

    return updated;
  },

  deleteAdvertiser: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('advertisers').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      advertisers: state.advertisers.filter((a) => a.id !== id),
    }));

    return true;
  },

  getAdvertiser: (id) => get().advertisers.find((a) => a.id === id),
  getAdvertisersByPlatform: (platformId) =>
    get().advertisers.filter((a) => a.platform_id === platformId),

  // Account actions
  addAccount: async (data) => {
    const supabase = getSupabase();
    const { data: newAccount, error } = await supabase
      .from('platform_accounts')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      accounts: [newAccount, ...state.accounts],
    }));

    return newAccount;
  },

  updateAccount: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('platform_accounts')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? updated : a)),
    }));

    return updated;
  },

  deleteAccount: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('platform_accounts').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    }));

    return true;
  },

  getAccount: (id) => get().accounts.find((a) => a.id === id),
  getAccountsByPlatform: (platformId) =>
    get().accounts.filter((a) => a.platform_id === platformId),

  // Order actions
  addOrder: async (data) => {
    const supabase = getSupabase();
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    return newOrder;
  },

  updateOrder: async (id, data) => {
    const supabase = getSupabase();
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? updated : o)),
    }));

    return updated;
  },

  deleteOrder: async (id) => {
    const supabase = getSupabase();
    const { error } = await supabase.from('orders').delete().eq('id', id);

    if (error) throw error;

    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));

    return true;
  },

  getOrder: (id) => get().orders.find((o) => o.id === id),
  getOrdersByPlatform: (platformId) =>
    get().orders.filter((o) => o.platform_id === platformId),

  // Platform actions
  getPlatform: (id) => get().platforms.find((p) => p.id === id),
  getPlatformBySlug: (slug) => get().platforms.find((p) => p.slug === slug),
}));

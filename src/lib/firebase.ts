import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, off } from 'firebase/database';
import { StoreState, Order } from '../types/store';
import { INITIAL_STORE_STATE } from './constants';

export const firebaseConfig = {
  apiKey: "AIzaSyBAYjxxM9v4m2F3_393iNhb3UmhYXUicys",
  authDomain: "portfolio-art-2d73d.firebaseapp.com",
  databaseURL: "https://portfolio-art-2d73d-default-rtdb.firebaseio.com",
  projectId: "portfolio-art-2d73d",
  storageBucket: "portfolio-art-2d73d.firebasestorage.app",
  messagingSenderId: "405478167539",
  appId: "1:405478167539:web:e1155b4ad7418b698c3886"
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const STORE_PATH = 'apexstore';
export const LOCAL_CACHE_KEY = 'apex_rtdb_cache';

const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('apex_realtime_sync')
    : null;

function normalizeArray<T>(val: unknown, fallback: T[]): T[] {
  if (val === undefined || val === null) return fallback;
  if (Array.isArray(val)) return val.filter((item) => item !== null && item !== undefined);
  if (typeof val === 'object') {
    return Object.values(val as Record<string, T>).filter((item) => item !== null && item !== undefined);
  }
  return fallback;
}

function normalizeOrders(val: unknown): Order[] {
  if (val === undefined || val === null) return [];
  const arr = normalizeArray<Order>(val, []);
  const map = new Map<string, Order>();
  for (const o of arr) {
    if (o && o.id !== undefined) {
      map.set(String(o.id), { ...o, id: String(o.id) });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const tA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : Number(a.createdAt || 0);
    const tB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : Number(b.createdAt || 0);
    return tB - tA;
  });
}

function getLocalList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function normalizeStoreState(data: Record<string, any> | null | undefined): StoreState {
  if (!data) return INITIAL_STORE_STATE;

  const isInitialized = Boolean(data.updatedAt);

  const permanentlyDeletedUsers = new Set(
    getLocalList<string>('apex_permanently_deleted_users')
      .map((e) => String(e).trim().toLowerCase())
      .filter(Boolean)
  );

  const remoteDeletedUsers = normalizeArray<string>(data.deletedUserEmails, []);
  const localDeletedUsers = getLocalList<string>('apex_deleted_user_emails');
  const rawBlockedEmails =
    localDeletedUsers.length > 0 || data.deletedUserEmails === undefined
      ? [...remoteDeletedUsers, ...localDeletedUsers]
      : remoteDeletedUsers;
  const deletedUserEmails = Array.from(
    new Set(
      rawBlockedEmails
        .map((e) => String(e).trim().toLowerCase())
        .filter((e) => Boolean(e) && !permanentlyDeletedUsers.has(e))
    )
  );

  const remoteDeletedOrders = normalizeArray<string>(data.deletedOrderIds, []);
  const localDeletedOrders = getLocalList<string>('apex_deleted_order_ids');
  const deletedOrderIds = Array.from(
    new Set([...remoteDeletedOrders, ...localDeletedOrders].map((id) => String(id).trim()).filter(Boolean))
  );

  const remoteDeletedProducts = normalizeArray<number>(data.deletedProductIds, []);
  const localDeletedProducts = getLocalList<number>('apex_deleted_product_ids');
  const deletedProductIds = Array.from(
    new Set([...remoteDeletedProducts, ...localDeletedProducts].map((id) => Number(id)).filter((n) => !Number.isNaN(n)))
  );

  const remoteDeletedCats = normalizeArray<string>(data.deletedCategoryIds, []);
  const localDeletedCats = getLocalList<string>('apex_deleted_category_ids');
  const deletedCategoryIds = Array.from(
    new Set([...remoteDeletedCats, ...localDeletedCats].map((id) => String(id).trim()).filter(Boolean))
  );

  const deletedUserSet = new Set(deletedUserEmails);
  const deletedOrderSet = new Set(deletedOrderIds);
  const deletedProductSet = new Set(deletedProductIds);
  const deletedCatSet = new Set(deletedCategoryIds);

  const parsedProducts = normalizeArray(data.products, isInitialized ? [] : INITIAL_STORE_STATE.products);
  const rawProducts = data.productsCleared && parsedProducts.length === 0 ? [] : parsedProducts;
  const products = rawProducts.filter((p) => p && !deletedProductSet.has(Number(p.id)));

  const parsedOrders = normalizeOrders(data.orders);
  const localOrders = normalizeOrders(getLocalList<Order>('apex_orders'));
  const mergedOrderMap = new Map<string, Order>();
  for (const lo of localOrders) {
    if (lo && lo.id !== undefined && !deletedOrderSet.has(String(lo.id))) {
      mergedOrderMap.set(String(lo.id), { ...lo, id: String(lo.id) });
    }
  }
  for (const ro of parsedOrders) {
    if (ro && ro.id !== undefined && !deletedOrderSet.has(String(ro.id))) {
      const prev = mergedOrderMap.get(String(ro.id));
      mergedOrderMap.set(String(ro.id), { ...(prev || {}), ...ro, id: String(ro.id) });
    }
  }
  const orders = Array.from(mergedOrderMap.values()).sort((a, b) => {
    const tA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : Number(a.createdAt || 0);
    const tB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : Number(b.createdAt || 0);
    return tB - tA;
  });

  const rawCategories =
    data.categories !== undefined
      ? normalizeArray(data.categories, [])
      : isInitialized
      ? normalizeArray(data.categories, INITIAL_STORE_STATE.categories || [])
      : INITIAL_STORE_STATE.categories || [];
  const categories = rawCategories.filter((c) => c && !deletedCatSet.has(String(c.id)));

  const parsedUsers = normalizeArray(data.users, []);
  const localUsers = getLocalList<any>('apex_registered_users');
  const mergedUsersMap = new Map<string, any>();
  for (const lu of localUsers) {
    const em = String(lu?.email || '').trim().toLowerCase();
    if (em && !permanentlyDeletedUsers.has(em)) {
      mergedUsersMap.set(em, {
        ...lu,
        blocked: Boolean(lu.blocked || deletedUserSet.has(em))
      });
    }
  }
  for (const ru of parsedUsers) {
    const em = String(ru?.email || '').trim().toLowerCase();
    if (em && !permanentlyDeletedUsers.has(em)) {
      const prev = mergedUsersMap.get(em);
      mergedUsersMap.set(em, {
        ...(prev || {}),
        ...ru,
        blocked: Boolean(ru.blocked || prev?.blocked || deletedUserSet.has(em))
      });
    }
  }
  const users = Array.from(mergedUsersMap.values());

  return {
    products,
    promos: normalizeArray(data.promos, isInitialized ? [] : INITIAL_STORE_STATE.promos),
    orders,
    sections: normalizeArray(data.sections, INITIAL_STORE_STATE.sections),
    categories,
    users,
    gallery: normalizeArray(data.gallery, isInitialized ? [] : INITIAL_STORE_STATE.gallery),
    galleryEnabled: data.galleryEnabled !== false,
    bannerImage: data.bannerImage !== undefined ? data.bannerImage : INITIAL_STORE_STATE.bannerImage,
    launchPool: normalizeArray(data.launchPool, isInitialized ? [] : INITIAL_STORE_STATE.launchPool),
    nextLaunchProductId:
      data.nextLaunchProductId !== undefined ? data.nextLaunchProductId : INITIAL_STORE_STATE.nextLaunchProductId,
    launchConfig: {
      ...INITIAL_STORE_STATE.launchConfig,
      ...(data.launchConfig || {})
    },
    globalLayout: data.globalLayout || INITIAL_STORE_STATE.globalLayout,
    paymentMethods: {
      ...INITIAL_STORE_STATE.paymentMethods,
      ...(data.paymentMethods || {})
    },
    customPaymentMethods: normalizeArray(data.customPaymentMethods, INITIAL_STORE_STATE.customPaymentMethods),
    notifications: normalizeArray(
      data.notifications,
      isInitialized ? [] : INITIAL_STORE_STATE.notifications
    ).filter((n) => !n.orderId || !deletedOrderSet.has(String(n.orderId))),
    transcriptSettings: {
      ...INITIAL_STORE_STATE.transcriptSettings,
      ...(data.transcriptSettings || {})
    },
    storeSettings: {
      ...INITIAL_STORE_STATE.storeSettings,
      ...(data.storeSettings || {})
    },
    announcementSettings: {
      ...INITIAL_STORE_STATE.announcementSettings,
      ...(data.announcementSettings || {})
    },
    featureToggles: {
      ...INITIAL_STORE_STATE.featureToggles,
      ...(data.featureToggles || {})
    },
    deletedUserEmails,
    deletedOrderIds,
    deletedProductIds,
    deletedCategoryIds,
    ordersCleared: Boolean(data.ordersCleared) && orders.length === 0,
    usersCleared: Boolean(data.usersCleared) && users.length === 0,
    productsCleared: Boolean(data.productsCleared) && products.length === 0,
    updatedAt: data.updatedAt || Date.now()
  };
}

function saveLocalStoreCache(state: Partial<StoreState>) {
  if (typeof window === 'undefined') return;
  try {
    if (state.deletedUserEmails !== undefined) {
      localStorage.setItem('apex_deleted_user_emails', JSON.stringify(state.deletedUserEmails));
    }
    if (state.deletedOrderIds !== undefined) {
      localStorage.setItem('apex_deleted_order_ids', JSON.stringify(state.deletedOrderIds));
    }
    if (state.deletedProductIds !== undefined) {
      localStorage.setItem('apex_deleted_product_ids', JSON.stringify(state.deletedProductIds));
    }
    if (state.deletedCategoryIds !== undefined) {
      localStorage.setItem('apex_deleted_category_ids', JSON.stringify(state.deletedCategoryIds));
    }

    const existingRaw = localStorage.getItem(LOCAL_CACHE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : INITIAL_STORE_STATE;
    const localOrdersFallback = getLocalList<Order>('apex_orders');
    const merged: Record<string, any> = {
      ...existing,
      orders:
        state.orders !== undefined
          ? state.orders
          : localOrdersFallback.length > 0
          ? localOrdersFallback
          : existing.orders,
      ...state,
      updatedAt: Date.now()
    };
    if (Array.isArray(merged.orders) && merged.orders.length > 0 && state.ordersCleared === undefined) {
      merged.ordersCleared = false;
    }
    if (Array.isArray(state.users) && state.users.length > 0 && state.usersCleared === undefined) {
      merged.usersCleared = false;
    }
    if (Array.isArray(state.products) && state.products.length > 0 && state.productsCleared === undefined) {
      merged.productsCleared = false;
    }
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));

    if (state.orders !== undefined) {
      const deletedOrderSet = new Set(getLocalList<string>('apex_deleted_order_ids').map(String));
      const normalizedForStorefront = state.orders
        .filter((o) => o && !deletedOrderSet.has(String(o.id)))
        .map((o) => ({
          ...o,
          id: Number.isNaN(Number(o.id)) ? o.id : Number(o.id),
          items: (o.items || []).map((it) => ({
            ...it,
            productId: it.productId || it.id,
            image: it.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
          })),
          subtotal: o.subtotal ?? o.total,
          discount: o.discount ?? 0,
          createdAt:
            typeof o.createdAt === 'number' ? new Date(o.createdAt).toISOString() : o.createdAt || new Date().toISOString()
        }));
      localStorage.setItem('apex_orders', JSON.stringify(normalizedForStorefront));
      window.dispatchEvent(new Event('apex_orders_updated'));
    }

    if (state.products !== undefined) {
      localStorage.setItem('apex_products_catalog', JSON.stringify(state.products));
      localStorage.setItem('apex_products', JSON.stringify(state.products));
      window.dispatchEvent(new Event('apex_products_updated'));
    }

    if (state.users !== undefined) {
      localStorage.setItem('apex_registered_users', JSON.stringify(state.users));
      window.dispatchEvent(new Event('apex_users_updated'));
    }

    if (state.categories !== undefined) {
      localStorage.setItem('apex_categories', JSON.stringify(state.categories));
      window.dispatchEvent(new Event('apex_categories_updated'));
    }

    if (state.notifications !== undefined) {
      localStorage.setItem('apex_notifications', JSON.stringify(state.notifications));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    }

    if (state.featureToggles !== undefined) {
      localStorage.setItem('apex_feature_toggles', JSON.stringify(state.featureToggles));
      window.dispatchEvent(new Event('apex_features_updated'));
    }

    if (state.storeSettings !== undefined) {
      localStorage.setItem('apex_store_settings', JSON.stringify(state.storeSettings));
      window.dispatchEvent(new Event('apex_store_settings_updated'));
    }

    window.dispatchEvent(new CustomEvent('apex_store_state_synced', { detail: merged }));
    if (syncChannel) {
      try {
        syncChannel.postMessage(merged);
      } catch {
        // ignore channel errors
      }
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const rtChannel = new BroadcastChannel('apex_realtime_sync_channel');
        rtChannel.postMessage({ type: 'STORE_UPDATE', payload: state, timestamp: Date.now() });
        rtChannel.close();
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore storage errors
  }
}

function sanitizeForFirebase<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

export function getCachedStoreState(): StoreState {
  if (typeof window === 'undefined') return INITIAL_STORE_STATE;
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    if (raw) {
      return normalizeStoreState(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return normalizeStoreState(INITIAL_STORE_STATE);
}

export async function fetchStoreFromFirebase(): Promise<StoreState> {
  try {
    const storeRef = ref(db, STORE_PATH);
    const snapshot = await Promise.race([
      get(storeRef),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1800))
    ]);

    if (snapshot.exists()) {
      const normalized = normalizeStoreState(snapshot.val());
      saveLocalStoreCache(normalized);
      return normalized;
    } else {
      const initial = sanitizeForFirebase(getCachedStoreState());
      saveLocalStoreCache(initial);
      set(storeRef, initial).catch(() => {});
      return initial;
    }
  } catch {
    return getCachedStoreState();
  }
}

export async function syncStoreToFirebase(state: StoreState): Promise<void> {
  const payload = sanitizeForFirebase({
    ...state,
    updatedAt: Date.now()
  });
  saveLocalStoreCache(payload);
  try {
    const storeRef = ref(db, STORE_PATH);
    await Promise.race([
      set(storeRef, payload),
      new Promise<void>((resolve) => setTimeout(resolve, 900))
    ]);
  } catch {
    // Local & BroadcastChannel sync already completed in 0ms
  }
}

export async function updateFirebasePartial(partial: Partial<StoreState>): Promise<void> {
  const cleanPartial = sanitizeForFirebase({
    ...partial,
    updatedAt: Date.now()
  });
  saveLocalStoreCache(cleanPartial);
  try {
    const storeRef = ref(db, STORE_PATH);
    await Promise.race([
      update(storeRef, cleanPartial),
      new Promise<void>((resolve) => setTimeout(resolve, 900))
    ]);
  } catch {
    // Local & BroadcastChannel sync already completed in 0ms
  }
}

export function subscribeToFirebaseStore(onData: (state: StoreState) => void, onError?: (err: Error) => void) {
  const storeRef = ref(db, STORE_PATH);

  const handleLocalSync = (e: Event) => {
    const customEvent = e as CustomEvent<StoreState>;
    if (customEvent.detail) {
      onData(normalizeStoreState(customEvent.detail));
    }
  };

  const handleChannelMessage = (e: MessageEvent) => {
    if (e.data) {
      onData(normalizeStoreState(e.data));
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('apex_store_state_synced', handleLocalSync);
    if (syncChannel) {
      syncChannel.addEventListener('message', handleChannelMessage);
    }
  }

  const unsubscribe = onValue(
    storeRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (typeof window !== 'undefined') {
          try {
            if (Array.isArray(val.deletedUserEmails)) {
              localStorage.setItem('apex_deleted_user_emails', JSON.stringify(val.deletedUserEmails));
            }
            if (Array.isArray(val.deletedOrderIds)) {
              localStorage.setItem('apex_deleted_order_ids', JSON.stringify(val.deletedOrderIds));
            }
            if (Array.isArray(val.deletedProductIds)) {
              localStorage.setItem('apex_deleted_product_ids', JSON.stringify(val.deletedProductIds));
            }
            if (Array.isArray(val.deletedCategoryIds)) {
              localStorage.setItem('apex_deleted_category_ids', JSON.stringify(val.deletedCategoryIds));
            }
          } catch {}
        }
        const merged = normalizeStoreState(val);
        onData(merged);
      }
    },
    (error) => {
      console.error("Firebase Realtime Database subscription error:", error);
      if (onError) onError(error);
    }
  );

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('apex_store_state_synced', handleLocalSync);
      if (syncChannel) {
        syncChannel.removeEventListener('message', handleChannelMessage);
      }
    }
    off(storeRef);
  };
}

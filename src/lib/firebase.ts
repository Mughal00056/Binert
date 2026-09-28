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

export function normalizeStoreState(data: Record<string, any> | null | undefined): StoreState {
  if (!data) return INITIAL_STORE_STATE;

  return {
    products: normalizeArray(data.products, INITIAL_STORE_STATE.products),
    promos: normalizeArray(data.promos, INITIAL_STORE_STATE.promos),
    orders: normalizeOrders(data.orders),
    sections: normalizeArray(data.sections, INITIAL_STORE_STATE.sections),
    categories:
      data.categories !== undefined
        ? normalizeArray(data.categories, [])
        : INITIAL_STORE_STATE.categories,
    users: normalizeArray(data.users, []),
    gallery: normalizeArray(data.gallery, INITIAL_STORE_STATE.gallery),
    galleryEnabled: data.galleryEnabled !== false,
    bannerImage: data.bannerImage !== undefined ? data.bannerImage : INITIAL_STORE_STATE.bannerImage,
    launchPool: normalizeArray(data.launchPool, INITIAL_STORE_STATE.launchPool),
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
    notifications: normalizeArray(data.notifications, INITIAL_STORE_STATE.notifications),
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
    featureToggles: data.featureToggles || INITIAL_STORE_STATE.featureToggles,
    updatedAt: data.updatedAt || Date.now()
  };
}

function saveLocalStoreCache(state: Partial<StoreState>) {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = localStorage.getItem(LOCAL_CACHE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : INITIAL_STORE_STATE;
    const merged = { ...existing, ...state, updatedAt: Date.now() };
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(merged));

    if (state.orders) {
      const normalizedForStorefront = state.orders.map((o) => ({
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
    }

    if (state.products) {
      localStorage.setItem('apex_products_catalog', JSON.stringify(state.products));
    }

    if (state.notifications) {
      localStorage.setItem('apex_notifications', JSON.stringify(state.notifications));
    }

    window.dispatchEvent(new CustomEvent('apex_store_state_synced', { detail: merged }));
  } catch {
    // ignore storage errors
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
    const snapshot = await get(storeRef);

    if (snapshot.exists()) {
      const normalized = normalizeStoreState(snapshot.val());
      saveLocalStoreCache(normalized);
      return normalized;
    } else {
      const initial = getCachedStoreState();
      await set(storeRef, initial);
      saveLocalStoreCache(initial);
      return initial;
    }
  } catch (err) {
    console.warn('Using cached store state (Firebase unreachable):', err);
    return getCachedStoreState();
  }
}

export async function syncStoreToFirebase(state: StoreState): Promise<void> {
  const payload = {
    ...state,
    updatedAt: Date.now()
  };
  saveLocalStoreCache(payload);
  const storeRef = ref(db, STORE_PATH);
  await set(storeRef, payload);
}

export async function updateFirebasePartial(partial: Partial<StoreState>): Promise<void> {
  saveLocalStoreCache(partial);
  const storeRef = ref(db, STORE_PATH);
  await update(storeRef, {
    ...partial,
    updatedAt: Date.now()
  });
}

export function subscribeToFirebaseStore(onData: (state: StoreState) => void, onError?: (err: Error) => void) {
  const storeRef = ref(db, STORE_PATH);

  const handleLocalSync = (e: Event) => {
    const customEvent = e as CustomEvent<StoreState>;
    if (customEvent.detail) {
      onData(normalizeStoreState(customEvent.detail));
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('apex_store_state_synced', handleLocalSync);
  }

  const unsubscribe = onValue(
    storeRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const merged = normalizeStoreState(snapshot.val());
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
    }
    off(storeRef);
  };
}

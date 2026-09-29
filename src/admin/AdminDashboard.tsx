import React, { useState, useEffect, useRef } from 'react';
import {
  StoreState,
  Product,
  Promo,
  Order,
  OrderStatus,
  Section,
  CategoryItem,
  LaunchPoolProduct,
  LaunchConfig,
  ProductLayoutType,
  CustomPaymentMethod,
  NotificationItem,
  TranscriptSettings,
  StoreSettings,
  AnnouncementSettings,
  OrderDeliveryInfo
} from '../types/store';
import { FeatureToggles, DEFAULT_FEATURE_TOGGLES } from '../types';
import { INITIAL_STORE_STATE, FALLBACK_SECTIONS, FALLBACK_CATEGORIES, INITIAL_TRANSCRIPT_SETTINGS } from '../lib/constants';
import {
  fetchStoreFromFirebase,
  syncStoreToFirebase,
  updateFirebasePartial,
  subscribeToFirebaseStore
} from '../lib/firebase';
import { Sidebar, TabKey } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminTheme, ADMIN_THEMES } from './theme';

// Tabs
import { DashboardTab } from './components/DashboardTab';
import { FeaturesTab } from './components/FeaturesTab';
import { ProductsTab } from './components/ProductsTab';
import { HeroImagesTab } from './components/HeroImagesTab';
import { SectionsTab } from './components/SectionsTab';
import { PromosTab } from './components/PromosTab';
import { OrdersTab } from './components/OrdersTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ReceiptTab } from './components/ReceiptTab';
import { LaunchControlTab } from './components/LaunchControlTab';
import { LayoutTab } from './components/LayoutTab';
import { PaymentsTab } from './components/PaymentsTab';
import { StoreSettingsTab } from './components/StoreSettingsTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';

// Modals
import { ProductModal } from './modals/ProductModal';
import { PromoModal } from './modals/PromoModal';
import { SectionModal } from './modals/SectionModal';
import { OrderDetailModal } from './modals/OrderDetailModal';
import { PaymentMethodModal } from './modals/PaymentMethodModal';
import { AddToPoolModal } from './modals/AddToPoolModal';
import { PoolPickerModal } from './modals/PoolPickerModal';
import { StorePreviewModal } from './modals/StorePreviewModal';

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info';
}

interface AdminDashboardProps {
  onSwitchToStorefront?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSwitchToStorefront }) => {
  const [state, setState] = useState<StoreState>(INITIAL_STORE_STATE);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>(() => {
    try {
      const saved = localStorage.getItem('apex_feature_toggles');
      return saved ? JSON.parse(saved) : DEFAULT_FEATURE_TOGGLES;
    } catch {
      return DEFAULT_FEATURE_TOGGLES;
    }
  });

  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('saving');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Admin Theme with persistent selection (defaults to 'cyber' Dark Neon theme)
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    try {
      const saved = localStorage.getItem('apex_admin_theme') as AdminTheme | null;
      if (saved && ['cyber', 'default', 'midnight', 'emerald'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'cyber';
  });

  const handleSelectTheme = (theme: AdminTheme) => {
    setAdminTheme(theme);
    try {
      localStorage.setItem('apex_admin_theme', theme);
    } catch {
      // ignore
    }
    const found = ADMIN_THEMES.find((t) => t.id === theme);
    showToast(`Admin theme switched to ${found?.name || theme}!`, 'info');
  };

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [editingPromoIndex, setEditingPromoIndex] = useState<number | null>(null);

  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<CustomPaymentMethod | null>(null);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState<number | null>(null);

  const [addToPoolModalOpen, setAddToPoolModalOpen] = useState(false);
  const [editingPoolProduct, setEditingPoolProduct] = useState<LaunchPoolProduct | null>(null);
  const [editingPoolIndex, setEditingPoolIndex] = useState<number | null>(null);

  const [poolPickerModalOpen, setPoolPickerModalOpen] = useState(false);
  const [storePreviewModalOpen, setStorePreviewModalOpen] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  // Toast Helper
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // 1. Initial Load & Firebase Realtime Subscription + 0ms Local & BroadcastChannel Sync
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setSyncStatus('saving');
        const initialData = await fetchStoreFromFirebase();
        if (isMounted) {
          setState(initialData);
          if (initialData.featureToggles) {
            setFeatureToggles({ ...DEFAULT_FEATURE_TOGGLES, ...initialData.featureToggles });
            try {
              localStorage.setItem('apex_feature_toggles', JSON.stringify({ ...DEFAULT_FEATURE_TOGGLES, ...initialData.featureToggles }));
            } catch {
              // ignore
            }
          }
          setSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Initial Firebase load fallback:', err);
        if (isMounted) setSyncStatus('synced');
      }
    }

    init();

    // Instant local event listeners when User Panel places order or verifies OTP
    const syncLocalOrdersAndUsers = () => {
      if (!isMounted) return;
      try {
        const rawOrders = localStorage.getItem('apex_orders');
        if (rawOrders) {
          const parsedOrders = JSON.parse(rawOrders);
          if (Array.isArray(parsedOrders)) {
            setState((prev) => ({ ...prev, orders: parsedOrders }));
            setSelectedOrder((curr) => {
              if (!curr) return null;
              return parsedOrders.find((o: Order) => String(o.id) === String(curr.id)) || curr;
            });
          }
        }
        const rawUsers = localStorage.getItem('apex_registered_users');
        if (rawUsers) {
          const parsedUsers = JSON.parse(rawUsers);
          if (Array.isArray(parsedUsers)) {
            setState((prev) => ({ ...prev, users: parsedUsers }));
          }
        }
        const rawNotifs = localStorage.getItem('apex_notifications');
        if (rawNotifs) {
          const parsedNotifs = JSON.parse(rawNotifs);
          if (Array.isArray(parsedNotifs)) {
            setState((prev) => ({ ...prev, notifications: parsedNotifs }));
          }
        }
      } catch {}
    };

    window.addEventListener('storage', syncLocalOrdersAndUsers);
    window.addEventListener('apex_orders_updated', syncLocalOrdersAndUsers);
    window.addEventListener('apex_users_updated', syncLocalOrdersAndUsers);
    window.addEventListener('apex_notifications_updated', syncLocalOrdersAndUsers);

    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('apex_realtime_sync_channel');
        bc.onmessage = (ev) => {
          if (!isMounted) return;
          if (ev.data && ev.data.type === 'STORE_UPDATE' && ev.data.payload) {
            const p = ev.data.payload as Partial<StoreState>;
            setState((prev) => ({ ...prev, ...p }));
            if (p.featureToggles) {
              setFeatureToggles((prev) => ({ ...prev, ...p.featureToggles }));
            }
            setSyncStatus('synced');
          }
        };
      }
    } catch {}

    // Subscribe to live changes
    const unsubscribe = subscribeToFirebaseStore(
      (remoteState) => {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            ...remoteState,
            launchConfig: {
              ...prev.launchConfig,
              ...remoteState.launchConfig,
              secondsLeft: prev.launchConfig.isRunning
                ? prev.launchConfig.secondsLeft
                : (remoteState.launchConfig?.secondsLeft ?? prev.launchConfig.secondsLeft)
            }
          }));
          if (remoteState.featureToggles) {
            setFeatureToggles({ ...DEFAULT_FEATURE_TOGGLES, ...remoteState.featureToggles });
            try {
              localStorage.setItem('apex_feature_toggles', JSON.stringify({ ...DEFAULT_FEATURE_TOGGLES, ...remoteState.featureToggles }));
            } catch {
              // ignore
            }
          }
          setSyncStatus('synced');
        }
      },
      (err) => {
        console.warn('Firebase subscription fallback:', err);
        if (isMounted) setSyncStatus('synced');
      }
    );

    return () => {
      isMounted = false;
      window.removeEventListener('storage', syncLocalOrdersAndUsers);
      window.removeEventListener('apex_orders_updated', syncLocalOrdersAndUsers);
      window.removeEventListener('apex_users_updated', syncLocalOrdersAndUsers);
      window.removeEventListener('apex_notifications_updated', syncLocalOrdersAndUsers);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      unsubscribe();
    };
  }, []);

  // Update Feature Toggle Handler with Firebase Sync
  const handleUpdateFeatureToggle = async (key: keyof FeatureToggles, enabled: boolean) => {
    const updated = {
      ...DEFAULT_FEATURE_TOGGLES,
      ...featureToggles,
      [key]: enabled
    };
    setFeatureToggles(updated);
    try {
      localStorage.setItem('apex_feature_toggles', JSON.stringify(updated));
      window.dispatchEvent(new Event('apex_features_updated'));
    } catch {
      // ignore
    }

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ featureToggles: updated });
      setSyncStatus('synced');
      showToast(`Feature "${String(key)}" ${enabled ? 'enabled' : 'disabled'}!`, 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleEnableAllFeatures = async () => {
    const allKeys = Object.keys({ ...DEFAULT_FEATURE_TOGGLES, ...featureToggles });
    const allEnabled = allKeys.reduce((acc, k) => {
      acc[k as keyof FeatureToggles] = true;
      return acc;
    }, {} as FeatureToggles);

    setFeatureToggles(allEnabled);
    try {
      localStorage.setItem('apex_feature_toggles', JSON.stringify(allEnabled));
      window.dispatchEvent(new Event('apex_features_updated'));
    } catch {
      // ignore
    }

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ featureToggles: allEnabled });
      setSyncStatus('synced');
      showToast('All features enabled successfully!', 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDisableAllFeatures = async () => {
    const allKeys = Object.keys({ ...DEFAULT_FEATURE_TOGGLES, ...featureToggles });
    const allDisabled = allKeys.reduce((acc, k) => {
      acc[k as keyof FeatureToggles] = false;
      return acc;
    }, {} as FeatureToggles);

    setFeatureToggles(allDisabled);
    try {
      localStorage.setItem('apex_feature_toggles', JSON.stringify(allDisabled));
      window.dispatchEvent(new Event('apex_features_updated'));
    } catch {
      // ignore
    }

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ featureToggles: allDisabled });
      setSyncStatus('synced');
      showToast('All features disabled!', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Launch countdown timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (state.launchConfig.isRunning && state.launchConfig.secondsLeft > 0) {
      interval = setInterval(() => {
        setState((prev) => {
          const nextSec = prev.launchConfig.secondsLeft - 1;
          if (nextSec <= 0) {
            handleAutoLaunchDrop();
            return {
              ...prev,
              launchConfig: {
                ...prev.launchConfig,
                secondsLeft: 0,
                isRunning: false
              }
            };
          }
          return {
            ...prev,
            launchConfig: {
              ...prev.launchConfig,
              secondsLeft: nextSec
            }
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.launchConfig.isRunning, state.launchConfig.secondsLeft]);

  // Automated Drop from Launch Pool
  const handleAutoLaunchDrop = async () => {
    const current = stateRef.current;
    if (current.launchPool.length === 0) {
      showToast('Countdown finished! Launch pool was empty.', 'info');
      return;
    }

    const poolItem = current.launchPool[0];
    const newPool = current.launchPool.slice(1);

    const newProd: Product = {
      id: typeof poolItem.id === 'number' ? poolItem.id : Date.now(),
      name: poolItem.name,
      category: poolItem.category,
      price: poolItem.price,
      oldPrice: poolItem.oldPrice,
      rating: poolItem.rating ?? 5.0,
      reviews: poolItem.reviews ?? 1,
      badge: poolItem.badge ?? 'DROP',
      stock: poolItem.stock,
      public: true,
      image: poolItem.image,
      description: poolItem.description ?? ''
    };

    const updatedProducts = [newProd, ...current.products];
    const updatedState: StoreState = {
      ...current,
      products: updatedProducts,
      launchPool: newPool,
      nextLaunchProductId: newPool.length > 0 ? newPool[0].id : null,
      launchConfig: {
        ...current.launchConfig,
        isRunning: false,
        secondsLeft: 0
      }
    };

    setState(updatedState);
    try {
      setSyncStatus('saving');
      await syncStoreToFirebase(updatedState);
      setSyncStatus('synced');
      showToast(`🔥 Automatic Drop: "${newProd.name}" is now live in store!`, 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Force Full Sync to Firebase
  const handleForceSync = async () => {
    try {
      setSyncStatus('saving');
      await syncStoreToFirebase({
        ...state,
        featureToggles
      });
      setSyncStatus('synced');
      showToast('Store & Feature Toggles synced to Firebase!', 'success');
    } catch (err) {
      console.warn(err);
      setSyncStatus('synced');
      showToast('Store & Feature Toggles synced!', 'success');
    }
  };

  // Broadcast helper for 0ms cross-tab sync between Admin and Storefront
  const broadcastSync = (payload: Partial<StoreState>) => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('apex_realtime_sync_channel');
        bc.postMessage({ type: 'STORE_UPDATE', payload, timestamp: Date.now() });
        bc.close();
      }
    } catch {}
  };

  // Product Actions (Instant 0ms Storefront + Firebase Sync)
  const syncProductsEverywhere = async (
    updatedProducts: Product[],
    toastMsg?: string,
    toastType: 'success' | 'info' | 'error' = 'success',
    extraDeletedIds?: number[]
  ) => {
    let deletedIds: number[] = [];
    try {
      const raw = localStorage.getItem('apex_deleted_product_ids');
      deletedIds = raw ? JSON.parse(raw) : [];
    } catch {}
    if (extraDeletedIds) {
      deletedIds = Array.from(new Set([...deletedIds, ...extraDeletedIds]));
    }
    const activeIds = new Set(updatedProducts.map((p) => Number(p.id)));
    deletedIds = deletedIds.filter((id) => !activeIds.has(Number(id)));

    setState((prev) => ({
      ...prev,
      products: updatedProducts,
      deletedProductIds: deletedIds,
      productsCleared: updatedProducts.length === 0
    }));
    try {
      localStorage.setItem('apex_deleted_product_ids', JSON.stringify(deletedIds));
      localStorage.setItem('apex_products_catalog', JSON.stringify(updatedProducts));
      localStorage.setItem('apex_products', JSON.stringify(updatedProducts));
      window.dispatchEvent(new Event('apex_products_updated'));
    } catch {}
    broadcastSync({
      products: updatedProducts,
      deletedProductIds: deletedIds,
      productsCleared: updatedProducts.length === 0
    });
    if (toastMsg) showToast(toastMsg, toastType);

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        products: updatedProducts,
        deletedProductIds: deletedIds,
        productsCleared: updatedProducts.length === 0
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    let updatedProducts: Product[];
    let msg = '';
    if (editingProduct) {
      updatedProducts = state.products.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...productData } as Product) : p
      );
      msg = `Product "${productData.name}" updated & synced!`;
    } else {
      const newProd: Product = {
        id: Date.now(),
        name: productData.name || 'New Product',
        category: productData.category || 'General',
        price: Number(productData.price) || 0,
        oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
        rating: 5.0,
        reviews: 0,
        badge: productData.badge || 'NEW',
        stock: Number(productData.stock) || 10,
        public: productData.public !== false,
        image: productData.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        description: productData.description || ''
      };
      updatedProducts = [newProd, ...state.products];
      msg = `Product "${newProd.name}" created & live in store!`;
    }

    setProductModalOpen(false);
    setEditingProduct(null);
    await syncProductsEverywhere(updatedProducts, msg, 'success');
  };

  const handleDeleteProduct = async (id: number) => {
    const updated = state.products.filter((p) => Number(p.id) !== Number(id));
    await syncProductsEverywhere(updated, 'Product deleted permanently from store', 'info', [Number(id)]);
  };

  const handleToggleProductPublic = async (id: number) => {
    const updated = state.products.map((p) => (p.id === id ? { ...p, public: !p.public } : p));
    await syncProductsEverywhere(updated, 'Product visibility updated', 'success');
  };

  // Hero & Banner Actions
  const handleSaveBanner = async (bannerUrl: string) => {
    setState((prev) => ({ ...prev, bannerImage: bannerUrl }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ bannerImage: bannerUrl });
      setSyncStatus('synced');
      showToast('Main Hero Banner updated!');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleToggleGallery = async (enabled: boolean) => {
    setState((prev) => ({ ...prev, galleryEnabled: enabled }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ galleryEnabled: enabled });
      setSyncStatus('synced');
      showToast(`Gallery ${enabled ? 'enabled' : 'disabled'}`);
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleUpdateGallery = async (images: string[]) => {
    setState((prev) => ({ ...prev, gallery: images }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ gallery: images });
      setSyncStatus('synced');
      showToast('Gallery image list updated!');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Category Actions (Add Category, Add/Change/Delete Category Image, Delete Category)
  const syncCategoriesEverywhere = async (
    updatedCategories: CategoryItem[],
    toastMsg?: string,
    extraDeletedCatIds?: string[],
    resetDeleted?: boolean
  ) => {
    let deletedCatIds: string[] = [];
    if (!resetDeleted) {
      try {
        const raw = localStorage.getItem('apex_deleted_category_ids');
        deletedCatIds = raw ? JSON.parse(raw) : [];
      } catch {}
      if (extraDeletedCatIds) {
        deletedCatIds = Array.from(new Set([...deletedCatIds, ...extraDeletedCatIds]));
      }
      const activeCatIds = new Set(updatedCategories.map((c) => String(c.id)));
      deletedCatIds = deletedCatIds.filter((id) => !activeCatIds.has(String(id)));
    }

    setState((prev) => ({
      ...prev,
      categories: updatedCategories,
      deletedCategoryIds: deletedCatIds
    }));
    try {
      localStorage.setItem('apex_deleted_category_ids', JSON.stringify(deletedCatIds));
      localStorage.setItem('apex_categories', JSON.stringify(updatedCategories));
      window.dispatchEvent(new Event('apex_categories_updated'));
    } catch {}
    broadcastSync({ categories: updatedCategories, deletedCategoryIds: deletedCatIds });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        categories: updatedCategories,
        deletedCategoryIds: deletedCatIds
      });
      setSyncStatus('synced');
      if (toastMsg) showToast(toastMsg, 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleAddCategory = async (categoryData: Omit<CategoryItem, 'id'>) => {
    const newCat: CategoryItem = {
      id: 'cat_' + Date.now(),
      name: categoryData.name,
      filter: categoryData.filter,
      image: categoryData.image || '',
      icon: categoryData.icon || 'fa-layer-group'
    };
    const currentCats = Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES;
    const updated = [...currentCats, newCat];
    await syncCategoriesEverywhere(updated, `Category "${newCat.name}" added!`);
  };

  const handleUpdateCategory = async (categoryId: string | number, partial: Partial<CategoryItem>) => {
    const currentCats = Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES;
    const updated = currentCats.map((c) =>
      String(c.id) === String(categoryId) ? { ...c, ...partial } : c
    );
    await syncCategoriesEverywhere(updated, 'Category image updated!');
  };

  const handleDeleteCategoryImage = async (categoryId: string | number) => {
    const currentCats = Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES;
    const updated = currentCats.map((c) =>
      String(c.id) === String(categoryId) ? { ...c, image: '' } : c
    );
    await syncCategoriesEverywhere(updated, 'Category image removed!');
  };

  const handleDeleteCategory = async (categoryId: string | number) => {
    const idStr = String(categoryId);
    const currentCats = Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES;
    const updated = currentCats.filter((c) => String(c.id) !== idStr);
    await syncCategoriesEverywhere(updated, 'Category deleted permanently!', [idStr]);
  };

  const handleResetCategories = async () => {
    await syncCategoriesEverywhere(FALLBACK_CATEGORIES, 'Categories reset to default!', [], true);
  };

  // Section Actions
  const handleSaveSection = async (sectionData: Partial<Section>) => {
    let updatedSections: Section[];
    if (editingSection) {
      updatedSections = state.sections.map((s) =>
        s.id === editingSection.id ? ({ ...s, ...sectionData } as Section) : s
      );
      showToast(`Section "${sectionData.title}" updated!`);
    } else {
      const newSec: Section = {
        id: Date.now(),
        title: sectionData.title || 'New Section',
        filter: sectionData.filter || 'all',
        layout: sectionData.layout || 'horizontal',
        order: state.sections.length + 1,
        active: true
      };
      updatedSections = [...state.sections, newSec];
      showToast(`Section "${newSec.title}" created!`);
    }

    setState((prev) => ({ ...prev, sections: updatedSections }));
    setSectionModalOpen(false);
    setEditingSection(null);

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: updatedSections });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeleteSection = async (id: number) => {
    const updated = state.sections.filter((s) => s.id !== id);
    setState((prev) => ({ ...prev, sections: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: updated });
      setSyncStatus('synced');
      showToast('Section deleted', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleToggleSectionActive = async (id: number) => {
    const updated = state.sections.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setState((prev) => ({ ...prev, sections: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: updated });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleReorderSections = async (newSections: Section[]) => {
    setState((prev) => ({ ...prev, sections: newSections }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: newSections });
      setSyncStatus('synced');
      showToast('Sections order saved');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleResetSections = async () => {
    setState((prev) => ({ ...prev, sections: FALLBACK_SECTIONS }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: FALLBACK_SECTIONS });
      setSyncStatus('synced');
      showToast('Sections reset to defaults');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Promo Actions
  const handleSavePromo = async (promoData: Promo, index: number | null) => {
    let updatedPromos: Promo[];
    if (index !== null) {
      updatedPromos = [...state.promos];
      updatedPromos[index] = promoData;
      showToast(`Promo "${promoData.code}" updated!`);
    } else {
      updatedPromos = [promoData, ...state.promos];
      showToast(`Promo "${promoData.code}" created!`);
    }

    setState((prev) => ({ ...prev, promos: updatedPromos }));
    setPromoModalOpen(false);
    setEditingPromo(null);
    setEditingPromoIndex(null);

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ promos: updatedPromos });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeletePromo = async (index: number) => {
    const updated = state.promos.filter((_, i) => i !== index);
    setState((prev) => ({ ...prev, promos: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ promos: updated });
      setSyncStatus('synced');
      showToast('Promo code removed', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleTogglePromo = async (index: number) => {
    const updated = state.promos.map((p, i) => (i === index ? { ...p, active: !p.active } : p));
    setState((prev) => ({ ...prev, promos: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ promos: updated });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    customOtp?: string,
    deliveryInfo?: OrderDeliveryInfo
  ) => {
    const generatedOtp =
      status === 'otp_sent'
        ? customOtp && customOtp.trim().length >= 4
          ? customOtp.trim()
          : Math.floor(100000 + Math.random() * 900000).toString()
        : undefined;

    const targetOrder = state.orders.find((o) => String(o.id) === String(orderId));
    const targetEmail = targetOrder?.email ? targetOrder.email.trim().toLowerCase() : undefined;

    const defaultProductName =
      targetOrder?.items && targetOrder.items.length > 0
        ? targetOrder.items.map((it) => it.name).join(', ')
        : 'Flagship Digital / Tech Order';
    const firstItemId = targetOrder?.items?.[0]?.productId || targetOrder?.items?.[0]?.id || orderId;
    const defaultProductLink =
      targetOrder?.items?.[0]?.productUrl || `${window.location.origin}/#product-${firstItemId}`;

    const finalDeliveryInfo: OrderDeliveryInfo | undefined =
      status === 'delivered' || status === 'verified' || deliveryInfo
        ? {
            productName: deliveryInfo?.productName?.trim() || targetOrder?.deliveryInfo?.productName || defaultProductName,
            productLink: deliveryInfo?.productLink?.trim() || targetOrder?.deliveryInfo?.productLink || defaultProductLink,
            downloadUrl:
              deliveryInfo?.downloadUrl?.trim() ||
              targetOrder?.deliveryInfo?.downloadUrl ||
              targetOrder?.items?.[0]?.image ||
              defaultProductLink,
            fileName:
              deliveryInfo?.fileName?.trim() ||
              targetOrder?.deliveryInfo?.fileName ||
              `${(deliveryInfo?.productName || defaultProductName).replace(/[^a-zA-Z0-9_-]/g, '_')}_Package.html`,
            licenseKey:
              deliveryInfo?.licenseKey?.trim() ||
              targetOrder?.deliveryInfo?.licenseKey ||
              `APX-KEY-${String(orderId).slice(-6).toUpperCase()}`,
            deliveryNote:
              deliveryInfo?.deliveryNote?.trim() ||
              targetOrder?.deliveryInfo?.deliveryNote ||
              'Thank you for shopping with ApexStore! Your verified product link, digital access package & download file are ready below.',
            deliveredAt: new Date().toISOString()
          }
        : targetOrder?.deliveryInfo;

    const updated = state.orders.map((o) => {
      if (String(o.id) !== String(orderId)) return o;
      const timeline = Array.isArray(o.timeline) ? o.timeline : [];
      const nextOtp = generatedOtp || o.otp;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let entryTitle = `Order Marked ${status.toUpperCase()}`;
      let entryNote = `Status updated by Admin to ${status}.`;
      if (status === 'otp_sent') {
        entryTitle = 'Admin Approved — OTP Dispatched';
        entryNote = `Admin verified payment details and dispatched 6-digit confirmation OTP: ${nextOtp}.`;
      } else if (status === 'processing') {
        entryTitle = 'Order Processing Started';
        entryNote = 'OTP verified — Admin is preparing your product delivery & download package.';
      } else if (status === 'verified' || status === 'delivered') {
        entryTitle = 'Order Delivered — Product Link & Download Ready';
        entryNote = `${finalDeliveryInfo?.productName || 'Order'} delivered! Product link: ${finalDeliveryInfo?.productLink || 'Attached'} • ${finalDeliveryInfo?.deliveryNote || ''}`;
      } else if (status === 'rejected') {
        entryTitle = 'Order Rejected';
        entryNote = 'Merchant declined payment proof or transaction ID.';
      }

      const nextOrder: Order = {
        ...o,
        status,
        otp: nextOtp,
        otpSentAt: status === 'otp_sent' ? new Date().toISOString() : o.otpSentAt,
        timeline: [
          ...timeline,
          {
            status,
            title: entryTitle,
            time: timeStr,
            note: entryNote,
            completed: true
          }
        ]
      };
      if (finalDeliveryInfo) {
        nextOrder.deliveryInfo = finalDeliveryInfo;
      }
      return nextOrder;
    });

    let updatedNotifications = state.notifications;
    if (status === 'otp_sent' && generatedOtp) {
      const otpNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'order',
        icon: 'fa-key',
        title: `Admin Approved Order #${String(orderId).slice(-6)} — OTP Inside!`,
        desc: `Your 6-digit confirmation OTP is: ${generatedOtp}. Enter this OTP in My Orders to start order processing.`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId,
        otp: generatedOtp
      };
      updatedNotifications = [otpNotif, ...state.notifications];
    } else if (status === 'processing') {
      const procNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'order',
        icon: 'fa-gears',
        title: `Order #${String(orderId).slice(-6)} is Processing ⚙️`,
        desc: `Your order #${String(orderId).slice(-6)} is currently processing! Admin is preparing your product link & download package.`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId
      };
      updatedNotifications = [procNotif, ...state.notifications];
    } else if (status === 'verified' || status === 'delivered') {
      const verNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'order',
        icon: 'fa-box-open',
        title: `Order #${String(orderId).slice(-6)} Delivered — Download & Link Ready! 🎉`,
        desc: `Product: ${finalDeliveryInfo?.productName || defaultProductName} | Link: ${finalDeliveryInfo?.productLink || defaultProductLink} | ${finalDeliveryInfo?.deliveryNote || 'Open My Orders to download your product!'}`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId,
        deliveryInfo: finalDeliveryInfo
      };
      updatedNotifications = [verNotif, ...state.notifications];
    } else if (status === 'rejected') {
      const rejNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'alert',
        icon: 'fa-circle-xmark',
        title: `Order #${String(orderId).slice(-6)} Rejected`,
        desc: `Your order #${String(orderId).slice(-6)} was declined by Admin during verification.`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId
      };
      updatedNotifications = [rejNotif, ...state.notifications];
    }

    setState((prev) => ({ ...prev, orders: updated, notifications: updatedNotifications }));
    try {
      localStorage.setItem('apex_orders', JSON.stringify(updated));
      localStorage.setItem('apex_notifications', JSON.stringify(updatedNotifications));
      window.dispatchEvent(new Event('apex_orders_updated'));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}
    broadcastSync({ orders: updated, notifications: updatedNotifications });

    if (selectedOrder && String(selectedOrder.id) === String(orderId)) {
      const updatedSelected = updated.find((o) => String(o.id) === String(orderId)) || null;
      setSelectedOrder(updatedSelected);
    }

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ orders: updated, notifications: updatedNotifications });
      setSyncStatus('synced');
      if (status === 'otp_sent' && generatedOtp) {
        showToast(
          `OTP ${generatedOtp} sent exclusively to ${targetEmail || `Order #${String(orderId).slice(-6)}`}!`,
          'success'
        );
      } else if (status === 'delivered') {
        showToast(
          `Order #${String(orderId).slice(-6)} Delivered with Product Link & Download to ${targetEmail || 'Customer'}!`,
          'success'
        );
      } else {
        showToast(`Order #${String(orderId).slice(-6)} marked as ${status.toUpperCase()} & synced!`, 'success');
      }
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const idStr = String(orderId).trim();
    let deletedOrderIds: string[] = [];
    try {
      const raw = localStorage.getItem('apex_deleted_order_ids');
      deletedOrderIds = raw ? JSON.parse(raw) : [];
    } catch {}
    if (!deletedOrderIds.includes(idStr)) {
      deletedOrderIds.push(idStr);
    }

    const updated = state.orders.filter((o) => String(o.id).trim() !== idStr);
    const updatedNotifs = state.notifications.filter((n) => String(n.orderId || '') !== idStr);

    setState((prev) => ({
      ...prev,
      orders: updated,
      notifications: updatedNotifs,
      deletedOrderIds,
      ordersCleared: updated.length === 0
    }));
    try {
      localStorage.setItem('apex_deleted_order_ids', JSON.stringify(deletedOrderIds));
      localStorage.setItem('apex_orders', JSON.stringify(updated));
      localStorage.setItem('apex_notifications', JSON.stringify(updatedNotifs));
      window.dispatchEvent(new Event('apex_orders_updated'));
    } catch {}
    broadcastSync({
      orders: updated,
      notifications: updatedNotifs,
      deletedOrderIds,
      ordersCleared: updated.length === 0
    });

    if (selectedOrder && String(selectedOrder.id).trim() === idStr) {
      setSelectedOrder(null);
      setOrderDetailOpen(false);
    }
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        orders: updated,
        notifications: updatedNotifs,
        deletedOrderIds,
        ordersCleared: updated.length === 0
      });
      setSyncStatus('synced');
      showToast(`Order #${idStr.slice(-6)} permanently deleted everywhere`, 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleClearAllOrders = async () => {
    let deletedOrderIds: string[] = [];
    try {
      const raw = localStorage.getItem('apex_deleted_order_ids');
      deletedOrderIds = raw ? JSON.parse(raw) : [];
    } catch {}
    const currentOrderIds = state.orders.map((o) => String(o.id).trim());
    deletedOrderIds = Array.from(new Set([...deletedOrderIds, ...currentOrderIds]));

    setState((prev) => ({
      ...prev,
      orders: [],
      deletedOrderIds,
      ordersCleared: true
    }));
    try {
      localStorage.setItem('apex_deleted_order_ids', JSON.stringify(deletedOrderIds));
      localStorage.setItem('apex_orders', JSON.stringify([]));
      window.dispatchEvent(new Event('apex_orders_updated'));
    } catch {}
    broadcastSync({
      orders: [],
      deletedOrderIds,
      ordersCleared: true
    });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        orders: [],
        deletedOrderIds,
        ordersCleared: true
      });
      setSyncStatus('synced');
      showToast('All orders permanently cleared from Admin & User panel', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  // User Management Actions (Add User, Delete User, Clear All Users)
  const syncUsersEverywhere = async (
    updatedUsers: NonNullable<StoreState['users']>,
    deletedEmailsList: string[],
    toastMsg?: string,
    toastType: 'success' | 'info' = 'success'
  ) => {
    const cleanDeleted = Array.from(new Set(deletedEmailsList.map((e) => e.trim().toLowerCase()).filter(Boolean)));
    setState((prev) => ({
      ...prev,
      users: updatedUsers,
      deletedUserEmails: cleanDeleted,
      usersCleared: updatedUsers.length === 0
    }));
    try {
      localStorage.setItem('apex_deleted_user_emails', JSON.stringify(cleanDeleted));
      localStorage.setItem('apex_registered_users', JSON.stringify(updatedUsers));
      window.dispatchEvent(new Event('apex_users_updated'));
    } catch {}
    broadcastSync({
      users: updatedUsers,
      deletedUserEmails: cleanDeleted,
      usersCleared: updatedUsers.length === 0
    });
    if (toastMsg) showToast(toastMsg, toastType);

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        users: updatedUsers,
        deletedUserEmails: cleanDeleted,
        usersCleared: updatedUsers.length === 0
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleAddUser = async (userData: { name: string; email: string; password: string }) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanName = userData.name.trim() || cleanEmail.split('@')[0];
    const cleanPassword = userData.password.trim() || '123456';
    if (!cleanEmail) return;

    let deletedList: string[] = [];
    try {
      const deletedRaw = localStorage.getItem('apex_deleted_user_emails');
      if (deletedRaw) {
        deletedList = JSON.parse(deletedRaw);
      }
      const permRaw = localStorage.getItem('apex_permanently_deleted_users');
      if (permRaw) {
        const permList: string[] = JSON.parse(permRaw);
        localStorage.setItem(
          'apex_permanently_deleted_users',
          JSON.stringify(permList.filter((e) => e.trim().toLowerCase() !== cleanEmail))
        );
      }
    } catch {}
    deletedList = deletedList.filter((e) => e.trim().toLowerCase() !== cleanEmail);

    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const newUserRecord = {
      id: `u_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: (cleanEmail.includes('founder') || cleanEmail.includes('admin') ? 'admin' : 'user') as 'admin' | 'user',
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === cleanEmail
            ? { ...u, name: cleanName, password: cleanPassword, blocked: false }
            : u
        )
      : [newUserRecord, ...currentUsers];

    await syncUsersEverywhere(
      updatedUsers,
      deletedList,
      exists ? `User "${cleanEmail}" unblocked & restored to Active Users!` : `User "${cleanEmail}" created & active!`,
      'success'
    );
  };

  const handleSendUserVerificationOtp = async (email: string, customOtp?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    const generatedOtp =
      customOtp && customOtp.trim().length >= 4
        ? customOtp.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();

    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const nowIso = new Date().toISOString();

    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === cleanEmail
            ? {
                ...u,
                verificationOtp: generatedOtp,
                verificationOtpSentAt: nowIso,
                verified: false
              }
            : u
        )
      : [
          {
            id: `u_${Date.now()}`,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            password: '123456',
            role: 'user' as const,
            verified: false,
            verificationOtp: generatedOtp,
            verificationOtpSentAt: nowIso,
            createdAt: nowIso,
            lastLoginAt: nowIso
          },
          ...currentUsers
        ];

    try {
      const currRaw = localStorage.getItem('apex_current_user');
      if (currRaw) {
        const curr = JSON.parse(currRaw);
        if ((curr?.email || '').trim().toLowerCase() === cleanEmail) {
          localStorage.setItem(
            'apex_current_user',
            JSON.stringify({
              ...curr,
              verificationOtp: generatedOtp,
              verificationOtpSentAt: nowIso,
              verified: false
            })
          );
        }
      }
    } catch {}

    const otpNotif: NotificationItem = {
      id: 'notif-uotp-' + Date.now(),
      type: 'info',
      icon: 'fa-user-shield',
      title: `Account Verification OTP: ${generatedOtp}`,
      desc: `Admin sent your 6-digit Account Verification OTP: ${generatedOtp}. Enter this code on the Verification Panel to unlock store access.`,
      time: Date.now(),
      active: true,
      sender: 'Admin',
      targetEmail: cleanEmail,
      otp: generatedOtp
    };

    const updatedNotifs = [otpNotif, ...(state.notifications || [])];
    setState((prev) => ({
      ...prev,
      users: updatedUsers,
      notifications: updatedNotifs
    }));

    try {
      localStorage.setItem('apex_registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem('apex_notifications', JSON.stringify(updatedNotifs));
      window.dispatchEvent(new Event('apex_users_updated'));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}

    broadcastSync({
      users: updatedUsers,
      notifications: updatedNotifs
    });

    showToast(`Account Verification OTP ${generatedOtp} sent to ${cleanEmail}!`, 'success');

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        users: updatedUsers,
        notifications: updatedNotifs,
        usersCleared: false
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleToggleUserVerified = async (email: string, verified: boolean) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    const nowIso = new Date().toISOString();
    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail);

    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === cleanEmail
            ? {
                ...u,
                verified,
                verifiedAt: verified ? nowIso : undefined
              }
            : u
        )
      : [
          {
            id: `u_${Date.now()}`,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            password: '123456',
            role: 'user' as const,
            verified,
            verifiedAt: verified ? nowIso : undefined,
            createdAt: nowIso,
            lastLoginAt: nowIso
          },
          ...currentUsers
        ];

    try {
      const currRaw = localStorage.getItem('apex_current_user');
      if (currRaw) {
        const curr = JSON.parse(currRaw);
        if ((curr?.email || '').trim().toLowerCase() === cleanEmail) {
          localStorage.setItem(
            'apex_current_user',
            JSON.stringify({
              ...curr,
              verified,
              verifiedAt: verified ? nowIso : undefined
            })
          );
        }
      }
    } catch {}

    let deletedList: string[] = [];
    try {
      const raw = localStorage.getItem('apex_deleted_user_emails');
      if (raw) deletedList = JSON.parse(raw);
    } catch {}

    await syncUsersEverywhere(
      updatedUsers,
      deletedList,
      verified ? `User "${cleanEmail}" marked as VERIFIED!` : `User "${cleanEmail}" set to Unverified (OTP required)!`,
      'success'
    );
  };

  // Block an active user (moves user to Blocked Users tab; does NOT delete them)
  const handleBlockUser = async (emailOrId: string) => {
    const targetKey = emailOrId.trim().toLowerCase();
    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const matchedUser = currentUsers.find(
      (u) =>
        String(u.id).toLowerCase() === targetKey ||
        (u.email || '').trim().toLowerCase() === targetKey
    );
    const emailToBlock = (matchedUser?.email || emailOrId).trim().toLowerCase();
    if (!emailToBlock) return;

    let deletedList: string[] = [];
    try {
      const deletedRaw = localStorage.getItem('apex_deleted_user_emails');
      deletedList = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedList.includes(emailToBlock)) {
        deletedList.push(emailToBlock);
      }
      const permRaw = localStorage.getItem('apex_permanently_deleted_users');
      if (permRaw) {
        const permList: string[] = JSON.parse(permRaw);
        localStorage.setItem(
          'apex_permanently_deleted_users',
          JSON.stringify(permList.filter((e) => e.trim().toLowerCase() !== emailToBlock))
        );
      }
      const currUserRaw = localStorage.getItem('apex_current_user');
      if (currUserRaw) {
        const currUser = JSON.parse(currUserRaw);
        if ((currUser?.email || '').trim().toLowerCase() === emailToBlock) {
          localStorage.removeItem('apex_current_user');
        }
      }
    } catch {}

    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === emailToBlock);
    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === emailToBlock
            ? { ...u, blocked: true }
            : u
        )
      : [
          {
            id: `u_${Date.now()}`,
            name: emailToBlock.split('@')[0],
            email: emailToBlock,
            password: '123456',
            role: 'user' as const,
            blocked: true,
            createdAt: new Date().toISOString()
          },
          ...currentUsers
        ];

    await syncUsersEverywhere(
      updatedUsers,
      deletedList,
      `User "${emailToBlock}" blocked! You can now manage or delete them in Blocked Users.`,
      'info'
    );
  };

  // Permanently delete a blocked user from Admin
  const handleDeleteBlockedUser = async (emailOrId: string) => {
    const targetKey = emailOrId.trim().toLowerCase();
    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const matchedUser = currentUsers.find(
      (u) =>
        String(u.id).toLowerCase() === targetKey ||
        (u.email || '').trim().toLowerCase() === targetKey
    );
    const emailToDelete = (matchedUser?.email || emailOrId).trim().toLowerCase();
    if (!emailToDelete) return;

    let deletedList: string[] = [];
    try {
      const deletedRaw = localStorage.getItem('apex_deleted_user_emails');
      deletedList = deletedRaw ? JSON.parse(deletedRaw) : [];
      deletedList = deletedList.filter((e) => e.trim().toLowerCase() !== emailToDelete);

      const permRaw = localStorage.getItem('apex_permanently_deleted_users');
      const permList: string[] = permRaw ? JSON.parse(permRaw) : [];
      if (!permList.includes(emailToDelete)) {
        permList.push(emailToDelete);
      }
      localStorage.setItem('apex_permanently_deleted_users', JSON.stringify(permList));

      const currUserRaw = localStorage.getItem('apex_current_user');
      if (currUserRaw) {
        const currUser = JSON.parse(currUserRaw);
        if ((currUser?.email || '').trim().toLowerCase() === emailToDelete) {
          localStorage.removeItem('apex_current_user');
        }
      }
    } catch {}

    const updatedUsers = currentUsers.filter(
      (u) =>
        String(u.id).toLowerCase() !== targetKey &&
        (u.email || '').trim().toLowerCase() !== emailToDelete
    );

    await syncUsersEverywhere(
      updatedUsers,
      deletedList,
      `Blocked user "${emailToDelete}" permanently deleted from Admin!`,
      'info'
    );
  };

  // Delete all blocked users permanently from Admin
  const handleDeleteAllBlockedUsers = async () => {
    const currentUsers = Array.isArray(state.users) ? state.users : [];
    let blockedSet = new Set<string>(
      (state.deletedUserEmails || []).map((e) => e.trim().toLowerCase()).filter(Boolean)
    );
    try {
      const deletedRaw = localStorage.getItem('apex_deleted_user_emails');
      if (deletedRaw) {
        const parsed: string[] = JSON.parse(deletedRaw);
        parsed.forEach((e) => {
          if (e) blockedSet.add(e.trim().toLowerCase());
        });
      }
    } catch {}
    currentUsers.forEach((u) => {
      if (u.blocked && u.email) {
        blockedSet.add(u.email.trim().toLowerCase());
      }
    });

    try {
      const permRaw = localStorage.getItem('apex_permanently_deleted_users');
      const permList: string[] = permRaw ? JSON.parse(permRaw) : [];
      const mergedPerm = Array.from(new Set([...permList, ...Array.from(blockedSet)]));
      localStorage.setItem('apex_permanently_deleted_users', JSON.stringify(mergedPerm));
    } catch {}

    const remainingActiveUsers = currentUsers.filter(
      (u) => !u.blocked && !blockedSet.has((u.email || '').trim().toLowerCase())
    );

    await syncUsersEverywhere(
      remainingActiveUsers,
      [],
      'All blocked users permanently deleted from Admin!',
      'info'
    );
  };

  // Block all active users (moves all active users to Blocked Users)
  const handleClearAllUsers = async () => {
    let deletedList: string[] = [];
    const currentUsers = Array.isArray(state.users) ? state.users : [];
    try {
      const existingRaw = localStorage.getItem('apex_deleted_user_emails');
      const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
      const allEmails = [
        ...existing,
        ...currentUsers.map((u) => (u.email || '').trim().toLowerCase()),
        ...(state.orders || []).map((o) => (o.email || '').trim().toLowerCase())
      ].filter(Boolean);
      deletedList = Array.from(new Set(allEmails));
      localStorage.removeItem('apex_current_user');
    } catch {}
    const updatedUsers = currentUsers.map((u) => ({ ...u, blocked: true }));
    await syncUsersEverywhere(updatedUsers, deletedList, 'All active users moved to Blocked Users!', 'info');
  };

  const handleSendUserOtp = async (email: string, customOtp?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    const generatedOtp =
      customOtp && customOtp.trim().length >= 4
        ? customOtp.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();
    const nowIso = new Date().toISOString();

    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === cleanEmail
            ? {
                ...u,
                verificationOtp: generatedOtp,
                verificationOtpSentAt: nowIso,
                verified: false
              }
            : u
        )
      : [
          {
            id: `u_${Date.now()}`,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            password: '',
            role: 'user' as const,
            verified: false,
            verificationOtp: generatedOtp,
            verificationOtpSentAt: nowIso,
            createdAt: nowIso
          },
          ...currentUsers
        ];

    const otpNotif: NotificationItem = {
      id: 'notif-uotp-' + Date.now(),
      type: 'info',
      icon: 'fa-user-shield',
      title: `Account Verification OTP: ${generatedOtp}`,
      desc: `Admin sent your 6-digit Account Verification OTP: ${generatedOtp}. Enter this code on the Account Verification Panel to unlock store access.`,
      time: Date.now(),
      active: true,
      targetEmail: cleanEmail,
      otp: generatedOtp
    };
    const updatedNotifications = [otpNotif, ...(state.notifications || [])];

    setState((prev) => ({
      ...prev,
      users: updatedUsers,
      notifications: updatedNotifications,
      usersCleared: false
    }));

    try {
      localStorage.setItem('apex_registered_users', JSON.stringify(updatedUsers));
      localStorage.setItem('apex_notifications', JSON.stringify(updatedNotifications));
      const currRaw = localStorage.getItem('apex_current_user');
      if (currRaw) {
        const curr = JSON.parse(currRaw);
        if ((curr?.email || '').trim().toLowerCase() === cleanEmail) {
          localStorage.setItem(
            'apex_current_user',
            JSON.stringify({
              ...curr,
              verificationOtp: generatedOtp,
              verificationOtpSentAt: nowIso,
              verified: false
            })
          );
        }
      }
      window.dispatchEvent(new Event('apex_users_updated'));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}

    broadcastSync({
      users: updatedUsers,
      notifications: updatedNotifications,
      usersCleared: false
    });

    showToast(`Account Verification OTP (${generatedOtp}) sent to ${cleanEmail}!`, 'success');

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        users: updatedUsers,
        notifications: updatedNotifications,
        usersCleared: false
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleVerifyUserDirectly = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;
    const nowIso = new Date().toISOString();

    const currentUsers = Array.isArray(state.users) ? state.users : [];
    const exists = currentUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const updatedUsers = exists
      ? currentUsers.map((u) =>
          (u.email || '').trim().toLowerCase() === cleanEmail
            ? { ...u, verified: true, verifiedAt: nowIso }
            : u
        )
      : [
          {
            id: `u_${Date.now()}`,
            name: cleanEmail.split('@')[0],
            email: cleanEmail,
            password: '',
            role: 'user' as const,
            verified: true,
            verifiedAt: nowIso,
            createdAt: nowIso
          },
          ...currentUsers
        ];

    setState((prev) => ({
      ...prev,
      users: updatedUsers,
      usersCleared: false
    }));

    try {
      localStorage.setItem('apex_registered_users', JSON.stringify(updatedUsers));
      const currRaw = localStorage.getItem('apex_current_user');
      if (currRaw) {
        const curr = JSON.parse(currRaw);
        if ((curr?.email || '').trim().toLowerCase() === cleanEmail) {
          localStorage.setItem(
            'apex_current_user',
            JSON.stringify({ ...curr, verified: true, verifiedAt: nowIso })
          );
        }
      }
      window.dispatchEvent(new Event('apex_users_updated'));
    } catch {}

    broadcastSync({
      users: updatedUsers,
      usersCleared: false
    });

    showToast(`User "${cleanEmail}" is now Verified & unlocked!`, 'success');

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        users: updatedUsers,
        usersCleared: false
      });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Notifications Actions
  const handleSendNotification = async (notifData: Omit<NotificationItem, 'id' | 'time'>) => {
    const cleanTarget = notifData.targetEmail ? notifData.targetEmail.trim().toLowerCase() : undefined;
    const newNotif: NotificationItem = {
      ...notifData,
      targetEmail: cleanTarget || undefined,
      id: 'notif-' + Date.now(),
      time: Date.now()
    };
    const updated = [newNotif, ...state.notifications];
    setState((prev) => ({ ...prev, notifications: updated }));
    try {
      localStorage.setItem('apex_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}
    broadcastSync({ notifications: updated });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: updated });
      setSyncStatus('synced');
      showToast(
        cleanTarget
          ? `Private notification sent exclusively to ${cleanTarget}!`
          : 'Broadcast notification sent to all customers!',
        'success'
      );
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const updated = state.notifications.filter((n) => n.id !== id);
    setState((prev) => ({ ...prev, notifications: updated }));
    try {
      localStorage.setItem('apex_notifications', JSON.stringify(updated));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}
    broadcastSync({ notifications: updated });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: updated });
      setSyncStatus('synced');
      showToast('Notification deleted', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleClearAllNotifications = async () => {
    setState((prev) => ({ ...prev, notifications: [] }));
    try {
      localStorage.setItem('apex_notifications', JSON.stringify([]));
      window.dispatchEvent(new Event('apex_notifications_updated'));
    } catch {}
    broadcastSync({ notifications: [] });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: [] });
      setSyncStatus('synced');
      showToast('All notifications cleared', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Receipt Settings Actions
  const handleSaveTranscript = async (settings: TranscriptSettings) => {
    setState((prev) => ({ ...prev, transcriptSettings: settings }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ transcriptSettings: settings });
      setSyncStatus('synced');
      showToast('Transcript settings saved to Firebase!', 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleResetTranscript = async () => {
    setState((prev) => ({ ...prev, transcriptSettings: INITIAL_TRANSCRIPT_SETTINGS }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ transcriptSettings: INITIAL_TRANSCRIPT_SETTINGS });
      setSyncStatus('synced');
      showToast('Transcript settings reset to defaults', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Launch Config Actions
  const handleUpdateLaunchConfigPartial = async (partial: Partial<LaunchConfig>) => {
    const nextConfig: LaunchConfig = {
      ...state.launchConfig,
      ...partial
    };
    if (nextConfig.isRunning && !partial.endTime) {
      nextConfig.endTime = Date.now() + (nextConfig.secondsLeft || 300) * 1000;
    } else if (!nextConfig.isRunning) {
      nextConfig.endTime = null;
    }

    setState((prev) => ({ ...prev, launchConfig: nextConfig }));
    try {
      localStorage.setItem('apex_launch', JSON.stringify(nextConfig));
      window.dispatchEvent(new Event('apex_launch_updated'));
    } catch {}

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ launchConfig: nextConfig });
      setSyncStatus('synced');
      showToast('Launch countdown timer updated live!', 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeletePoolProduct = async (index: number) => {
    const updatedPool = state.launchPool.filter((_, i) => i !== index);
    setState((prev) => ({
      ...prev,
      launchPool: updatedPool,
      nextLaunchProductId: updatedPool.length > 0 ? updatedPool[0].id : null
    }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        launchPool: updatedPool,
        nextLaunchProductId: updatedPool.length > 0 ? updatedPool[0].id : null
      });
      setSyncStatus('synced');
      showToast('Item removed from Launch Pool', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleMovePoolToNext = async (index: number) => {
    if (index === 0 || index >= state.launchPool.length) return;
    const item = state.launchPool[index];
    const remaining = state.launchPool.filter((_, i) => i !== index);
    const updatedPool = [item, ...remaining];
    setState((prev) => ({
      ...prev,
      launchPool: updatedPool,
      nextLaunchProductId: item.id
    }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({
        launchPool: updatedPool,
        nextLaunchProductId: item.id
      });
      setSyncStatus('synced');
      showToast(`"${item.name}" moved to next drop position!`, 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleSelectNextLaunchProduct = async (productId: string | number) => {
    setState((prev) => ({ ...prev, nextLaunchProductId: productId }));
    setPoolPickerModalOpen(false);
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ nextLaunchProductId: productId });
      setSyncStatus('synced');
      showToast('Next launch product selected');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Layout Actions
  const handleSaveGlobalLayout = async (layout: ProductLayoutType) => {
    setState((prev) => ({ ...prev, globalLayout: layout }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ globalLayout: layout });
      setSyncStatus('synced');
      showToast(`Default layout changed to ${layout}!`);
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleSaveSectionLayout = async (secId: number, layout: ProductLayoutType | '') => {
    const updated = state.sections.map((s) => (s.id === secId ? { ...s, layout } : s));
    setState((prev) => ({ ...prev, sections: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ sections: updated });
      setSyncStatus('synced');
      showToast('Section layout override updated');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Payments Actions
  const handleSavePaymentMethods = async (
    methods: StoreState['paymentMethods'],
    custom: CustomPaymentMethod[]
  ) => {
    setState((prev) => ({ ...prev, paymentMethods: methods, customPaymentMethods: custom }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ paymentMethods: methods, customPaymentMethods: custom });
      setSyncStatus('synced');
      showToast('Payment methods saved to Firebase!');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleDeleteCustomMethod = async (index: number) => {
    const updated = state.customPaymentMethods.filter((_, i) => i !== index);
    setState((prev) => ({ ...prev, customPaymentMethods: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ customPaymentMethods: updated });
      setSyncStatus('synced');
      showToast('Payment method deleted', 'info');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleToggleCustomMethod = async (index: number, active: boolean) => {
    const updated = state.customPaymentMethods.map((m, i) => (i === index ? { ...m, active } : m));
    setState((prev) => ({ ...prev, customPaymentMethods: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ customPaymentMethods: updated });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('synced');
    }
  };

  const handleSaveCustomMethodModal = (data: Partial<CustomPaymentMethod>, editIndex: number | null) => {
    let updatedCustom: CustomPaymentMethod[];
    if (editIndex !== null && editIndex >= 0) {
      updatedCustom = [...state.customPaymentMethods];
      updatedCustom[editIndex] = {
        ...updatedCustom[editIndex],
        ...data,
        id: updatedCustom[editIndex].id ?? Date.now()
      } as CustomPaymentMethod;
    } else {
      const newMethod: CustomPaymentMethod = {
        id: Date.now(),
        name: data.name || 'New Payment Method',
        account: data.account || '',
        accountName: data.accountName || '',
        icon: data.icon || 'fa-credit-card',
        color: data.color || '#6366f1',
        desc: data.desc || '',
        active: data.active !== false
      };
      updatedCustom = [...state.customPaymentMethods, newMethod];
    }
    handleSavePaymentMethods(state.paymentMethods, updatedCustom);
    setPaymentMethodModalOpen(false);
  };

  const handleSaveAddToPoolModal = (data: Partial<LaunchPoolProduct>, editIndex: number | null) => {
    let updatedPool: LaunchPoolProduct[];
    if (editIndex !== null && editIndex >= 0) {
      updatedPool = [...state.launchPool];
      updatedPool[editIndex] = {
        ...updatedPool[editIndex],
        ...data,
        id: updatedPool[editIndex].id ?? 'pool-' + Date.now(),
        stock: Number(data.stock) || updatedPool[editIndex].stock || 10,
        price: Number(data.price) || updatedPool[editIndex].price || 0
      } as LaunchPoolProduct;
    } else {
      const newItem: LaunchPoolProduct = {
        id: 'pool-' + Date.now(),
        name: data.name || 'New Drop Item',
        category: data.category || 'Audio',
        price: Number(data.price) || 0,
        oldPrice: data.oldPrice ? Number(data.oldPrice) : null,
        rating: 5.0,
        reviews: 1,
        badge: data.badge || 'DROP',
        stock: Number(data.stock) || 10,
        image: data.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        description: data.description || ''
      };
      updatedPool = [...state.launchPool, newItem];
    }

    setState((prev) => ({
      ...prev,
      launchPool: updatedPool,
      nextLaunchProductId: updatedPool.length > 0 ? updatedPool[0].id : null
    }));
    setAddToPoolModalOpen(false);

    try {
      setSyncStatus('saving');
      updateFirebasePartial({
        launchPool: updatedPool,
        nextLaunchProductId: updatedPool.length > 0 ? updatedPool[0].id : null
      });
      setSyncStatus('synced');
      showToast('Launch pool updated!', 'success');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Store Settings Actions
  const handleSaveStoreSettings = async (settings: StoreSettings) => {
    setState((prev) => ({ ...prev, storeSettings: settings }));
    try {
      localStorage.setItem('apex_store_settings', JSON.stringify(settings));
      window.dispatchEvent(new Event('apex_store_settings_updated'));
    } catch {}
    broadcastSync({ storeSettings: settings });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ storeSettings: settings });
      setSyncStatus('synced');
      showToast('Founder Profile, Social Links & Store Settings synced live!');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Announcements Actions
  const handleSaveAnnouncements = async (settings: AnnouncementSettings) => {
    setState((prev) => ({ ...prev, announcementSettings: settings }));
    broadcastSync({ announcementSettings: settings });
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ announcementSettings: settings });
      setSyncStatus('synced');
      showToast('Announcements updated in Firebase!');
    } catch {
      setSyncStatus('synced');
    }
  };

  // Title & Icon for Tab
  const getTabHeader = (tab: TabKey) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Admin Overview', icon: 'fa-chart-pie' };
      case 'features':
        return { title: 'Feature Control Center', icon: 'fa-sliders' };
      case 'products':
        return { title: 'Product Catalog Management', icon: 'fa-box' };
      case 'heroimages':
        return { title: 'Hero Banners & Gallery Showcase', icon: 'fa-images' };
      case 'categories':
        return { title: 'Homepage Sections & Layouts', icon: 'fa-layer-group' };
      case 'promos':
        return { title: 'Promotions & Coupon Discounts', icon: 'fa-ticket' };
      case 'orders':
        return { title: 'Customer Orders & Verification', icon: 'fa-receipt' };
      case 'users':
        return { title: 'User Accounts & Login Control', icon: 'fa-user-shield' };
      case 'notifications':
        return { title: 'Broadcast Alerts & Notifications', icon: 'fa-bell' };
      case 'transcript':
        return { title: 'Receipt & Transcript Customizer', icon: 'fa-file-invoice' };
      case 'launchpool':
        return { title: 'Live Launch Countdown Drop', icon: 'fa-stopwatch' };
      case 'layout':
        return { title: 'Storefront Layout Customizer', icon: 'fa-table-cells-large' };
      case 'payments':
        return { title: 'Payment Gateways & Accounts', icon: 'fa-wallet' };
      case 'store':
        return { title: 'Store Profile & Contact Settings', icon: 'fa-gear' };
      case 'announcement':
        return { title: 'Top Marquee & Special Offer', icon: 'fa-bullhorn' };
      default:
        return { title: 'ApexStore Admin', icon: 'fa-sliders' };
    }
  };

  const headerMeta = getTabHeader(currentTab);

  return (
    <div className={`min-h-screen admin-dark-theme admin-theme-${adminTheme} bg-[#0a0a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]`}>
      {/* Toast notifications */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-admin flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold pointer-events-auto ${
              t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-500'
                : t.type === 'info'
                ? 'bg-purple-950/95 text-white border-purple-500/60'
                : 'bg-emerald-900/90 text-white border-emerald-500'
            }`}
          >
            <i
              className={`fa-solid ${
                t.type === 'error'
                  ? 'fa-circle-xmark text-rose-400'
                  : t.type === 'info'
                  ? 'fa-circle-info text-purple-400'
                  : 'fa-circle-check text-emerald-400'
              }`}
            ></i>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Admin Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        counts={{
          products: state.products.length,
          sections: state.sections.length,
          promos: state.promos.length,
          orders: state.orders.length,
          users: (state.users || []).length,
          notifications: state.notifications.length
        }}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <AdminHeader
          currentTab={currentTab}
          tabTitle={headerMeta.title}
          tabIcon={headerMeta.icon}
          syncStatus={syncStatus}
          currentTheme={adminTheme}
          onSelectTheme={handleSelectTheme}
          onForceSync={handleForceSync}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onSwitchToStorefront={onSwitchToStorefront || (() => setStorePreviewModalOpen(true))}
          onShowToast={showToast}
          featureToggles={featureToggles}
          onUpdateToggle={handleUpdateFeatureToggle}
          onOpenFeaturesTab={() => setCurrentTab('features')}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardTab
              state={state}
              onNavigate={setCurrentTab}
              onOpenProductModal={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onViewOrder={(order) => {
                setSelectedOrder(order);
                setOrderDetailOpen(true);
              }}
            />
          )}

          {currentTab === 'features' && (
            <FeaturesTab
              featureToggles={featureToggles}
              onUpdateToggle={handleUpdateFeatureToggle}
              onEnableAll={handleEnableAllFeatures}
              onDisableAll={handleDisableAllFeatures}
            />
          )}

          {currentTab === 'products' && (
            <ProductsTab
              products={state.products}
              onAddProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onTogglePublic={handleToggleProductPublic}
            />
          )}

          {currentTab === 'heroimages' && (
            <HeroImagesTab
              bannerImage={state.bannerImage ?? null}
              gallery={state.gallery}
              galleryEnabled={state.galleryEnabled}
              products={state.products}
              onSaveBanner={handleSaveBanner}
              onClearBanner={() => handleSaveBanner('')}
              onToggleGallery={handleToggleGallery}
              onAddGalleryImage={(url) => handleUpdateGallery([...state.gallery, url])}
              onRemoveGalleryImage={(idx) => handleUpdateGallery(state.gallery.filter((_, i) => i !== idx))}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setProductModalOpen(true);
              }}
            />
          )}

          {currentTab === 'categories' && (
            <SectionsTab
              sections={state.sections}
              categories={Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES}
              products={state.products}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategoryImage={handleDeleteCategoryImage}
              onDeleteCategory={handleDeleteCategory}
              onResetCategories={handleResetCategories}
              onAddSection={() => {
                setEditingSection(null);
                setSectionModalOpen(true);
              }}
              onEditSection={(sec) => {
                setEditingSection(sec);
                setSectionModalOpen(true);
              }}
              onDeleteSection={handleDeleteSection}
              onToggleActive={(id) => handleToggleSectionActive(id)}
              onReorderSections={handleReorderSections}
              onResetSections={handleResetSections}
            />
          )}

          {currentTab === 'promos' && (
            <PromosTab
              promos={state.promos}
              onAddPromo={() => {
                setEditingPromo(null);
                setEditingPromoIndex(null);
                setPromoModalOpen(true);
              }}
              onEditPromo={(promo, index) => {
                setEditingPromo(promo);
                setEditingPromoIndex(index);
                setPromoModalOpen(true);
              }}
              onDeletePromo={handleDeletePromo}
              onToggleActive={(index) => handleTogglePromo(index)}
            />
          )}

          {(currentTab === 'orders' || currentTab === 'users') && (
            <OrdersTab
              orders={state.orders}
              users={state.users || []}
              deletedUserEmails={state.deletedUserEmails || []}
              mode={currentTab === 'users' ? 'users' : 'orders'}
              onViewOrder={(order) => {
                setSelectedOrder(order);
                setOrderDetailOpen(true);
              }}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onClearAllOrders={handleClearAllOrders}
              onAddUser={handleAddUser}
              onBlockUser={handleBlockUser}
              onDeleteUser={handleDeleteBlockedUser}
              onDeleteAllBlockedUsers={handleDeleteAllBlockedUsers}
              onClearAllUsers={handleClearAllUsers}
              onSendUserOtp={handleSendUserVerificationOtp}
              onToggleUserVerified={handleToggleUserVerified}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsTab
              notifications={state.notifications}
              users={state.users || []}
              orders={state.orders || []}
              onSendNotification={handleSendNotification}
              onDeleteNotification={handleDeleteNotification}
              onClearAllNotifications={handleClearAllNotifications}
            />
          )}

          {currentTab === 'transcript' && (
            <ReceiptTab
              settings={state.transcriptSettings}
              onSaveSettings={handleSaveTranscript}
              onResetSettings={handleResetTranscript}
            />
          )}

          {currentTab === 'launchpool' && (
            <LaunchControlTab
              config={state.launchConfig}
              pool={state.launchPool}
              nextProductId={state.nextLaunchProductId}
              onUpdateConfig={handleUpdateLaunchConfigPartial}
              onPickNextProduct={() => setPoolPickerModalOpen(true)}
              onOpenAddToPool={() => {
                setEditingPoolProduct(null);
                setEditingPoolIndex(null);
                setAddToPoolModalOpen(true);
              }}
              onEditPoolProduct={(item, idx) => {
                setEditingPoolProduct(item);
                setEditingPoolIndex(idx);
                setAddToPoolModalOpen(true);
              }}
              onDeletePoolProduct={handleDeletePoolProduct}
              onMovePoolProductToNext={handleMovePoolToNext}
              onDropNow={handleAutoLaunchDrop}
            />
          )}

          {currentTab === 'layout' && (
            <LayoutTab
              globalLayout={state.globalLayout}
              sections={state.sections}
              onSelectGlobalLayout={handleSaveGlobalLayout}
              onSaveGlobalLayout={() => handleSaveGlobalLayout(state.globalLayout)}
              onUpdateSectionLayout={handleSaveSectionLayout}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsTab
              paymentMethods={state.paymentMethods}
              customPaymentMethods={state.customPaymentMethods}
              onSavePaymentMethods={(methods) => handleSavePaymentMethods(methods, state.customPaymentMethods)}
              onOpenCustomModal={() => {
                setEditingPaymentMethod(null);
                setEditingPaymentIndex(null);
                setPaymentMethodModalOpen(true);
              }}
              onEditCustomMethod={(method, idx) => {
                setEditingPaymentMethod(method);
                setEditingPaymentIndex(idx);
                setPaymentMethodModalOpen(true);
              }}
              onDeleteCustomMethod={handleDeleteCustomMethod}
              onToggleCustomMethod={handleToggleCustomMethod}
            />
          )}

          {currentTab === 'store' && (
            <StoreSettingsTab
              settings={
                state.storeSettings ?? {
                  name: 'ApexStore',
                  owner: 'Anees Abid',
                  email: 'anees@apexstore.com',
                  phone: '+92 300 1234567',
                  city: 'Azad Kashmir',
                  whatsapp: 'https://whatsapp.com/channel/0029VbApexStore'
                }
              }
              onSaveSettings={handleSaveStoreSettings}
            />
          )}

          {currentTab === 'announcement' && (
            <AnnouncementsTab
              settings={
                state.announcementSettings ?? {
                  offerText: 'Get 20% OFF',
                  offerCode: 'PREMIUM20',
                  offerDiscount: '20',
                  marqueeShipping: 'Free express shipping on all orders over Rs. 5,000!',
                  marqueeNewArrivals: 'New cyber drop collection every Friday at 8:00 PM PST',
                  marqueeReviews: 'Rated 4.9/5 by 12,000+ satisfied tech customers across Pakistan'
                }
              }
              onSaveSettings={handleSaveAnnouncements}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <PromoModal
        isOpen={promoModalOpen}
        promo={editingPromo}
        editIndex={editingPromoIndex}
        onClose={() => {
          setPromoModalOpen(false);
          setEditingPromo(null);
          setEditingPromoIndex(null);
        }}
        onSave={handleSavePromo}
      />

      <SectionModal
        isOpen={sectionModalOpen}
        onClose={() => {
          setSectionModalOpen(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSave={handleSaveSection}
      />

      <OrderDetailModal
        isOpen={orderDetailOpen}
        order={selectedOrder}
        userPassword={
          selectedOrder?.userPassword ||
          (state.users || []).find(
            (u) => (u.email || '').trim().toLowerCase() === (selectedOrder?.email || '').trim().toLowerCase()
          )?.password
        }
        onClose={() => {
          setOrderDetailOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={(status, customOtp, deliveryInfo) => {
          if (selectedOrder) {
            handleUpdateOrderStatus(String(selectedOrder.id), status, customOtp, deliveryInfo);
          }
        }}
        onDeleteOrder={(orderId) => {
          handleDeleteOrder(orderId);
        }}
      />

      <PaymentMethodModal
        isOpen={paymentMethodModalOpen}
        paymentMethod={editingPaymentMethod}
        editIndex={editingPaymentIndex}
        onClose={() => {
          setPaymentMethodModalOpen(false);
          setEditingPaymentMethod(null);
          setEditingPaymentIndex(null);
        }}
        onSave={handleSaveCustomMethodModal}
      />

      <AddToPoolModal
        isOpen={addToPoolModalOpen}
        product={editingPoolProduct}
        editIndex={editingPoolIndex}
        onClose={() => {
          setAddToPoolModalOpen(false);
          setEditingPoolProduct(null);
          setEditingPoolIndex(null);
        }}
        onSave={handleSaveAddToPoolModal}
      />

      <PoolPickerModal
        isOpen={poolPickerModalOpen}
        pool={state.launchPool}
        selectedId={state.nextLaunchProductId}
        onClose={() => setPoolPickerModalOpen(false)}
        onSelect={handleSelectNextLaunchProduct}
      />

      <StorePreviewModal
        isOpen={storePreviewModalOpen}
        onClose={() => setStorePreviewModalOpen(false)}
        state={state}
      />
    </div>
  );
};

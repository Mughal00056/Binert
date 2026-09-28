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
  AnnouncementSettings
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

  // Admin Theme state (defaults to cyber - Bittp Dark Neon)
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    try {
      const saved = localStorage.getItem('apex_admin_theme') as AdminTheme;
      if (saved && ADMIN_THEMES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'cyber';
  });

  const handleSelectTheme = (theme: AdminTheme) => {
    setAdminTheme(theme);
    try {
      localStorage.setItem('apex_admin_theme', theme);
    } catch {
      // ignore
    }
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

  // 1. Initial Load & Firebase Realtime Subscription
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setSyncStatus('saving');
        const initialData = await fetchStoreFromFirebase();
        if (isMounted) {
          setState(initialData);
          if (initialData.featureToggles) {
            setFeatureToggles(initialData.featureToggles);
            try {
              localStorage.setItem('apex_feature_toggles', JSON.stringify(initialData.featureToggles));
            } catch {
              // ignore
            }
          }
          setSyncStatus('synced');
        }
      } catch (err) {
        console.error('Initial Firebase load error:', err);
        if (isMounted) setSyncStatus('offline');
      }
    }

    init();

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
            setFeatureToggles(remoteState.featureToggles);
            try {
              localStorage.setItem('apex_feature_toggles', JSON.stringify(remoteState.featureToggles));
            } catch {
              // ignore
            }
          }
          setSyncStatus('synced');
        }
      },
      (err) => {
        console.error('Firebase subscription error:', err);
        if (isMounted) setSyncStatus('offline');
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Update Feature Toggle Handler with Firebase Sync
  const handleUpdateFeatureToggle = async (key: keyof FeatureToggles, enabled: boolean) => {
    const updated = {
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
    } catch (err) {
      console.error('Error updating feature toggle in Firebase:', err);
      setSyncStatus('error');
    }
  };

  const handleEnableAllFeatures = async () => {
    const allEnabled = Object.keys(featureToggles).reduce((acc, k) => {
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
      setSyncStatus('error');
    }
  };

  const handleDisableAllFeatures = async () => {
    const allDisabled = Object.keys(featureToggles).reduce((acc, k) => {
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      console.error(err);
      setSyncStatus('error');
      showToast('Sync failed. Please check connection.', 'error');
    }
  };

  // Product Actions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    let updatedProducts: Product[];
    if (editingProduct) {
      updatedProducts = state.products.map((p) =>
        p.id === editingProduct.id ? ({ ...p, ...productData } as Product) : p
      );
      showToast(`Product "${productData.name}" updated!`);
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
      showToast(`Product "${newProd.name}" created!`);
    }

    setState((prev) => ({ ...prev, products: updatedProducts }));
    setProductModalOpen(false);
    setEditingProduct(null);

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ products: updatedProducts });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    const updated = state.products.filter((p) => p.id !== id);
    setState((prev) => ({ ...prev, products: updated }));
    try {
      localStorage.setItem('apex_products', JSON.stringify(updated));
    } catch {}
    showToast('Product deleted', 'info');

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ products: updated });
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleToggleProductPublic = async (id: number) => {
    const updated = state.products.map((p) => (p.id === id ? { ...p, public: !p.public } : p));
    setState((prev) => ({ ...prev, products: updated }));

    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ products: updated });
      setSyncStatus('synced');
      showToast('Product visibility updated');
    } catch {
      setSyncStatus('error');
    }
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
    }
  };

  // Category Actions (Add Category, Add/Change/Delete Category Image, Delete Category)
  const syncCategoriesEverywhere = async (updatedCategories: CategoryItem[], toastMsg?: string) => {
    setState((prev) => ({ ...prev, categories: updatedCategories }));
    try {
      localStorage.setItem('apex_categories', JSON.stringify(updatedCategories));
      window.dispatchEvent(new Event('apex_categories_updated'));
    } catch {}
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ categories: updatedCategories });
      setSyncStatus('synced');
      if (toastMsg) showToast(toastMsg, 'success');
    } catch {
      setSyncStatus('error');
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
    const currentCats = Array.isArray(state.categories) ? state.categories : FALLBACK_CATEGORIES;
    const updated = currentCats.filter((c) => String(c.id) !== String(categoryId));
    await syncCategoriesEverywhere(updated, 'Category deleted!');
  };

  const handleResetCategories = async () => {
    await syncCategoriesEverywhere(FALLBACK_CATEGORIES, 'Categories reset to default!');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
    }
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, customOtp?: string) => {
    const generatedOtp =
      status === 'otp_sent'
        ? customOtp && customOtp.trim().length >= 4
          ? customOtp.trim()
          : Math.floor(100000 + Math.random() * 900000).toString()
        : undefined;

    const targetOrder = state.orders.find((o) => String(o.id) === String(orderId));
    const targetEmail = targetOrder?.email ? targetOrder.email.trim().toLowerCase() : undefined;

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
        entryNote = 'Admin marked your order as currently processing.';
      } else if (status === 'verified' || status === 'delivered') {
        entryTitle = 'Order Verified & Delivered';
        entryNote = 'Payment verified and order delivered by Admin.';
      } else if (status === 'rejected') {
        entryTitle = 'Order Rejected';
        entryNote = 'Merchant declined payment proof or transaction ID.';
      }

      return {
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
    });

    let updatedNotifications = state.notifications;
    if (status === 'otp_sent' && generatedOtp) {
      const otpNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'order',
        icon: 'fa-key',
        title: `Admin Approved Order #${String(orderId).slice(-6)}!`,
        desc: `Your confirmation OTP is: ${generatedOtp}. Enter OTP in My Orders to finalize checkout.`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId
      };
      updatedNotifications = [otpNotif, ...state.notifications];
    } else if (status === 'processing') {
      const procNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'order',
        icon: 'fa-gears',
        title: `Order #${String(orderId).slice(-6)} is Now Processing`,
        desc: `Admin is currently processing and preparing your order #${String(orderId).slice(-6)}.`,
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
        icon: 'fa-circle-check',
        title: `Order #${String(orderId).slice(-6)} Delivered! 🎉`,
        desc: `Your order #${String(orderId).slice(-6)} has been verified and delivered by Admin.`,
        time: Date.now(),
        active: true,
        targetEmail,
        orderId
      };
      updatedNotifications = [verNotif, ...state.notifications];
    } else if (status === 'rejected') {
      const rejNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        type: 'alert',
        icon: 'fa-circle-xmark',
        title: `Order #${String(orderId).slice(-6)} Rejected`,
        desc: `Your order #${String(orderId).slice(-6)} was rejected by Admin during payment review.`,
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
    } catch {}

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
      } else {
        showToast(`Order #${String(orderId).slice(-6)} marked as ${status.toUpperCase()}!`, 'success');
      }
    } catch {
      setSyncStatus('error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const updated = state.orders.filter((o) => String(o.id) !== String(orderId));
    setState((prev) => ({ ...prev, orders: updated }));
    try {
      localStorage.setItem('apex_orders', JSON.stringify(updated));
      window.dispatchEvent(new Event('apex_orders_updated'));
    } catch {}

    if (selectedOrder && String(selectedOrder.id) === String(orderId)) {
      setSelectedOrder(null);
      setOrderDetailOpen(false);
    }
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ orders: updated });
      setSyncStatus('synced');
      showToast(`Order #${String(orderId).slice(-6)} deleted permanently`, 'info');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleClearAllOrders = async () => {
    setState((prev) => ({ ...prev, orders: [] }));
    try {
      localStorage.setItem('apex_orders', JSON.stringify([]));
      window.dispatchEvent(new Event('apex_orders_updated'));
    } catch {}
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ orders: [] });
      setSyncStatus('synced');
      showToast('All orders cleared', 'info');
    } catch {
      setSyncStatus('error');
    }
  };

  // Notifications Actions
  const handleSendNotification = async (notifData: Omit<NotificationItem, 'id' | 'time'>) => {
    const newNotif: NotificationItem = {
      ...notifData,
      id: 'notif-' + Date.now(),
      time: Date.now()
    };
    const updated = [newNotif, ...state.notifications];
    setState((prev) => ({ ...prev, notifications: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: updated });
      setSyncStatus('synced');
      showToast('Notification sent to customers!', 'success');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    const updated = state.notifications.filter((n) => n.id !== id);
    setState((prev) => ({ ...prev, notifications: updated }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: updated });
      setSyncStatus('synced');
      showToast('Notification deleted', 'info');
    } catch {
      setSyncStatus('error');
    }
  };

  const handleClearAllNotifications = async () => {
    setState((prev) => ({ ...prev, notifications: [] }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ notifications: [] });
      setSyncStatus('synced');
      showToast('All notifications cleared', 'info');
    } catch {
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
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
      setSyncStatus('error');
    }
  };

  // Store Settings Actions
  const handleSaveStoreSettings = async (settings: StoreSettings) => {
    setState((prev) => ({ ...prev, storeSettings: settings }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ storeSettings: settings });
      setSyncStatus('synced');
      showToast('Store settings saved to Firebase!');
    } catch {
      setSyncStatus('error');
    }
  };

  // Announcements Actions
  const handleSaveAnnouncements = async (settings: AnnouncementSettings) => {
    setState((prev) => ({ ...prev, announcementSettings: settings }));
    try {
      setSyncStatus('saving');
      await updateFirebasePartial({ announcementSettings: settings });
      setSyncStatus('synced');
      showToast('Announcements updated in Firebase!');
    } catch {
      setSyncStatus('error');
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
    <div className={`min-h-screen admin-theme-${adminTheme} bg-[#0a0a0f] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]`}>
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
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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

          {currentTab === 'orders' && (
            <OrdersTab
              orders={state.orders}
              users={state.users || []}
              onViewOrder={(order) => {
                setSelectedOrder(order);
                setOrderDetailOpen(true);
              }}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onClearAllOrders={handleClearAllOrders}
            />
          )}

          {currentTab === 'notifications' && (
            <NotificationsTab
              notifications={state.notifications}
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
        onUpdateStatus={(status, customOtp) => {
          if (selectedOrder) {
            handleUpdateOrderStatus(String(selectedOrder.id), status, customOtp);
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

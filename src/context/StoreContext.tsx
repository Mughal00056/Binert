import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  CartItem,
  PromoCode,
  SectionConfig,
  CategoryItem,
  StoreInfo,
  AnnouncementSettings,
  StoreNotification,
  PaymentMethodsConfig,
  CustomPaymentMethod,
  Order,
  OrderStatus,
  LaunchConfig,
  ProductReview,
  UserProfile,
  FeatureToggles,
  DEFAULT_FEATURE_TOGGLES
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SECTIONS,
  INITIAL_PROMO_CODES,
  INITIAL_STORE_INFO,
  INITIAL_ANNOUNCEMENT,
  INITIAL_GALLERY_IMAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENT_CONFIG,
  INITIAL_LAUNCH_CONFIG,
  INITIAL_REVIEWS
} from '../data/mockData';
import { formatPKR } from '../utils/helpers';
import {
  fetchStoreFromFirebase,
  subscribeToFirebaseStore,
  updateFirebasePartial
} from '../lib/firebase';
import { INITIAL_TRANSCRIPT_SETTINGS, FALLBACK_CATEGORIES } from '../lib/constants';
import { TranscriptSettings, ProductLayoutType, StoreState } from '../types/store';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface FlyingParticle {
  id: string;
  x: number;
  y: number;
  image: string;
}

export interface RatingStats {
  average: number;
  count: number;
  breakdown: Record<number, number>;
}

interface StoreContextType {
  // Navigation & Views
  currentView: 'home' | 'all' | 'search' | 'promo' | 'contact' | 'about' | 'orders';
  setCurrentView: (view: 'home' | 'all' | 'search' | 'promo' | 'contact' | 'about' | 'orders') => void;
  openOrdersView: () => void;
  goHome: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  allViewTitle: string;
  allViewFilter: string;
  openSectionAllView: (filter: string, title: string) => void;

  // Catalog
  products: Product[];
  visibleProducts: Product[];
  sections: SectionConfig[];
  categories: CategoryItem[];
  promoCodes: PromoCode[];
  storeInfo: StoreInfo;
  announcement: AnnouncementSettings;
  bannerImage: string;
  galleryImages: string[];
  galleryEnabled: boolean;
  launchConfig: LaunchConfig;
  globalLayout: ProductLayoutType;
  transcriptSettings: TranscriptSettings;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchSuggestionsOpen: boolean;
  setSearchSuggestionsOpen: (open: boolean) => void;
  performSearch: (query: string) => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  appliedDiscount: number;
  discountAmount: number;
  cartTotal: number;
  addToCart: (productId: number, event?: React.MouseEvent) => void;
  updateCartQty: (productId: number, delta: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;

  // Modals & Drawers
  sideMenuOpen: boolean;
  setSideMenuOpen: (open: boolean) => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  notificationModalOpen: boolean;
  setNotificationModalOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  timerModalOpen: boolean;
  setTimerModalOpen: (open: boolean) => void;
  activeTimerOrderId: number | null;
  setActiveTimerOrderId: (id: number | null) => void;
  aiModalOpen: boolean;
  setAiModalOpen: (open: boolean) => void;
  receiptOrder: Order | null;
  setReceiptOrder: (order: Order | null) => void;
  reviewProduct: Product | null;
  setReviewProduct: (product: Product | null) => void;

  // Reviews System
  reviews: ProductReview[];
  addReview: (review: { productId: number; userName: string; rating: number; comment: string }) => void;
  getProductReviews: (productId: number) => ProductReview[];
  getProductRatingStats: (productId: number) => RatingStats;

  // Admin Panel
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  orders: Order[];
  updateOrderStatus: (orderId: number, status: OrderStatus, reason?: string) => void;
  deleteOrder: (orderId: number | string) => void;
  adminSendOtp: (orderId: number, customOtp?: string) => void;
  adminUpdateTracking: (orderId: number, status: OrderStatus, trackingNum?: string) => void;
  saveNewProduct: (prod: Product) => void;
  savePromoCode: (promo: PromoCode) => void;
  saveStoreInfo: (info: StoreInfo) => void;

  // Notifications
  notifications: StoreNotification[];
  readNotificationIds: string[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (
    title: string,
    desc: string,
    type?: 'info' | 'promo' | 'order' | 'alert',
    icon?: string,
    targetEmail?: string,
    orderId?: string | number
  ) => void;

  // Payment & Checkout
  paymentConfig: PaymentMethodsConfig;
  customPaymentMethods: CustomPaymentMethod[];
  currentOrder: Order | null;
  orderStatus: OrderStatus;
  approvalSecondsLeft: number;
  startCheckout: () => void;
  confirmPayment: (details: {
    method: string;
    email: string;
    password?: string;
    senderMobile: string;
    transactionId: string;
    proofUrl: string;
  }) => void;
  cancelPayment: () => void;
  manualApproveOrder: (orderId: number) => void;
  verifyOrderOtp: (orderId: number, enteredOtp: string) => { success: boolean; error?: string };

  // Authentication & User Profile
  currentUser: UserProfile | null;
  registeredUsers: UserProfile[];
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openSignIn: () => void;
  openSignUp: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  verifyUserAccountOtp: (enteredOtp: string) => { success: boolean; error?: string };
  adminSendUserVerificationOtp: (email: string, customOtp?: string) => string;
  logout: () => void;
  pendingCartProductId: number | null;
  setPendingCartProductId: (id: number | null) => void;

  // Toast & Flying Animation
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  flyingParticles: FlyingParticle[];

  // Feature Control Center
  featureToggles: FeatureToggles;
  updateFeatureToggle: (key: keyof FeatureToggles, enabled: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_CART = 'apex_cart';
const LOCAL_STORAGE_ORDERS = 'apex_orders';
const LOCAL_STORAGE_NOTIFS = 'apex_notifications';
const LOCAL_STORAGE_READ_NOTIFS = 'apex_read_notifs';
const LOCAL_STORAGE_REVIEWS = 'apex_product_reviews';
const LOCAL_STORAGE_PRODUCTS = 'apex_products_catalog';
const LOCAL_STORAGE_CURRENT_USER = 'apex_current_user';
const LOCAL_STORAGE_USERS = 'apex_registered_users';
const LOCAL_STORAGE_DELETED_USERS = 'apex_deleted_user_emails';

function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean === 'founderofapexstore@gmail.com' ||
    clean === 'aneesabid0012@gmail.com' ||
    clean === 'anees@apexstore.com' ||
    clean === 'admin@apexstore.com' ||
    clean.includes('founder') ||
    clean.includes('admin') ||
    clean.includes('aneesabid')
  );
}

function getDeletedEmailsSet(): Set<string> {
  try {
    const raw = localStorage.getItem('apex_deleted_user_emails');
    const list: string[] = raw ? JSON.parse(raw) : [];
    return new Set(list.map((e) => String(e).trim().toLowerCase()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function getDeletedOrderIdsSet(): Set<string> {
  try {
    const raw = localStorage.getItem('apex_deleted_order_ids');
    const list: string[] = raw ? JSON.parse(raw) : [];
    return new Set(list.map((id) => String(id).trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

function getDeletedProductIdsSet(): Set<number> {
  try {
    const raw = localStorage.getItem('apex_deleted_product_ids');
    const list: number[] = raw ? JSON.parse(raw) : [];
    return new Set(list.map((id) => Number(id)).filter((n) => !Number.isNaN(n)));
  } catch {
    return new Set();
  }
}

function getDeletedCategoryIdsSet(): Set<string> {
  try {
    const raw = localStorage.getItem('apex_deleted_category_ids');
    const list: string[] = raw ? JSON.parse(raw) : [];
    return new Set(list.map((id) => String(id).trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'all' | 'search' | 'promo' | 'contact' | 'about' | 'orders'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [allViewTitle, setAllViewTitle] = useState<string>('All Products');
  const [allViewFilter, setAllViewFilter] = useState<string>('all');

  // Products & Settings (Persisted with user review adjustments)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const deletedProds = getDeletedProductIdsSet();
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      const list: Product[] = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return list.filter((p) => p && !deletedProds.has(Number(p.id)));
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sections, setSections] = useState<SectionConfig[]>(INITIAL_SECTIONS);
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const deletedCats = getDeletedCategoryIdsSet();
      const saved = localStorage.getItem('apex_categories');
      const list: CategoryItem[] = saved ? JSON.parse(saved) : FALLBACK_CATEGORIES;
      return list.filter((c) => c && !deletedCats.has(String(c.id)));
    } catch {
      return FALLBACK_CATEGORIES;
    }
  });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const defaults: StoreInfo = {
      name: 'ApexStore',
      ...INITIAL_STORE_INFO,
      ownerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
      ownerRole: 'Founder & Chief Executive Officer',
      ownerBio: 'Curating flagship audio, next-gen wearables, and verified digital & physical tech gear across Pakistan with 100% authentic merchant guarantee.',
      instagram: 'https://instagram.com/apexstore.pk',
      tiktok: 'https://tiktok.com/@apexstore.pk',
      youtube: 'https://youtube.com/@apexstore',
      facebook: 'https://facebook.com/apexstore.pk',
      telegram: 'https://t.me/apexstore',
      twitter: 'https://x.com/apexstore',
      showOwnerPhoto: true,
      showOwnerName: true,
      showEmail: true,
      showPhone: true,
      showCity: true,
      showWhatsapp: true,
      showInstagram: true,
      showTiktok: true,
      showYoutube: true,
      showFacebook: true,
      showTelegram: true,
      showTwitter: true
    };
    try {
      const saved = localStorage.getItem('apex_store_settings');
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch {}
    return defaults;
  });
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(INITIAL_ANNOUNCEMENT);
  const [bannerImage, setBannerImage] = useState<string>('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>(INITIAL_GALLERY_IMAGES);
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>(() => {
    try {
      const saved = localStorage.getItem('apex_launch');
      if (saved) {
        const parsed = JSON.parse(saved);
        const total = Number(parsed.totalSeconds) > 0 ? Number(parsed.totalSeconds) : 300;
        let secs = parsed.secondsLeft !== undefined ? Number(parsed.secondsLeft) : total;
        if (parsed.isRunning && parsed.endTime && Number(parsed.endTime) > Date.now()) {
          secs = Math.max(0, Math.ceil((Number(parsed.endTime) - Date.now()) / 1000));
        }
        return {
          mode: parsed.mode === 'private' ? 'private' : 'public',
          isRunning: Boolean(parsed.isRunning) && secs > 0,
          secondsLeft: secs,
          totalSeconds: total,
          autoLaunch: parsed.autoLaunch !== false,
          endTime: parsed.endTime || null
        };
      }
      return INITIAL_LAUNCH_CONFIG;
    } catch {
      return INITIAL_LAUNCH_CONFIG;
    }
  });
  const [globalLayout, setGlobalLayout] = useState<ProductLayoutType>('horizontal');
  const [transcriptSettings, setTranscriptSettings] = useState<TranscriptSettings>(INITIAL_TRANSCRIPT_SETTINGS);
  const [paymentConfig, setPaymentConfig] = useState<PaymentMethodsConfig>(INITIAL_PAYMENT_CONFIG);
  const [customPaymentMethods, setCustomPaymentMethods] = useState<CustomPaymentMethod[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState<boolean>(false);

  // Cart State (Persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [pendingCartProductId, setPendingCartProductId] = useState<number | null>(null);

  // Orders State (Persisted, excluding deleted orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const deletedOrders = getDeletedOrderIdsSet();
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      const list: Order[] = saved ? JSON.parse(saved) : [];
      return list.filter((o) => o && !deletedOrders.has(String(o.id)));
    } catch {
      return [];
    }
  });

  // Reviews State (Cleared completely as requested)
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_REVIEWS);
      return [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [sideMenuOpen, setSideMenuOpen] = useState<boolean>(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [timerModalOpen, setTimerModalOpen] = useState<boolean>(false);
  const [activeTimerOrderId, setActiveTimerOrderId] = useState<number | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  // Feature Toggles State (Syncs with Firebase & localStorage)
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>(() => {
    try {
      const saved = localStorage.getItem('apex_feature_toggles');
      return saved ? { ...DEFAULT_FEATURE_TOGGLES, ...JSON.parse(saved) } : DEFAULT_FEATURE_TOGGLES;
    } catch {
      return DEFAULT_FEATURE_TOGGLES;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('apex_feature_toggles');
        if (saved) {
          setFeatureToggles({ ...DEFAULT_FEATURE_TOGGLES, ...JSON.parse(saved) });
        }
      } catch {}
    };
    const handleLaunchSync = () => {
      try {
        const saved = localStorage.getItem('apex_launch');
        if (saved) {
          const parsed = JSON.parse(saved);
          const total = Number(parsed.totalSeconds) > 0 ? Number(parsed.totalSeconds) : 300;
          let secs = parsed.secondsLeft !== undefined ? Number(parsed.secondsLeft) : total;
          if (parsed.isRunning && parsed.endTime && Number(parsed.endTime) > Date.now()) {
            secs = Math.max(0, Math.ceil((Number(parsed.endTime) - Date.now()) / 1000));
          }
          setLaunchConfig({
            mode: parsed.mode === 'private' ? 'private' : 'public',
            isRunning: Boolean(parsed.isRunning) && secs > 0,
            secondsLeft: secs,
            totalSeconds: total,
            autoLaunch: parsed.autoLaunch !== false,
            endTime: parsed.endTime || null
          });
        }
      } catch {}
    };
    const handleCategoriesSync = () => {
      try {
        const deletedCats = getDeletedCategoryIdsSet();
        const saved = localStorage.getItem('apex_categories');
        if (saved) {
          const parsed: CategoryItem[] = JSON.parse(saved);
          setCategories(parsed.filter((c) => c && !deletedCats.has(String(c.id))));
        }
      } catch {}
    };
    const handleOrdersSync = () => {
      try {
        const deletedOrders = getDeletedOrderIdsSet();
        const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
        if (saved) {
          const parsed: Order[] = JSON.parse(saved);
          const filtered = parsed.filter((o) => o && !deletedOrders.has(String(o.id)));
          setOrders((prev) => {
            const map = new Map<string, Order>();
            prev.forEach((po) => {
              if (po && !deletedOrders.has(String(po.id))) {
                map.set(String(po.id), po);
              }
            });
            let newlyDelivered: Order | null = null;
            filtered.forEach((fo) => {
              if (fo && !deletedOrders.has(String(fo.id))) {
                const existing = map.get(String(fo.id));
                const merged = {
                  ...(existing || {}),
                  ...fo,
                  id: Number.isNaN(Number(fo.id)) ? fo.id : Number(fo.id)
                } as Order;
                if (existing && existing.status !== 'delivered' && merged.status === 'delivered') {
                  newlyDelivered = merged;
                }
                map.set(String(fo.id), merged);
              }
            });
            if (newlyDelivered) {
              setReceiptOrder(newlyDelivered);
            }
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          const validMap = new Map(filtered.map((o) => [String(o.id), o]));
          setCurrentOrder((curr) => {
            if (!curr) return null;
            if (deletedOrders.has(String(curr.id))) {
              setTimerModalOpen(false);
              return null;
            }
            return validMap.get(String(curr.id)) || curr;
          });
          setReceiptOrder((curr) => {
            if (!curr) return null;
            if (deletedOrders.has(String(curr.id))) return null;
            return validMap.get(String(curr.id)) || curr;
          });
          setActiveTimerOrderId((currId) => {
            if (currId !== null && deletedOrders.has(String(currId))) {
              setTimerModalOpen(false);
              return null;
            }
            return currId;
          });
        }
      } catch {}
    };
    const handleNotificationsSync = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS);
        if (saved) {
          const parsed: StoreNotification[] = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        }
      } catch {}
    };
    const handleStoreSettingsSync = () => {
      try {
        const saved = localStorage.getItem('apex_store_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setStoreInfo((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    };
    const handleProductsSync = () => {
      try {
        const deletedProds = getDeletedProductIdsSet();
        const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
        if (saved) {
          const parsed: Product[] = JSON.parse(saved);
          setProducts(parsed.filter((p) => p && !deletedProds.has(Number(p.id))));
        }
      } catch {}
    };
    const handleUsersSync = () => {
      try {
        const deletedEmails = getDeletedEmailsSet();
        const saved = localStorage.getItem(LOCAL_STORAGE_USERS);
        const parsedUsers: UserProfile[] = saved ? JSON.parse(saved) : [];
        const activeUsers = parsedUsers.filter(
          (u) => u && u.email && !deletedEmails.has(u.email.trim().toLowerCase())
        );
        setRegisteredUsers(activeUsers);
        setCurrentUser((curr) => {
          if (!curr) return null;
          const currEmail = (curr.email || '').trim().toLowerCase();
          if (deletedEmails.has(currEmail)) {
            try {
              localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
            } catch {}
            return null;
          }
          const stillExists = activeUsers.find(
            (u) => (u.email || '').trim().toLowerCase() === currEmail
          );
          if (!stillExists) {
            return curr;
          }
          const updatedCurr: UserProfile = {
            ...curr,
            ...stillExists,
            verified: Boolean(stillExists.verified),
            verificationOtp: stillExists.verificationOtp ?? curr.verificationOtp,
            verificationOtpSentAt: stillExists.verificationOtpSentAt ?? curr.verificationOtpSentAt,
            verifiedAt: stillExists.verifiedAt ?? curr.verifiedAt
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(updatedCurr));
          } catch {}
          return updatedCurr;
        });
      } catch {}
    };

    const handleAllStorage = () => {
      handleStorageChange();
      handleLaunchSync();
      handleCategoriesSync();
      handleOrdersSync();
      handleProductsSync();
      handleUsersSync();
      handleNotificationsSync();
      handleStoreSettingsSync();
    };

    window.addEventListener('storage', handleAllStorage);
    window.addEventListener('apex_features_updated', handleStorageChange);
    window.addEventListener('apex_launch_updated', handleLaunchSync);
    window.addEventListener('apex_categories_updated', handleCategoriesSync);
    window.addEventListener('apex_orders_updated', handleOrdersSync);
    window.addEventListener('apex_products_updated', handleProductsSync);
    window.addEventListener('apex_users_updated', handleUsersSync);
    window.addEventListener('apex_notifications_updated', handleNotificationsSync);
    window.addEventListener('apex_store_settings_updated', handleStoreSettingsSync);
    return () => {
      window.removeEventListener('storage', handleAllStorage);
      window.removeEventListener('apex_features_updated', handleStorageChange);
      window.removeEventListener('apex_launch_updated', handleLaunchSync);
      window.removeEventListener('apex_categories_updated', handleCategoriesSync);
      window.removeEventListener('apex_orders_updated', handleOrdersSync);
      window.removeEventListener('apex_products_updated', handleProductsSync);
      window.removeEventListener('apex_users_updated', handleUsersSync);
      window.removeEventListener('apex_notifications_updated', handleNotificationsSync);
      window.removeEventListener('apex_store_settings_updated', handleStoreSettingsSync);
    };
  }, []);

  const updateFeatureToggle = (key: keyof FeatureToggles, enabled: boolean) => {
    setFeatureToggles((prev) => {
      const updated = { ...prev, [key]: enabled };
      try {
        localStorage.setItem('apex_feature_toggles', JSON.stringify(updated));
        window.dispatchEvent(new Event('apex_features_updated'));
      } catch {}
      updateFirebasePartial({ featureToggles: updated }).catch(() => {});
      return updated;
    });
  };

  // Registered Users (Persisted, excluding deleted users)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const deletedEmails = getDeletedEmailsSet();
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS);
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        return parsed.filter((u) => u && u.email && !deletedEmails.has(u.email.trim().toLowerCase()));
      }
      const initialUsers: UserProfile[] = [
        {
          id: 'u_admin',
          name: 'Apex Founder',
          email: 'founderofapexstore@gmail.com',
          password: 'password123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: 'u_vip',
          name: 'Zain Malik',
          email: 'customer@apexstore.io',
          password: 'password123',
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ].filter((u) => !deletedEmails.has(u.email.toLowerCase()));
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(initialUsers));
      return initialUsers;
    } catch {
      return [];
    }
  });

  // Current Logged-in User (verified against deleted list)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const deletedEmails = getDeletedEmailsSet();
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
      if (!saved) return null;
      const parsed: UserProfile = JSON.parse(saved);
      if (!parsed?.email || deletedEmails.has(parsed.email.trim().toLowerCase())) {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const openSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  const openOrdersView = () => {
    setCurrentView('orders');
    setSideMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to add pending product to cart after sign-in/up
  const handlePendingAddToCart = (user: UserProfile) => {
    if (pendingCartProductId) {
      const prod = products.find((p) => p.id === pendingCartProductId);
      if (prod) {
        setCart((prev) => {
          const existing = prev.find((item) => item.id === prod.id);
          if (existing) {
            return prev.map((item) =>
              item.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prev, { ...prod, quantity: 1 }];
        });
        showToast(`Added ${prod.name} to cart! Welcome, ${user.name.split(' ')[0]}`, 'success');
      }
      setPendingCartProductId(null);
    }
  };

  const syncUsersToFirebase = (usersList: UserProfile[]) => {
    const deletedEmails = getDeletedEmailsSet();
    const cleanList = usersList.filter(
      (u) => u && u.email
    );
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(cleanList));
      window.dispatchEvent(new Event('apex_users_updated'));
    } catch {}

    updateFirebasePartial({
      users: cleanList.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password || '',
        role: u.role || 'user',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || new Date().toISOString(),
        verified: Boolean(u.verified || u.role === 'admin'),
        verificationOtp: u.verificationOtp || '',
        verificationOtpSentAt: u.verificationOtpSentAt || '',
        verifiedAt: u.verifiedAt || '',
        blocked: Boolean(u.blocked || deletedEmails.has(u.email.trim().toLowerCase()))
      })),
      usersCleared: cleanList.length === 0
    }).catch(() => {});
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    // Check if Admin blocked this user account (Admin accounts are never blocked)
    const deletedEmails = getDeletedEmailsSet();
    const matched = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const isAdminRole = isAdminEmail(cleanEmail) || matched?.role === 'admin';
    if (!isAdminRole && (deletedEmails.has(cleanEmail) || matched?.blocked)) {
      return {
        success: false,
        error: 'This account has been blocked by Admin and cannot sign in.'
      };
    }

    if (!matched) {
      if (cleanEmail && cleanPass.length >= 4) {
        // New account requires Admin OTP verification before entering store (unless Admin)
        const newUser: UserProfile = {
          id: `u_${Date.now()}`,
          name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: cleanEmail,
          password: cleanPass,
          role: isAdminRole ? 'admin' : 'user',
          verified: isAdminRole ? true : false,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        const updated = [...registeredUsers, newUser];
        setRegisteredUsers(updated);
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updated));
        syncUsersToFirebase(updated);
        setCurrentUser(newUser);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
        if (newUser.verified) {
          handlePendingAddToCart(newUser);
        }
        return { success: true };
      }
      return { success: false, error: 'Account not found. Please click Sign Up.' };
    }

    if (matched.password && cleanPass && matched.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const updatedUser: UserProfile = {
      ...matched,
      password: cleanPass || matched.password || '',
      role: isAdminRole ? 'admin' : 'user',
      verified: Boolean(matched.verified || isAdminRole),
      lastLoginAt: new Date().toISOString()
    };
    const updatedList = registeredUsers.map((u) =>
      u.email.toLowerCase() === cleanEmail ? updatedUser : u
    );
    setRegisteredUsers(updatedList);
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updatedList));
    syncUsersToFirebase(updatedList);

    setCurrentUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
    if (updatedUser.verified) {
      handlePendingAddToCart(updatedUser);
    }
    return { success: true };
  };

  const signup = async (name: string, email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (cleanPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    // Unblock if email was previously in deleted/blocked list so new signup works cleanly
    const deletedEmails = getDeletedEmailsSet();
    if (deletedEmails.has(cleanEmail)) {
      deletedEmails.delete(cleanEmail);
      try {
        localStorage.setItem(LOCAL_STORAGE_DELETED_USERS, JSON.stringify(Array.from(deletedEmails)));
      } catch {}
    }
    try {
      const permRaw = localStorage.getItem('apex_permanently_deleted_users');
      if (permRaw) {
        const permList: string[] = JSON.parse(permRaw);
        const filteredPerm = permList.filter((e) => e.trim().toLowerCase() !== cleanEmail);
        localStorage.setItem('apex_permanently_deleted_users', JSON.stringify(filteredPerm));
      }
    } catch {}

    const existingUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    const isAdminAccount = isAdminEmail(cleanEmail);
    const newUser: UserProfile = {
      id: existingUser?.id || `u_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: isAdminAccount ? 'admin' : 'user',
      verified: isAdminAccount ? true : false, // Strictly UNVERIFIED on signup for normal users until Admin sends OTP and user verifies!
      blocked: false,
      verificationOtp: undefined,
      verificationOtpSentAt: undefined,
      verifiedAt: isAdminAccount ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const updated = existingUser
      ? registeredUsers.map((u) => (u.email.toLowerCase() === cleanEmail ? newUser : u))
      : [newUser, ...registeredUsers];

    setRegisteredUsers(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updated));
    } catch {}
    syncUsersToFirebase(updated);
    setCurrentUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
    } catch {}

    return { success: true };
  };

  // Admin sends 6-digit Account Verification OTP to a user
  const adminSendUserVerificationOtp = (email: string, customOtp?: string): string => {
    const cleanEmail = email.trim().toLowerCase();
    const generatedOtp =
      customOtp && customOtp.trim().length >= 4
        ? customOtp.trim()
        : Math.floor(100000 + Math.random() * 900000).toString();

    setRegisteredUsers((prev) => {
      const exists = prev.some((u) => u.email.trim().toLowerCase() === cleanEmail);
      const updated = exists
        ? prev.map((u) =>
            u.email.trim().toLowerCase() === cleanEmail
              ? {
                  ...u,
                  verificationOtp: generatedOtp,
                  verificationOtpSentAt: new Date().toISOString(),
                  verified: false
                }
              : u
          )
        : [
            ...prev,
            {
              id: `u_${Date.now()}`,
              name: cleanEmail.split('@')[0],
              email: cleanEmail,
              role: 'user' as const,
              verified: false,
              verificationOtp: generatedOtp,
              verificationOtpSentAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            }
          ];
      syncUsersToFirebase(updated);
      return updated;
    });

    setCurrentUser((curr) => {
      if (!curr || curr.email.trim().toLowerCase() !== cleanEmail) return curr;
      const nextCurr = {
        ...curr,
        verificationOtp: generatedOtp,
        verificationOtpSentAt: new Date().toISOString()
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(nextCurr));
      } catch {}
      return nextCurr;
    });

    addNotification(
      `Account Verification OTP: ${generatedOtp}`,
      `Admin sent your 6-digit Account Verification OTP: ${generatedOtp}. Enter this code on the Verification Panel to unlock store access.`,
      'info',
      'fa-user-shield',
      cleanEmail,
      undefined,
      generatedOtp
    );

    return generatedOtp;
  };

  // User enters the 6-digit Account Verification OTP sent by Admin to unlock the store
  const verifyUserAccountOtp = (enteredOtp: string): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Please sign in first.' };
    }
    const cleanEmail = currentUser.email.trim().toLowerCase();
    let latestUsers = registeredUsers;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_USERS);
      if (raw) {
        latestUsers = JSON.parse(raw);
      }
    } catch {}

    const matchedUser = latestUsers.find((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    const expectedOtp = (matchedUser?.verificationOtp || currentUser.verificationOtp || '').trim();

    if (!expectedOtp) {
      return {
        success: false,
        error: 'Waiting for Admin to send your 6-digit verification OTP. Please wait for Admin approval.'
      };
    }

    if (enteredOtp.trim() !== expectedOtp) {
      showToast('Invalid OTP code! Please enter the exact 6-digit OTP sent by Admin.', 'error');
      return {
        success: false,
        error: 'Incorrect OTP code! Please enter the exact 6-digit OTP sent by Admin.'
      };
    }

    const nowIso = new Date().toISOString();
    const verifiedUser: UserProfile = {
      ...(matchedUser || currentUser),
      ...currentUser,
      verified: true,
      verifiedAt: nowIso,
      verificationOtp: expectedOtp
    };

    const updatedUsers = latestUsers.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail)
      ? latestUsers.map((u) => ((u.email || '').trim().toLowerCase() === cleanEmail ? verifiedUser : u))
      : [...latestUsers, verifiedUser];

    setRegisteredUsers(updatedUsers);
    setCurrentUser(verifiedUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(verifiedUser));
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updatedUsers));
    } catch {}
    syncUsersToFirebase(updatedUsers);

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    handlePendingAddToCart(verifiedUser);
    showToast('Account Verified Successfully! Welcome to ApexStore 🎉', 'success');
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
  };

  // Notifications State (Persisted)
  const [notifications, setNotifications] = useState<StoreNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_READ_NOTIFS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders and Checkout State
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
  const [approvalSecondsLeft, setApprovalSecondsLeft] = useState<number>(3);

  // Flying item particles
  const [flyingParticles, setFlyingParticles] = useState<FlyingParticle[]>([]);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Sync products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(products));
    } catch {}
  }, [products]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Sync reviews to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_REVIEWS, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  // Sync notifications
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_READ_NOTIFS, JSON.stringify(readNotificationIds));
    } catch {}
  }, [readNotificationIds]);

  // Launch countdown timer: respects Admin configuration & live endTime
  useEffect(() => {
    const interval = setInterval(() => {
      setLaunchConfig((prev) => {
        if (!prev.isRunning) return prev;
        if (prev.endTime && prev.endTime > 0) {
          const remaining = Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000));
          if (remaining <= 0) {
            return {
              ...prev,
              secondsLeft: prev.autoLaunch ? (prev.totalSeconds || 300) : 0,
              endTime: prev.autoLaunch ? Date.now() + (prev.totalSeconds || 300) * 1000 : null,
              isRunning: prev.autoLaunch
            };
          }
          return {
            ...prev,
            secondsLeft: remaining
          };
        }
        const nextSeconds = prev.secondsLeft > 0 ? prev.secondsLeft - 1 : (prev.autoLaunch ? (prev.totalSeconds || 300) : 0);
        return {
          ...prev,
          secondsLeft: nextSeconds,
          isRunning: nextSeconds > 0 || prev.autoLaunch
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Firebase Realtime DB initial fetch & live subscription
  useEffect(() => {
    let isMounted = true;

    const applyRemoteStoreState = (data: StoreState) => {
      if (!isMounted || !data) return;

      const deletedProds = getDeletedProductIdsSet();
      const deletedOrders = getDeletedOrderIdsSet();
      const deletedEmails = getDeletedEmailsSet();
      const deletedCats = getDeletedCategoryIdsSet();

      if (Array.isArray(data.products)) {
        setProducts((currentProds) => {
          const nextProds = data.products
            .filter((dp) => dp && !deletedProds.has(Number(dp.id)))
            .map((dp) => {
              const matched = currentProds.find((cp) => cp.id === dp.id);
              return matched
                ? ({ ...dp, rating: dp.rating ?? matched.rating, reviews: dp.reviews ?? matched.reviews } as Product)
                : (dp as Product);
            });
          try {
            localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(nextProds));
          } catch {}
          return nextProds;
        });
      }

      if (Array.isArray(data.promos)) {
        setPromoCodes(
          data.promos
            .filter((p) => p.active !== false)
            .map((p) => ({
              code: p.code,
              discount: p.discount,
              desc: p.desc || `${Math.round(p.discount * 100)}% OFF Discount`,
              badge: p.badge || 'SPECIAL',
              badgeType: (p.badgeType as PromoCode['badgeType']) || 'hot',
              active: p.active !== false
            }))
        );
      }

      if (Array.isArray(data.sections)) {
        setSections(
          data.sections.map((s) => ({
            id: s.id,
            title: s.title,
            filter: s.filter,
            layout: (s.layout as SectionConfig['layout']) || 'horizontal',
            order: s.order,
            active: s.active !== false
          }))
        );
      }

      if (Array.isArray(data.categories)) {
        const cleanCats = data.categories.filter((c) => c && !deletedCats.has(String(c.id)));
        setCategories(cleanCats);
      }

      if (Array.isArray(data.users)) {
        const remoteUsers: UserProfile[] = data.users
          .filter((ru) => ru && ru.email && !deletedEmails.has(ru.email.trim().toLowerCase()))
          .map((ru) => ({
            id: ru.id || `u_${ru.email}`,
            name: ru.name || ru.email.split('@')[0],
            email: ru.email,
            password: ru.password || '',
            role: ru.role || 'user',
            verified: Boolean(ru.verified),
            verificationOtp: ru.verificationOtp,
            verificationOtpSentAt: ru.verificationOtpSentAt,
            verifiedAt: ru.verifiedAt,
            createdAt: ru.createdAt || new Date().toISOString(),
            lastLoginAt: ru.lastLoginAt
          }));
        setRegisteredUsers((prevUsers) => {
          const mergedMap = new Map<string, UserProfile>();
          for (const pu of prevUsers) {
            const em = (pu?.email || '').trim().toLowerCase();
            if (em && !deletedEmails.has(em)) {
              mergedMap.set(em, pu);
            }
          }
          for (const ru of remoteUsers) {
            const em = (ru?.email || '').trim().toLowerCase();
            if (em && !deletedEmails.has(em)) {
              const existing = mergedMap.get(em);
              mergedMap.set(em, { ...(existing || {}), ...ru });
            }
          }
          const finalUsers = Array.from(mergedMap.values());
          try {
            localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(finalUsers));
          } catch {}
          return finalUsers;
        });
        setCurrentUser((curr) => {
          if (!curr) return null;
          const currEmail = (curr.email || '').trim().toLowerCase();
          if (deletedEmails.has(currEmail)) {
            try {
              localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
            } catch {}
            return null;
          }
          const stillExists = remoteUsers.find(
            (u) => (u.email || '').trim().toLowerCase() === currEmail
          );
          if (!stillExists) {
            return curr;
          }
          const updatedCurr: UserProfile = {
            ...curr,
            ...stillExists,
            verified: Boolean(stillExists.verified),
            verificationOtp: stillExists.verificationOtp ?? curr.verificationOtp,
            verificationOtpSentAt: stillExists.verificationOtpSentAt ?? curr.verificationOtpSentAt,
            verifiedAt: stillExists.verifiedAt ?? curr.verifiedAt
          };
          try {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(updatedCurr));
          } catch {}
          return updatedCurr;
        });
      }

      if (data.launchConfig) {
        setLaunchConfig((prev) => {
          const remote = data.launchConfig;
          let computedSeconds = remote.secondsLeft ?? prev.secondsLeft ?? 300;
          if (remote.isRunning && remote.endTime && remote.endTime > Date.now()) {
            computedSeconds = Math.max(0, Math.ceil((remote.endTime - Date.now()) / 1000));
          }
          return {
            mode: remote.mode || 'public',
            autoLaunch: remote.autoLaunch !== false,
            totalSeconds: remote.totalSeconds || 300,
            secondsLeft: computedSeconds,
            isRunning: Boolean(remote.isRunning),
            endTime: remote.endTime ?? null
          };
        });
      }

      const incomingOrders = (Array.isArray(data.orders) ? data.orders : []).filter(
        (ro) => ro && !deletedOrders.has(String(ro.id))
      );
      setOrders((prevOrders) => {
        const combinedMap = new Map<number, Order>();
        for (const po of prevOrders) {
          if (po && !deletedOrders.has(String(po.id))) {
            combinedMap.set(Number(po.id), po);
          }
        }
        let newlyDeliveredOrder: Order | null = null;
        for (const ro of incomingOrders) {
          const numId = Number.isNaN(Number(ro.id)) ? Date.now() : Number(ro.id);
          const existing = combinedMap.get(numId);
          const mergedOrder: Order = {
            ...(existing || {}),
            ...ro,
            id: numId,
            customer: ro.customer || existing?.customer || 'Verified Buyer',
            email: ro.email || existing?.email || '',
            userPassword: ro.userPassword || existing?.userPassword || '',
            phone: ro.phone || existing?.phone || '',
            items: (ro.items || existing?.items || []).map((it) => ({
              id: it.id,
              productId: it.productId || it.id,
              name: it.name,
              quantity: it.quantity,
              price: it.price,
              image: it.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
              category: it.category,
              productUrl: it.productUrl || `#product-${it.id}`
            })),
            subtotal: ro.subtotal ?? existing?.subtotal ?? ro.total,
            discount: ro.discount ?? existing?.discount ?? 0,
            total: ro.total,
            method: ro.method || existing?.method || 'easypaisa',
            transactionId: ro.transactionId || existing?.transactionId || `APX-${String(numId).slice(-6)}`,
            proofUrl: ro.proofUrl || existing?.proofUrl || '',
            status: (ro.status as OrderStatus) || existing?.status || 'pending',
            createdAt:
              typeof ro.createdAt === 'number'
                ? new Date(ro.createdAt).toISOString()
                : ro.createdAt || existing?.createdAt || new Date().toISOString(),
            otp: ro.otp || existing?.otp,
            otpSentAt: ro.otpSentAt || existing?.otpSentAt,
            otpVerified: ro.otpVerified ?? existing?.otpVerified,
            otpVerifiedAt: ro.otpVerifiedAt || existing?.otpVerifiedAt,
            deliveryInfo: ro.deliveryInfo || existing?.deliveryInfo,
            productName: ro.productName || existing?.productName,
            productLink: ro.productLink || existing?.productLink,
            downloadUrl: ro.downloadUrl || existing?.downloadUrl,
            downloadFileName: ro.downloadFileName || existing?.downloadFileName,
            deliveryDetails: ro.deliveryDetails || existing?.deliveryDetails,
            licenseKey: ro.licenseKey || existing?.licenseKey,
            approvalSecondsLeft: ro.approvalSecondsLeft ?? existing?.approvalSecondsLeft ?? 180,
            approvalExpiresAt: ro.approvalExpiresAt ?? existing?.approvalExpiresAt,
            timeline: ro.timeline || existing?.timeline || []
          };
          if (existing && existing.status !== 'delivered' && mergedOrder.status === 'delivered') {
            newlyDeliveredOrder = mergedOrder;
          }
          combinedMap.set(numId, mergedOrder);
        }
        const sorted = Array.from(combinedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        try {
          localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(sorted));
        } catch {}

        const validMap = new Map(sorted.map((o) => [String(o.id), o]));
        setCurrentOrder((curr) => {
          if (!curr) return null;
          if (deletedOrders.has(String(curr.id))) {
            setTimerModalOpen(false);
            return null;
          }
          return validMap.get(String(curr.id)) || curr;
        });
        setReceiptOrder((curr) => {
          if (newlyDeliveredOrder) {
            try {
              const savedUserRaw = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
              const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
              const myEmail = (savedUser?.email || '').trim().toLowerCase();
              const orderEmail = (newlyDeliveredOrder.email || '').trim().toLowerCase();
              if (!myEmail || !orderEmail || myEmail === orderEmail) {
                return newlyDeliveredOrder;
              }
            } catch {
              return newlyDeliveredOrder;
            }
          }
          if (!curr) return null;
          if (deletedOrders.has(String(curr.id))) return null;
          return validMap.get(String(curr.id)) || curr;
        });
        setActiveTimerOrderId((currId) => {
          if (currId !== null && deletedOrders.has(String(currId))) {
            setTimerModalOpen(false);
            return null;
          }
          return currId;
        });

        return sorted;
      });

      if (data.storeSettings) {
        setStoreInfo((prev) => {
          const nextInfo: StoreInfo = {
            ...prev,
            ...data.storeSettings,
            name: data.storeSettings?.name || prev.name || 'ApexStore',
            owner: data.storeSettings?.owner || prev.owner,
            city: data.storeSettings?.city || prev.city,
            phone: data.storeSettings?.phone || prev.phone,
            email: data.storeSettings?.email || prev.email,
            whatsapp: data.storeSettings?.whatsapp || prev.whatsapp,
            paymentNumber: data.paymentMethods?.easypaisa?.number || prev.paymentNumber
          };
          try {
            localStorage.setItem('apex_store_settings', JSON.stringify(nextInfo));
          } catch {}
          return nextInfo;
        });
      }

      if (data.announcementSettings) {
        setAnnouncement({
          specialText: data.announcementSettings.offerText || INITIAL_ANNOUNCEMENT.specialText,
          promoCode: data.announcementSettings.offerCode || INITIAL_ANNOUNCEMENT.promoCode,
          shipping: data.announcementSettings.marqueeShipping || INITIAL_ANNOUNCEMENT.shipping,
          newArrivals: data.announcementSettings.marqueeNewArrivals || INITIAL_ANNOUNCEMENT.newArrivals,
          reviews: data.announcementSettings.marqueeReviews || INITIAL_ANNOUNCEMENT.reviews
        });
      }

      if (data.bannerImage !== undefined && data.bannerImage !== null) {
        setBannerImage(data.bannerImage || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80');
      }

      if (Array.isArray(data.gallery)) {
        setGalleryImages(data.gallery);
      }

      if (data.galleryEnabled !== undefined) {
        setGalleryEnabled(data.galleryEnabled);
      }

      if (data.globalLayout) {
        setGlobalLayout(data.globalLayout);
      }

      if (data.transcriptSettings) {
        setTranscriptSettings(data.transcriptSettings);
      }

      if (data.paymentMethods) {
        setPaymentConfig(data.paymentMethods as PaymentMethodsConfig);
      }

      if (Array.isArray(data.customPaymentMethods)) {
        setCustomPaymentMethods(
          data.customPaymentMethods
            .filter((c) => c.active !== false)
            .map((c) => ({
              id: c.id,
              name: c.name,
              account: c.account || '',
              accountName: c.accountName || '',
              icon: c.icon || 'fa-wallet',
              color: c.color || '#a855f7',
              desc: c.desc || '',
              active: c.active !== false
            }))
        );
      }

      if (Array.isArray(data.notifications)) {
        setNotifications(
          data.notifications.map((n) => ({
            id: n.id,
            type: n.type,
            icon: n.icon,
            title: n.title,
            desc: n.desc,
            time: n.time,
            active: n.active !== false,
            targetEmail: n.targetEmail,
            orderId: n.orderId,
            otp: n.otp,
            deliveryInfo: n.deliveryInfo
          }))
        );
      }

      if (data.featureToggles) {
        setFeatureToggles((prev) => ({ ...prev, ...data.featureToggles }));
      }
    };

    fetchStoreFromFirebase()
      .then(applyRemoteStoreState)
      .catch(() => {});

    const unsubscribe = subscribeToFirebaseStore(applyRemoteStoreState);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Visible Products
  const visibleProducts = products.filter((p) => p.public !== false);

  // Cart Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = cartSubtotal * appliedDiscount;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Trigger Flying particle to cart icon (kept silent to prevent overlay bouncing)
  const triggerFlyParticle = (_x: number, _y: number, _image: string) => {
    // Silenced to ensure zero overlay bouncing or intrusive screen-wide animations
  };

  // Add to cart with authentication check
  const addToCart = (productId: number, _event?: React.MouseEvent) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (!currentUser) {
      setPendingCartProductId(productId);
      openSignIn();
      showToast('Please sign in to order products & add to cart', 'info');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedDiscount(0);
  };

  const applyPromoCode = (code: string): boolean => {
    const found = promoCodes.find((p) => p.code.toUpperCase() === code.trim().toUpperCase());
    if (found) {
      setAppliedDiscount(found.discount);
      showToast(`Promo Applied! ${Math.round(found.discount * 100)}% OFF`);
      return true;
    }
    showToast('Invalid promo code', 'error');
    return false;
  };

  // Reviews System Functions
  const getProductReviews = (productId: number): ProductReview[] => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getProductRatingStats = (productId: number): RatingStats => {
    const prodReviews = reviews.filter((r) => r.productId === productId);
    const prod = products.find((p) => p.id === productId);

    if (prodReviews.length === 0) {
      const avg = prod?.rating || 4.9;
      const count = prod?.reviews || 24;
      return {
        average: avg,
        count: count,
        breakdown: {
          5: Math.round(count * 0.8),
          4: Math.round(count * 0.15),
          3: Math.round(count * 0.05),
          2: 0,
          1: 0
        }
      };
    }

    const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / prodReviews.length).toFixed(1));
    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    prodReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      breakdown[star] = (breakdown[star] || 0) + 1;
    });

    return {
      average: avg,
      count: prodReviews.length,
      breakdown
    };
  };

  const addReview = (newRev: { productId: number; userName: string; rating: number; comment: string }) => {
    const reviewItem: ProductReview = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString().slice(2, 6),
      productId: newRev.productId,
      userName: newRev.userName.trim() || 'Verified Customer',
      rating: newRev.rating,
      comment: newRev.comment.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verifiedPurchase: true
    };

    // Update reviews state
    setReviews((prev) => [reviewItem, ...prev]);

    // Recalculate average rating for product
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === newRev.productId) {
          const currentProdRevs = [reviewItem, ...reviews.filter((r) => r.productId === p.id)];
          const newAvg = Number((currentProdRevs.reduce((acc, r) => acc + r.rating, 0) / currentProdRevs.length).toFixed(1));
          return {
            ...p,
            rating: newAvg,
            reviews: currentProdRevs.length
          };
        }
        return p;
      })
    );

    // Update quickViewProduct if open
    setQuickViewProduct((prev) => {
      if (prev && prev.id === newRev.productId) {
        const currentProdRevs = [reviewItem, ...reviews.filter((r) => r.productId === prev.id)];
        const newAvg = Number((currentProdRevs.reduce((acc, r) => acc + r.rating, 0) / currentProdRevs.length).toFixed(1));
        return {
          ...prev,
          rating: newAvg,
          reviews: currentProdRevs.length
        };
      }
      return prev;
    });

    showToast(`Thank you! Your ${newRev.rating}★ review is live.`, 'success');
  };

  // Search
  const performSearch = (query: string) => {
    const trimmed = query.trim();
    setSearchQuery(trimmed);
    if (trimmed.length > 0) {
      setCurrentView('search');
      setSearchSuggestionsOpen(false);
    } else {
      setCurrentView('home');
    }
  };

  // Open Section All View
  const openSectionAllView = (filter: string, title: string) => {
    setAllViewFilter(filter);
    setAllViewTitle(title);
    setCurrentView('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setCurrentView('home');
    setSearchQuery('');
    setSideMenuOpen(false);
    setCartDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter notifications so targeted OTP/order notifications are ONLY visible to the user who owns that email
  const visibleNotifications = notifications.filter((n) => {
    if (n.targetEmail) {
      if (!currentUser || !currentUser.email) return false;
      return currentUser.email.trim().toLowerCase() === n.targetEmail.trim().toLowerCase();
    }
    return true;
  });

  const unreadNotificationCount = visibleNotifications.filter((n) => !readNotificationIds.includes(n.id)).length;

  // Instant Notification helper
  const addNotification = (
    title: string,
    desc: string,
    type: 'info' | 'promo' | 'order' | 'alert' = 'order',
    icon: string = 'fa-bell',
    targetEmail?: string,
    orderId?: string | number,
    otp?: string
  ) => {
    const newNotif: StoreNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      icon,
      title,
      desc,
      time: Date.now(),
      active: true,
      targetEmail: targetEmail ? targetEmail.trim().toLowerCase() : undefined,
      orderId,
      otp
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      updateFirebasePartial({ notifications: updated }).catch(() => {});
      return updated;
    });
    // Ensure it's unread
    setReadNotificationIds((prev) => prev.filter((id) => id !== newNotif.id));
    if (!targetEmail || (currentUser && currentUser.email.trim().toLowerCase() === targetEmail.trim().toLowerCase())) {
      showToast(title, type === 'alert' ? 'error' : 'success');
    }
  };

  const markNotificationRead = (id: string) => {
    if (!readNotificationIds.includes(id)) {
      setReadNotificationIds((prev) => [...prev, id]);
    }
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(visibleNotifications.map((n) => n.id));
    showToast('All notifications marked as read');
  };

  // Ticking effect for pending order review countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => {
        let changed = false;
        const updated = prev.map((o) => {
          if (o.status === 'pending' && o.approvalExpiresAt) {
            const remaining = Math.max(0, Math.ceil((o.approvalExpiresAt - Date.now()) / 1000));
            if (remaining !== o.approvalSecondsLeft) {
              changed = true;
              return { ...o, approvalSecondsLeft: remaining };
            }
          }
          return o;
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active approval seconds left
  const currentActiveOrder = orders.find((o) => o.id === activeTimerOrderId) || currentOrder;
  const activeApprovalSecondsLeft = currentActiveOrder?.approvalSecondsLeft ?? 180;

  // Checkout & Payment
  const startCheckout = () => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }
    if (!currentUser) {
      setCartDrawerOpen(false);
      openSignIn();
      showToast('Please login with your Email & Password to place an order', 'info');
      return;
    }
    setCartDrawerOpen(false);
    setPaymentModalOpen(true);
  };

  // Cancel or reset payment
  const cancelPayment = () => {
    setPaymentModalOpen(false);
    setOrderStatus('pending');
    setApprovalSecondsLeft(180);
  };

  // Delete an order permanently (works for both Admin and User)
  const deleteOrder = (orderId: number | string) => {
    const idStr = String(orderId).trim();
    const deletedSet = getDeletedOrderIdsSet();
    deletedSet.add(idStr);
    const nextDeletedOrderIds = Array.from(deletedSet);
    try {
      localStorage.setItem('apex_deleted_order_ids', JSON.stringify(nextDeletedOrderIds));
    } catch {}

    setOrders((prev) => {
      const updated = prev.filter((o) => String(o.id) !== idStr);
      try {
        localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(updated));
        window.dispatchEvent(new Event('apex_orders_updated'));
      } catch {}
      updateFirebasePartial({
        orders: updated.map((o) => ({ ...o, id: String(o.id) })),
        deletedOrderIds: nextDeletedOrderIds,
        ordersCleared: updated.length === 0
      }).catch(() => {});
      return updated;
    });

    if (currentOrder && String(currentOrder.id) === idStr) {
      setCurrentOrder(null);
      setTimerModalOpen(false);
    }
    if (receiptOrder && String(receiptOrder.id) === idStr) {
      setReceiptOrder(null);
    }
    if (activeTimerOrderId !== null && String(activeTimerOrderId) === idStr) {
      setActiveTimerOrderId(null);
      setTimerModalOpen(false);
    }
    showToast(`Order #${idStr.slice(-6)} deleted`, 'info');
  };

  // Confirm payment: Manual merchant verification flow with Live Timer & Admin OTP Approval
  const confirmPayment = (details: {
    method: string;
    email: string;
    password?: string;
    senderMobile: string;
    transactionId: string;
    proofUrl: string;
  }) => {
    const buyerEmail = (currentUser?.email || details.email || 'customer@apexstore.pk').trim().toLowerCase();

    // Unblock email if it was previously in deleted list so client order never fails
    const deletedEmails = getDeletedEmailsSet();
    if (deletedEmails.has(buyerEmail)) {
      deletedEmails.delete(buyerEmail);
      try {
        localStorage.setItem(LOCAL_STORAGE_DELETED_USERS, JSON.stringify(Array.from(deletedEmails)));
      } catch {}
    }

    const orderId = Date.now();
    const effectiveProof =
      details.proofUrl.trim() ||
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80';
    const effectiveTrxId = details.transactionId.trim() || `APX-${Date.now().toString().slice(-6)}`;
    const expiresAt = Date.now() + 180 * 1000; // 3 minutes countdown for merchant review

    const matchedRegUser = registeredUsers.find((u) => u.email.toLowerCase() === buyerEmail);
    const buyerPassword = currentUser?.password || details.password || matchedRegUser?.password || '123456';
    const buyerName =
      currentUser?.name ||
      matchedRegUser?.name ||
      (buyerEmail
        ? buyerEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : 'Verified Buyer');

    const newOrder: Order = {
      id: orderId,
      customer: buyerName,
      email: buyerEmail,
      userPassword: buyerPassword,
      phone: details.senderMobile,
      items: cart.map((i) => ({
        id: i.id,
        productId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
        category: i.category,
        productUrl: `#product-${i.id}`
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      total: cartTotal,
      method: details.method,
      transactionId: effectiveTrxId,
      proofUrl: effectiveProof,
      status: 'pending', // Strictly PENDING - Merchant manually approves!
      createdAt: new Date().toISOString(),
      approvalSecondsLeft: 180,
      approvalExpiresAt: expiresAt,
      timeline: [
        {
          status: 'pending',
          title: 'Payment Submitted',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Transferred via ${details.method.toUpperCase()} • TRX: ${effectiveTrxId}`,
          completed: true
        }
      ]
    };

    // Track this order ID locally so it is 100% guaranteed to show in the client's My Orders
    try {
      const rawLocalIds = localStorage.getItem('apex_my_local_order_ids');
      const parsedIds: string[] = rawLocalIds ? JSON.parse(rawLocalIds) : [];
      const nextIds = Array.from(new Set([String(orderId), ...parsedIds.map(String)]));
      localStorage.setItem('apex_my_local_order_ids', JSON.stringify(nextIds));
    } catch {}

    // Ensure user record with email & password is saved & synced so Admin sees it
    let nextUsersList = registeredUsers;
    if (buyerEmail) {
      const userRecord: UserProfile = {
        id: currentUser?.id || matchedRegUser?.id || `u_${Date.now()}`,
        name: buyerName,
        email: buyerEmail,
        password: buyerPassword,
        role: currentUser?.role || matchedRegUser?.role || 'user',
        verified: Boolean(currentUser?.verified ?? matchedRegUser?.verified ?? true),
        verificationOtp: currentUser?.verificationOtp || matchedRegUser?.verificationOtp,
        createdAt: currentUser?.createdAt || matchedRegUser?.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      nextUsersList = matchedRegUser
        ? registeredUsers.map((u) => (u.email.toLowerCase() === buyerEmail ? userRecord : u))
        : [userRecord, ...registeredUsers];
      setRegisteredUsers(nextUsersList);
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(nextUsersList));
      } catch {}
      if (!currentUser) {
        setCurrentUser(userRecord);
        try {
          localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(userRecord));
        } catch {}
      }
    }

    // Build updated orders & notifications synchronously before React commit or Firebase sync
    const nextOrders = [newOrder, ...orders.filter((o) => String(o.id) !== String(orderId))];
    const orderNotif: StoreNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'order',
      icon: 'fa-hourglass-start',
      title: `Order #${String(orderId).slice(-6)} Submitted`,
      desc: `Payment of ${formatPKR(cartTotal)} submitted! Admin verification timer started (3m).`,
      time: Date.now(),
      active: true,
      targetEmail: buyerEmail,
      orderId
    };
    const nextNotifications = [orderNotif, ...notifications];

    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(nextOrders));
      localStorage.setItem(LOCAL_STORAGE_NOTIFS, JSON.stringify(nextNotifications));
    } catch {}

    setOrders(nextOrders);
    setNotifications(nextNotifications);
    setCurrentOrder(newOrder);
    setOrderStatus('pending');
    setActiveTimerOrderId(orderId);
    setPaymentModalOpen(false);
    setTimerModalOpen(true);
    clearCart();
    showToast(`Order #${String(orderId).slice(-6)} submitted! Timer started.`, 'success');

    // Single atomic Firebase sync with ordersCleared: false so notifications never overwrite orders
    updateFirebasePartial({
      orders: nextOrders.map((o) => ({ ...o, id: String(o.id) })),
      ordersCleared: false,
      users: nextUsersList.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password || '',
        role: u.role || 'user',
        verified: Boolean(u.verified),
        verificationOtp: u.verificationOtp || '',
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt || new Date().toISOString()
      })),
      usersCleared: false,
      notifications: nextNotifications
    }).catch(() => {});
  };

  // Admin action: Send OTP to specific customer & order one-by-one
  const adminSendOtp = (orderId: number, customOtp?: string) => {
    const generatedOtp = customOtp?.trim() || Math.floor(100000 + Math.random() * 900000).toString();
    let targetEmail: string | undefined;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (String(o.id) === String(orderId)) {
          targetEmail = o.email;
          const timeline = o.timeline || [];
          return {
            ...o,
            status: 'otp_sent' as OrderStatus,
            otp: generatedOtp,
            otpSentAt: new Date().toISOString(),
            timeline: [
              ...timeline,
              {
                status: 'otp_sent' as OrderStatus,
                title: 'Admin Approved — OTP Dispatched',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Admin verified payment details and dispatched 6-digit confirmation OTP: ${generatedOtp}.`,
                completed: true
              }
            ]
          };
        }
        return o;
      });
      updateFirebasePartial({
        orders: updated.map((o) => ({ ...o, id: String(o.id) }))
      }).catch(() => {});
      return updated;
    });

    if (currentOrder && String(currentOrder.id) === String(orderId)) {
      setCurrentOrder((prev) => (prev ? { ...prev, status: 'otp_sent', otp: generatedOtp } : null));
      setOrderStatus('otp_sent');
    }

    const foundOrder = orders.find((o) => String(o.id) === String(orderId));
    const finalTargetEmail = targetEmail || foundOrder?.email;

    // Targeted notification strictly to the buyer of this specific order
    addNotification(
      `Admin Approved Order #${String(orderId).slice(-6)}!`,
      `Your confirmation OTP for Order #${String(orderId).slice(-6)} is: ${generatedOtp}. Enter OTP in My Orders to complete checkout.`,
      'order',
      'fa-key',
      finalTargetEmail,
      orderId,
      generatedOtp
    );
  };

  // User action: Verify OTP -> Order transitions to PROCESSING so Admin can deliver Product Link, Download & Details
  const verifyOrderOtp = (orderId: number, enteredOtp: string): { success: boolean; error?: string } => {
    const target = orders.find((o) => String(o.id) === String(orderId));
    if (!target) {
      return { success: false, error: 'Order not found.' };
    }
    if (!target.otp) {
      return { success: false, error: 'No OTP generated for this order yet. Awaiting admin approval.' };
    }
    if (enteredOtp.trim() !== target.otp.trim()) {
      return { success: false, error: 'Incorrect OTP. Please enter the exact 6-digit OTP sent by Admin.' };
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    const verifiedTimeIso = new Date().toISOString();
    const updatedOrders = orders.map((o) => {
      if (String(o.id) === String(orderId)) {
        const timeline = o.timeline || [];
        return {
          ...o,
          status: 'processing' as OrderStatus,
          otpVerified: true,
          otpVerifiedAt: verifiedTimeIso,
          timeline: [
            ...timeline,
            {
              status: 'processing',
              title: 'OTP Verified by Buyer — Order Processing',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: 'Customer verified the 6-digit OTP. Order is now processing for final product delivery & download link from Admin.',
              completed: true
            }
          ]
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    try {
      localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('apex_orders_updated'));
    } catch {}
    updateFirebasePartial({
      orders: updatedOrders.map((o) => ({ ...o, id: String(o.id) }))
    }).catch(() => {});

    if (currentOrder && String(currentOrder.id) === String(orderId)) {
      const updated: Order = {
        ...currentOrder,
        status: 'processing',
        otpVerified: true,
        otpVerifiedAt: verifiedTimeIso
      };
      setCurrentOrder(updated);
      setOrderStatus('processing');
    }

    addNotification(
      `OTP Verified — Order #${String(orderId).slice(-6)} is Now Processing! ⚙️`,
      'Your 6-digit OTP is confirmed! Admin is now preparing your product delivery package, product link & download access.',
      'order',
      'fa-gears',
      target.email,
      orderId
    );

    return { success: true };
  };

  // Admin action: Advance order tracking status (Preparing -> Shipped -> Delivered)
  const adminUpdateTracking = (orderId: number, status: OrderStatus, trackingNum?: string) => {
    const tracking = trackingNum || `APX-TRK-${Math.floor(100000 + Math.random() * 900000)}`;
    let deliveredOrderRecord: Order | null = null;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (String(o.id) === String(orderId)) {
          const timeline = o.timeline || [];
          let title = '';
          let note = '';
          if (status === 'delivered') {
            title = 'Order Delivered — Product Link & Package Ready';
            note = 'Order completed and delivered to customer with Product Link & Download.';
          } else if (status === 'rejected') {
            title = 'Payment Rejected';
            note = trackingNum || 'Merchant declined payment proof or transaction ID.';
          } else {
            title = 'Order Status Updated';
            note = `Status changed to ${status}`;
          }

          const defaultProdName = o.items?.map((it) => it.name).join(', ') || 'ApexStore Verified Product';
          const defaultProdLink =
            o.deliveryInfo?.productLink ||
            o.productLink ||
            o.items?.[0]?.productUrl ||
            `${window.location.origin}/#product-${o.items?.[0]?.productId || o.items?.[0]?.id || o.id}`;
          const finalDeliveryInfo =
            status === 'delivered'
              ? {
                  productName: o.deliveryInfo?.productName || defaultProdName,
                  productLink: defaultProdLink,
                  downloadUrl: o.deliveryInfo?.downloadUrl || defaultProdLink,
                  fileName:
                    o.deliveryInfo?.fileName ||
                    `ApexStore_${String(o.id).slice(-6)}_Delivery_Package.html`,
                  licenseKey:
                    o.deliveryInfo?.licenseKey ||
                    `APX-KEY-${String(o.id).slice(-6).toUpperCase()}`,
                  deliveryNote:
                    o.deliveryInfo?.deliveryNote ||
                    'Your order has been verified and delivered by Admin! Use your Product Link or Download Package button to access your product.',
                  deliveredAt: new Date().toISOString()
                }
              : o.deliveryInfo;

          const updatedOrder: Order = {
            ...o,
            status,
            trackingNumber: status === 'delivered' ? tracking : o.trackingNumber,
            deliveryInfo: finalDeliveryInfo,
            productName: finalDeliveryInfo?.productName || o.productName,
            productLink: finalDeliveryInfo?.productLink || o.productLink,
            downloadUrl: finalDeliveryInfo?.downloadUrl || o.downloadUrl,
            licenseKey: finalDeliveryInfo?.licenseKey || o.licenseKey,
            deliveryDetails: finalDeliveryInfo?.deliveryNote || o.deliveryDetails,
            timeline: [
              ...timeline,
              {
                status,
                title: title || status,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note,
                completed: true
              }
            ]
          };
          if (status === 'delivered') {
            deliveredOrderRecord = updatedOrder;
          }
          return updatedOrder;
        }
        return o;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_ORDERS, JSON.stringify(updated));
        window.dispatchEvent(new Event('apex_orders_updated'));
      } catch {}
      updateFirebasePartial({
        orders: updated.map((o) => ({ ...o, id: String(o.id) }))
      }).catch(() => {});
      return updated;
    });

    if (currentOrder && String(currentOrder.id) === String(orderId)) {
      setCurrentOrder((prev) =>
        prev ? (deliveredOrderRecord || { ...prev, status, trackingNumber: tracking }) : null
      );
      setOrderStatus(status);
    }

    const foundOrder = deliveredOrderRecord || orders.find((o) => String(o.id) === String(orderId));
    const buyerTargetEmail = foundOrder?.email;

    if (status === 'delivered') {
      if (foundOrder) {
        setReceiptOrder({ ...foundOrder, status: 'delivered', trackingNumber: tracking });
      }
      addNotification(
        `Order #${String(orderId).slice(-6)} Delivered! 🎉`,
        'Your order has been delivered! Your Official Receipt with Product Link & Download is ready.',
        'order',
        'fa-circle-check',
        buyerTargetEmail,
        orderId
      );
    } else if (status === 'rejected') {
      addNotification(
        `Order #${String(orderId).slice(-6)} Declined`,
        trackingNum || 'Payment verification failed.',
        'alert',
        'fa-triangle-exclamation',
        buyerTargetEmail,
        orderId
      );
    }
  };

  // Admin action: updates an order's status
  const updateOrderStatus = (orderId: number, status: OrderStatus, reason?: string) => {
    if (status === 'otp_sent') {
      adminSendOtp(orderId);
    } else if (status === 'preparing' || status === 'shipped' || status === 'delivered' || status === 'rejected') {
      adminUpdateTracking(orderId, status, reason);
    } else {
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
        updateFirebasePartial({
          orders: updated.map((o) => ({ ...o, id: String(o.id) }))
        }).catch(() => {});
        return updated;
      });

      if (currentOrder && currentOrder.id === orderId) {
        setOrderStatus(status);
        if (status === 'verified') {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
          const updated: Order = { ...currentOrder, status: 'verified' };
          setCurrentOrder(updated);
          setReceiptOrder(updated);
        }
      }
    }
  };

  const manualApproveOrder = (orderId: number) => {
    adminSendOtp(orderId);
  };

  // Admin store management functions
  const saveNewProduct = (prod: Product) => {
    setProducts((prev) => {
      const updated = [prod, ...prev];
      updateFirebasePartial({
        products: updated.map((p) => ({
          ...p,
          rating: p.rating ?? 5.0,
          reviews: p.reviews ?? 1,
          stock: (p as Product & { stock?: number }).stock ?? 10,
          description: p.description ?? ''
        }))
      }).catch(() => {});
      return updated;
    });
    showToast(`Added product: ${prod.name}`);
  };

  const savePromoCode = (promo: PromoCode) => {
    setPromoCodes((prev) => {
      const updated = [promo, ...prev];
      updateFirebasePartial({
        promos: updated.map((p) => ({ ...p, active: p.active !== false }))
      }).catch(() => {});
      return updated;
    });
    showToast(`Saved promo code: ${promo.code}`);
  };

  const saveStoreInfo = (info: StoreInfo) => {
    setStoreInfo(info);
    updateFirebasePartial({
      storeSettings: {
        ...info,
        name: info.name || 'ApexStore'
      }
    }).catch(() => {});
    showToast('Updated store settings');
  };

  return (
    <StoreContext.Provider
      value={{
        currentView,
        setCurrentView,
        openOrdersView,
        goHome,
        activeCategory,
        setActiveCategory,
        allViewTitle,
        allViewFilter,
        openSectionAllView,

        products,
        visibleProducts,
        sections,
        categories,
        promoCodes,
        storeInfo,
        announcement,
        bannerImage,
        galleryImages,
        galleryEnabled,
        launchConfig,
        globalLayout,
        transcriptSettings,

        searchQuery,
        setSearchQuery,
        searchSuggestionsOpen,
        setSearchSuggestionsOpen,
        performSearch,

        cart,
        cartCount,
        cartSubtotal,
        appliedDiscount,
        discountAmount,
        cartTotal,
        addToCart,
        updateCartQty,
        clearCart,
        applyPromoCode,

        sideMenuOpen,
        setSideMenuOpen,
        cartDrawerOpen,
        setCartDrawerOpen,
        notificationModalOpen,
        setNotificationModalOpen,
        quickViewProduct,
        setQuickViewProduct,
        paymentModalOpen,
        setPaymentModalOpen,
        timerModalOpen,
        setTimerModalOpen,
        activeTimerOrderId,
        setActiveTimerOrderId,
        adminModalOpen,
        setAdminModalOpen,
        aiModalOpen,
        setAiModalOpen,
        receiptOrder,
        setReceiptOrder,
        reviewProduct,
        setReviewProduct,

        reviews,
        addReview,
        getProductReviews,
        getProductRatingStats,

        orders,
        updateOrderStatus,
        deleteOrder,
        adminSendOtp,
        adminUpdateTracking,
        saveNewProduct,
        savePromoCode,
        saveStoreInfo,

        notifications: visibleNotifications,
        readNotificationIds,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,

        paymentConfig,
        customPaymentMethods,
        currentOrder,
        orderStatus,
        approvalSecondsLeft: activeApprovalSecondsLeft,
        startCheckout,
        confirmPayment,
        cancelPayment,
        manualApproveOrder,
        verifyOrderOtp,

        // Authentication & User Profile
        currentUser,
        registeredUsers,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openSignIn,
        openSignUp,
        login,
        signup,
        verifyUserAccountOtp,
        adminSendUserVerificationOtp,
        logout,
        pendingCartProductId,
        setPendingCartProductId,

        toasts,
        showToast,
        flyingParticles,

        // Feature Control Center
        featureToggles,
        updateFeatureToggle
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

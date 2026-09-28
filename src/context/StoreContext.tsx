import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  CartItem,
  PromoCode,
  SectionConfig,
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
import { INITIAL_TRANSCRIPT_SETTINGS } from '../lib/constants';
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
  addNotification: (title: string, desc: string, type?: 'info' | 'promo' | 'order' | 'alert', icon?: string) => void;

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
    senderMobile: string;
    transactionId: string;
    proofUrl: string;
  }) => void;
  cancelPayment: () => void;
  manualApproveOrder: (orderId: number) => void;
  verifyOrderOtp: (orderId: number, enteredOtp: string) => { success: boolean; error?: string };

  // Authentication & User Profile
  currentUser: UserProfile | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openSignIn: () => void;
  openSignUp: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'all' | 'search' | 'promo' | 'contact' | 'about' | 'orders'>('home');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [allViewTitle, setAllViewTitle] = useState<string>('All Products');
  const [allViewFilter, setAllViewFilter] = useState<string>('all');

  // Products & Settings (Persisted with user review adjustments)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [sections, setSections] = useState<SectionConfig[]>(INITIAL_SECTIONS);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(INITIAL_STORE_INFO);
  const [announcement, setAnnouncement] = useState<AnnouncementSettings>(INITIAL_ANNOUNCEMENT);
  const [bannerImage, setBannerImage] = useState<string>('https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80');
  const [galleryImages, setGalleryImages] = useState<string[]>(INITIAL_GALLERY_IMAGES);
  const [galleryEnabled, setGalleryEnabled] = useState<boolean>(true);
  const [launchConfig, setLaunchConfig] = useState<LaunchConfig>(INITIAL_LAUNCH_CONFIG);
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

  // Orders State (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      return saved ? JSON.parse(saved) : [];
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
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('apex_features_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apex_features_updated', handleStorageChange);
    };
  }, []);

  const updateFeatureToggle = (key: keyof FeatureToggles, enabled: boolean) => {
    setFeatureToggles((prev) => {
      const updated = { ...prev, [key]: enabled };
      try {
        localStorage.setItem('apex_feature_toggles', JSON.stringify(updated));
        window.dispatchEvent(new Event('apex_features_updated'));
      } catch {}
      return updated;
    });
  };

  // Registered Users (Persisted)
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS);
      if (saved) return JSON.parse(saved);
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
      ];
      localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(initialUsers));
      return initialUsers;
    } catch {
      return [];
    }
  });

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
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

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    const matched = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      if (cleanEmail && cleanPass.length >= 4) {
        // Auto-register seamless experience
        const newUser: UserProfile = {
          id: `u_${Date.now()}`,
          name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          email: cleanEmail,
          password: cleanPass,
          role: cleanEmail.includes('founder') || cleanEmail.includes('admin') ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };
        const updated = [...registeredUsers, newUser];
        setRegisteredUsers(updated);
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updated));
        setCurrentUser(newUser);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
        handlePendingAddToCart(newUser);
        return { success: true };
      }
      return { success: false, error: 'Account not found. Please click Sign Up.' };
    }

    if (matched.password && cleanPass && matched.password !== cleanPass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    setCurrentUser(matched);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(matched));
    handlePendingAddToCart(matched);
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

    const exists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: cleanEmail.includes('founder') || cleanEmail.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(updated));
    setCurrentUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
    handlePendingAddToCart(newUser);

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

  // Launch countdown timer: Always active, guaranteed to show, smoothly loops every drop cycle!
  useEffect(() => {
    const interval = setInterval(() => {
      setLaunchConfig((prev) => {
        const nextSeconds = prev.secondsLeft > 0 ? prev.secondsLeft - 1 : 300;
        return {
          ...prev,
          isRunning: true,
          mode: 'public',
          secondsLeft: nextSeconds
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

      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts((currentProds) =>
          data.products.map((dp) => {
            const matched = currentProds.find((cp) => cp.id === dp.id);
            return matched
              ? ({ ...dp, rating: matched.rating, reviews: matched.reviews } as Product)
              : (dp as Product);
          })
        );
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

      if (Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders((prevOrders) => {
          const mergedMap = new Map<number, Order>();
          for (const po of prevOrders) {
            mergedMap.set(Number(po.id), po);
          }
          for (const ro of data.orders) {
            const numId = Number.isNaN(Number(ro.id)) ? Date.now() : Number(ro.id);
            const existing = mergedMap.get(numId);
            mergedMap.set(numId, {
              ...(existing || {}),
              ...ro,
              id: numId,
              customer: ro.customer || existing?.customer || 'Verified Buyer',
              email: ro.email || existing?.email || 'customer@apexstore.io',
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
              timeline: ro.timeline || existing?.timeline || []
            });
          }
          return Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }

      if (data.storeSettings) {
        setStoreInfo((prev) => ({
          owner: data.storeSettings?.owner || prev.owner,
          city: data.storeSettings?.city || prev.city,
          phone: data.storeSettings?.phone || prev.phone,
          email: data.storeSettings?.email || prev.email,
          whatsapp: data.storeSettings?.whatsapp || prev.whatsapp,
          paymentNumber: data.paymentMethods?.easypaisa?.number || prev.paymentNumber
        }));
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

      if (Array.isArray(data.notifications) && data.notifications.length > 0) {
        setNotifications(
          data.notifications.map((n) => ({
            id: n.id,
            type: n.type,
            icon: n.icon,
            title: n.title,
            desc: n.desc,
            time: n.time,
            active: n.active !== false
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

  // Notifications
  const unreadNotificationCount = notifications.filter((n) => !readNotificationIds.includes(n.id)).length;

  // Instant Notification helper
  const addNotification = (
    title: string,
    desc: string,
    type: 'info' | 'promo' | 'order' | 'alert' = 'order',
    icon: string = 'fa-bell'
  ) => {
    const newNotif: StoreNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      icon,
      title,
      desc,
      time: Date.now(),
      active: true
    };
    setNotifications((prev) => [newNotif, ...prev]);
    // Ensure it's unread
    setReadNotificationIds((prev) => prev.filter((id) => id !== newNotif.id));
    showToast(title, type === 'alert' ? 'error' : 'success');
  };

  const markNotificationRead = (id: string) => {
    if (!readNotificationIds.includes(id)) {
      setReadNotificationIds((prev) => [...prev, id]);
    }
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds(notifications.map((n) => n.id));
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
    setCartDrawerOpen(false);
    setPaymentModalOpen(true);
  };

  // Cancel or reset payment
  const cancelPayment = () => {
    setPaymentModalOpen(false);
    setOrderStatus('pending');
    setApprovalSecondsLeft(180);
  };

  // Confirm payment: Manual merchant verification flow with Live Timer & Admin OTP Approval
  const confirmPayment = (details: {
    method: string;
    email: string;
    senderMobile: string;
    transactionId: string;
    proofUrl: string;
  }) => {
    const orderId = Date.now();
    const effectiveProof = details.proofUrl.trim() || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80';
    const effectiveTrxId = details.transactionId.trim() || `APX-${Date.now().toString().slice(-6)}`;
    const expiresAt = Date.now() + 180 * 1000; // 3 minutes countdown for merchant review

    const newOrder: Order = {
      id: orderId,
      customer: currentUser?.name || 'Verified Buyer',
      email: currentUser?.email || details.email || 'customer@apexstore.io',
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

    setCurrentOrder(newOrder);
    setOrderStatus('pending');
    setActiveTimerOrderId(orderId);
    setTimerModalOpen(true);
    setPaymentModalOpen(false);
    clearCart();

    // Save order in state, localStorage & Firebase RTDB
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      updateFirebasePartial({
        orders: updated.map((o) => ({ ...o, id: String(o.id) }))
      }).catch(() => {});
      return updated;
    });

    // Instant notification
    addNotification(
      `Order #${String(orderId).slice(-6)} Submitted`,
      `Payment of ${formatPKR(cartTotal)} submitted! Admin verification timer started (3m).`,
      'order',
      'fa-hourglass-start'
    );
  };

  // Admin action: Send OTP to customer after approving payment
  const adminSendOtp = (orderId: number, customOtp?: string) => {
    const generatedOtp = customOtp?.trim() || Math.floor(100000 + Math.random() * 900000).toString();

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
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

    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder((prev) => (prev ? { ...prev, status: 'otp_sent', otp: generatedOtp } : null));
      setOrderStatus('otp_sent');
    }

    // Instant notification to user
    addNotification(
      `Admin Approved Order #${String(orderId).slice(-6)}!`,
      `Your confirmation OTP is: ${generatedOtp}. Enter OTP to finalize your order checkout.`,
      'order',
      'fa-key'
    );
  };

  // User action: Verify OTP to finalize order checkout
  const verifyOrderOtp = (orderId: number, enteredOtp: string): { success: boolean; error?: string } => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) {
      return { success: false, error: 'Order not found.' };
    }
    if (!target.otp) {
      return { success: false, error: 'No OTP generated for this order yet. Awaiting admin approval.' };
    }
    if (enteredOtp.trim() !== target.otp.trim()) {
      return { success: false, error: 'Incorrect OTP. Please enter the exact 6-digit OTP sent by Admin.' };
    }

    // Success! Confetti & Verified Status
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    const updatedOrders = orders.map((o) => {
      if (o.id === orderId) {
        const timeline = o.timeline || [];
        return {
          ...o,
          status: 'delivered' as OrderStatus,
          otpVerified: true,
          otpVerifiedAt: new Date().toISOString(),
          timeline: [
            ...timeline,
            {
              status: 'delivered',
              title: 'OTP Verified & Order Delivered',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              note: 'Customer verified OTP successfully. Order delivered to customer.',
              completed: true
            }
          ]
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    updateFirebasePartial({
      orders: updatedOrders.map((o) => ({ ...o, id: String(o.id) }))
    }).catch(() => {});

    if (currentOrder && currentOrder.id === orderId) {
      const updated: Order = { ...currentOrder, status: 'delivered', otpVerified: true };
      setCurrentOrder(updated);
      setOrderStatus('delivered');
    }

    addNotification(
      `Order #${String(orderId).slice(-6)} Confirmed & Delivered! 🎉`,
      'OTP verified successfully! Your order has been completed and delivered.',
      'order',
      'fa-circle-check'
    );

    return { success: true };
  };

  // Admin action: Advance order tracking status (Preparing -> Shipped -> Delivered)
  const adminUpdateTracking = (orderId: number, status: OrderStatus, trackingNum?: string) => {
    const tracking = trackingNum || `APX-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
          const timeline = o.timeline || [];
          let title = '';
          let note = '';
          if (status === 'delivered') {
            title = 'Order Delivered';
            note = 'Order completed and delivered to customer.';
          } else if (status === 'rejected') {
            title = 'Payment Rejected';
            note = trackingNum || 'Merchant declined payment proof or transaction ID.';
          } else {
            title = 'Order Status Updated';
            note = `Status changed to ${status}`;
          }

          return {
            ...o,
            status,
            trackingNumber: status === 'delivered' ? tracking : o.trackingNumber,
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
        }
        return o;
      });
      updateFirebasePartial({
        orders: updated.map((o) => ({ ...o, id: String(o.id) }))
      }).catch(() => {});
      return updated;
    });

    if (currentOrder && currentOrder.id === orderId) {
      setCurrentOrder((prev) => (prev ? { ...prev, status, trackingNumber: tracking } : null));
      setOrderStatus(status);
    }

    if (status === 'delivered') {
      addNotification(`Order #${String(orderId).slice(-6)} Delivered! 🎉`, 'Your order has been delivered successfully.', 'order', 'fa-circle-check');
    } else if (status === 'rejected') {
      addNotification(`Order #${String(orderId).slice(-6)} Declined`, trackingNum || 'Payment verification failed.', 'alert', 'fa-triangle-exclamation');
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
        name: 'ApexStore',
        owner: info.owner,
        email: info.email,
        phone: info.phone,
        city: info.city,
        whatsapp: info.whatsapp
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
        adminSendOtp,
        adminUpdateTracking,
        saveNewProduct,
        savePromoCode,
        saveStoreInfo,

        notifications,
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
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openSignIn,
        openSignUp,
        login,
        signup,
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

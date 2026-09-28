export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  description?: string;
  rating?: number;
  reviews?: number;
  badge?: 'SALE' | 'NEW' | 'HOT' | string;
  public?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PromoCode {
  code: string;
  discount: number; // e.g. 0.20 for 20%
  desc?: string;
  badge?: string;
  badgeType?: 'new' | 'hot' | 'normal' | 'promo' | string;
  active?: boolean;
  image?: string;
}

export interface SectionConfig {
  id: number;
  title: string;
  filter: string;
  layout?: 'horizontal' | 'vertical' | 'compact' | 'featured' | '';
  order: number;
  active: boolean;
}

export interface StoreInfo {
  name?: string;
  owner: string;
  city: string;
  phone: string;
  email: string;
  whatsapp: string;
  paymentNumber?: string;
}

export interface AnnouncementSettings {
  specialText: string;
  promoCode: string;
  shipping: string;
  newArrivals: string;
  reviews: string;
}

export interface CategoryItem {
  id: string | number;
  name: string;
  filter: string;
  image: string;
  icon?: string;
}

export interface StoreNotification {
  id: string;
  type: 'info' | 'promo' | 'order' | 'alert';
  icon: string;
  title: string;
  desc: string;
  time: number;
  active: boolean;
  targetEmail?: string;
  orderId?: string | number;
}

export interface CustomPaymentMethod {
  id: number;
  name: string;
  icon: string;
  account: string;
  accountName: string;
  active?: boolean;
}

export interface PaymentMethodsConfig {
  easypaisa?: { number?: string; name?: string; active?: boolean };
  jazzcash?: { number?: string; name?: string; active?: boolean };
  bank?: { number?: string; name?: string; label?: string; active?: boolean };
  card?: { gateway?: string; active?: boolean };
}

export type OrderStatus =
  | 'pending'
  | 'otp_sent'
  | 'verified'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'processing';

export interface OrderItem {
  id?: number;
  productId?: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
  category?: string;
  productUrl?: string;
}

export interface OrderTimelineItem {
  status: OrderStatus | string;
  title: string;
  time: string;
  note?: string;
  completed: boolean;
}

export interface Order {
  id: number;
  customer: string;
  email: string;
  userPassword?: string;
  phone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  method: string;
  transactionId: string;
  proofUrl: string;
  status: OrderStatus;
  createdAt: string;
  otp?: string;
  otpSentAt?: string;
  otpVerified?: boolean;
  otpVerifiedAt?: string;
  approvalSecondsLeft?: number;
  approvalExpiresAt?: number;
  trackingNumber?: string;
  shippingAddress?: string;
  timeline?: OrderTimelineItem[];
}

export interface TranscriptSettings {
  title?: string;
  subtitle?: string;
  thanks?: string;
  footer?: string;
  badge?: string;
  watermark?: string;
  allowDownload?: boolean;
}

export interface ProductReview {
  id: string;
  productId: number;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedPurchase?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
  role?: 'user' | 'admin';
}

export interface LaunchConfig {
  mode: 'public' | 'private';
  autoLaunch: boolean;
  totalSeconds: number;
  secondsLeft: number;
  isRunning: boolean;
  endTime?: number | null;
}

export interface FeatureToggles {
  splash: boolean;
  announcement: boolean;
  banner: boolean;
  launchCountdown: boolean;
  gallery: boolean;
  categoryChips: boolean;
  dynamicSections: boolean;
  floatingCart: boolean;
  flyingParticles: boolean;
  searchPanel: boolean;
  quickView: boolean;
  reviews: boolean;
  aiAssistant: boolean;
  whatsAppFloat: boolean;
  receiptDownload: boolean;
  promoCodes: boolean;
  notifications: boolean;
  soundEffects: boolean;
}

export const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  splash: true,
  announcement: true,
  banner: true,
  launchCountdown: true,
  gallery: true,
  categoryChips: true,
  dynamicSections: true,
  floatingCart: true,
  flyingParticles: true,
  searchPanel: true,
  quickView: true,
  reviews: true,
  aiAssistant: true,
  whatsAppFloat: true,
  receiptDownload: true,
  promoCodes: true,
  notifications: true,
  soundEffects: true,
};

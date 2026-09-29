import { FeatureToggles, DEFAULT_FEATURE_TOGGLES, OrderDeliveryInfo } from '../types';
export type { OrderDeliveryInfo };

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'otp_sent'
  | 'verified'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected';

export type ProductLayoutType = 'horizontal' | 'vertical' | 'compact' | 'featured';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  rating: number;
  reviews: number;
  badge?: string | null;
  stock: number;
  public?: boolean;
  image: string;
  description: string;
}

export interface Promo {
  code: string;
  discount: number; // e.g. 0.20 for 20%
  desc?: string;
  badge?: string;
  badgeType?: string;
  active: boolean;
}

export interface CategoryItem {
  id: string | number;
  name: string;
  filter: string;
  image: string;
  icon?: string;
}

export interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role?: 'user' | 'admin';
  createdAt: string;
  lastLoginAt?: string;
}

export interface OrderItem {
  id?: number;
  productId?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
  productUrl?: string;
}

export interface Order {
  id: string;
  customer?: string;
  email?: string;
  userPassword?: string;
  phone?: string;
  address?: string;
  method?: string;
  subtotal?: number;
  discount?: number;
  total: number;
  status: OrderStatus;
  items?: OrderItem[];
  transactionId?: string;
  proofUrl?: string;
  createdAt?: number | string;
  otp?: string;
  otpSentAt?: string;
  otpVerified?: boolean;
  otpVerifiedAt?: string;
  trackingNumber?: string;
  approvalSecondsLeft?: number;
  approvalExpiresAt?: number;
  deliveryInfo?: OrderDeliveryInfo;
  timeline?: Array<{
    status: OrderStatus | string;
    title: string;
    time: string;
    note?: string;
    completed: boolean;
  }>;
}

export interface Section {
  id: number;
  title: string;
  filter: string;
  layout?: ProductLayoutType | '';
  order: number;
  active: boolean;
}

export interface LaunchConfig {
  mode: 'public' | 'private';
  autoLaunch: boolean;
  totalSeconds: number;
  secondsLeft: number;
  isRunning: boolean;
  endTime?: number | null;
}

export interface LaunchPoolProduct {
  id: string | number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  rating?: number;
  reviews?: number;
  badge?: string;
  stock: number;
  image: string;
  description?: string;
}

export interface PaymentMethodConfig {
  active: boolean;
  number?: string;
  name?: string;
  gateway?: string;
  desc?: string;
}

export interface CustomPaymentMethod {
  id: number;
  name: string;
  desc?: string;
  account?: string;
  accountName?: string;
  icon?: string;
  color?: string;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'promo' | 'order' | 'info' | 'alert';
  icon: string;
  title: string;
  desc: string;
  time: number;
  active: boolean;
  sender?: string;
  targetEmail?: string;
  orderId?: string | number;
  otp?: string;
  deliveryInfo?: OrderDeliveryInfo;
}

export interface TranscriptSettings {
  title: string;
  subtitle: string;
  thanks: string;
  footer: string;
  badge: string;
  watermark: string;
  allowDownload: boolean;
}

export interface StoreSettings {
  name: string;
  owner: string;
  ownerPhoto?: string;
  ownerRole?: string;
  ownerBio?: string;
  email: string;
  phone: string;
  city: string;
  whatsapp: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  telegram?: string;
  twitter?: string;
  showOwnerPhoto?: boolean;
  showOwnerName?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showCity?: boolean;
  showWhatsapp?: boolean;
  showInstagram?: boolean;
  showTiktok?: boolean;
  showYoutube?: boolean;
  showFacebook?: boolean;
  showTelegram?: boolean;
  showTwitter?: boolean;
}

export interface AnnouncementSettings {
  offerText: string;
  offerCode: string;
  offerDiscount: string | number;
  marqueeShipping: string;
  marqueeNewArrivals: string;
  marqueeReviews: string;
}

export interface StoreState {
  products: Product[];
  promos: Promo[];
  orders: Order[];
  sections: Section[];
  categories?: CategoryItem[];
  users?: RegisteredUserRecord[];
  gallery: string[];
  galleryEnabled: boolean;
  bannerImage?: string | null;
  launchPool: LaunchPoolProduct[];
  nextLaunchProductId?: string | number | null;
  launchConfig: LaunchConfig;
  globalLayout: ProductLayoutType;
  paymentMethods: {
    easypaisa?: PaymentMethodConfig;
    jazzcash?: PaymentMethodConfig;
    bank?: PaymentMethodConfig;
    card?: PaymentMethodConfig;
    [key: string]: PaymentMethodConfig | undefined;
  };
  customPaymentMethods: CustomPaymentMethod[];
  notifications: NotificationItem[];
  transcriptSettings: TranscriptSettings;
  storeSettings?: StoreSettings;
  announcementSettings?: AnnouncementSettings;
  featureToggles?: FeatureToggles;
  deletedUserEmails?: string[];
  deletedOrderIds?: string[];
  deletedProductIds?: number[];
  deletedCategoryIds?: string[];
  ordersCleared?: boolean;
  usersCleared?: boolean;
  productsCleared?: boolean;
  updatedAt?: number;
}

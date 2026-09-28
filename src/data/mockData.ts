import {
  Product,
  SectionConfig,
  PromoCode,
  StoreInfo,
  AnnouncementSettings,
  StoreNotification,
  PaymentMethodsConfig,
  LaunchConfig,
  ProductReview
} from '../types';
import {
  FALLBACK_PRODUCTS,
  FALLBACK_SECTIONS,
  FALLBACK_PROMOS,
  FALLBACK_GALLERY,
  FALLBACK_NOTIFICATIONS
} from '../lib/constants';

export const INITIAL_PRODUCTS: Product[] = FALLBACK_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  oldPrice: p.oldPrice ?? undefined,
  rating: p.rating,
  reviews: p.reviews,
  badge: p.badge ?? undefined,
  stock: p.stock,
  public: p.public !== false,
  image: p.image,
  description: p.description || 'Flagship ApexStore release crafted with premium materials and warranty coverage.'
}));

export const INITIAL_SECTIONS: SectionConfig[] = FALLBACK_SECTIONS.map((s) => ({
  id: s.id,
  title: s.title,
  filter: s.filter,
  layout: s.layout,
  order: s.order,
  active: s.active
}));

export const INITIAL_PROMO_CODES: PromoCode[] = FALLBACK_PROMOS.map((p) => ({
  code: p.code,
  discount: p.discount,
  desc: p.desc,
  badge: p.badge,
  badgeType: p.badgeType === 'promo' ? 'normal' : p.badgeType,
  active: p.active
}));

export const INITIAL_STORE_INFO: StoreInfo = {
  name: 'ApexStore',
  owner: 'Anees Abid',
  email: 'founderofapexstore@gmail.com',
  phone: '+92 345 5724552',
  city: 'Azad Kashmir, Pakistan',
  whatsapp: 'https://whatsapp.com/channel/0029Vb7r27cI7BeE38n42O1V',
  paymentNumber: '03455724552'
};

export const INITIAL_ANNOUNCEMENT: AnnouncementSettings = {
  specialText: 'FLASH SALE: GET UP TO 30% OFF ON PREMIUM AUDIO GEAR',
  promoCode: 'PREMIUM20',
  shipping: 'Free Express Shipping on Orders Over Rs. 5,000',
  newArrivals: 'New Collection Arrivals Every Week',
  reviews: '4.9/5 Verified Customer Satisfaction'
};

export const INITIAL_GALLERY_IMAGES: string[] = FALLBACK_GALLERY;

export const INITIAL_NOTIFICATIONS: StoreNotification[] = FALLBACK_NOTIFICATIONS.map((n) => ({
  id: n.id,
  type: n.type,
  icon: n.icon,
  title: n.title,
  desc: n.desc,
  time: n.time,
  active: n.active,
  targetEmail: n.targetEmail,
  orderId: n.orderId
}));

export const INITIAL_PAYMENT_CONFIG: PaymentMethodsConfig = {
  easypaisa: {
    name: 'Anees Abid (EasyPaisa)',
    number: '03455724552',
    active: true
  },
  jazzcash: {
    name: 'Anees Abid (JazzCash)',
    number: '03455724552',
    active: true
  },
  bank: {
    name: 'Meezan Bank Ltd - ApexStore',
    number: 'PK88MEZN00012345678901',
    active: true
  },
  card: {
    active: true
  }
};

export const INITIAL_LAUNCH_CONFIG: LaunchConfig = {
  mode: 'public',
  isRunning: true,
  secondsLeft: 300,
  totalSeconds: 300,
  autoLaunch: true,
  endTime: null
};

export const INITIAL_REVIEWS: ProductReview[] = [];

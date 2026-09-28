import { Product, Promo, Section, CategoryItem, StoreState } from '../types/store';

export const FALLBACK_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat_all',
    name: 'All',
    filter: 'all',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-border-all'
  },
  {
    id: 'cat_audio',
    name: 'Audio',
    filter: 'audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-headphones'
  },
  {
    id: 'cat_wearables',
    name: 'Wearables',
    filter: 'wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-clock'
  },
  {
    id: 'cat_electronics',
    name: 'Electronics',
    filter: 'electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-microchip'
  },
  {
    id: 'cat_accessories',
    name: 'Accessories',
    filter: 'accessories',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-glasses'
  },
  {
    id: 'cat_footwear',
    name: 'Footwear',
    filter: 'footwear',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80',
    icon: 'fa-shoe-prints'
  }
];

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "SonicPro Wireless ANC Headphones",
    category: "Audio",
    price: 55997,
    oldPrice: 69997,
    rating: 4.9,
    reviews: 320,
    badge: "SALE",
    stock: 8,
    public: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "Active noise cancellation with 40-hour battery life and spatial audio driver."
  },
  {
    id: 2,
    name: "SoundSphere IPX7 Waterproof Speaker",
    category: "Audio",
    price: 25197,
    oldPrice: null,
    rating: 4.9,
    reviews: 410,
    badge: "POPULAR",
    stock: 14,
    public: true,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
    description: "360-degree room-filling acoustic sound with deep punchy bass."
  },
  {
    id: 3,
    name: "StudioBuds True Wireless Earbuds",
    category: "Audio",
    price: 22120,
    oldPrice: 27720,
    rating: 4.7,
    reviews: 160,
    badge: "SALE",
    stock: 16,
    public: true,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    description: "Crystal clear HD calling with quad microphone setup and IPX5 water resistance."
  },
  {
    id: 4,
    name: "AeroPulse Titanium Smartwatch",
    category: "Wearables",
    price: 78120,
    oldPrice: null,
    rating: 4.8,
    reviews: 142,
    badge: "NEW",
    stock: 12,
    public: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Sapphire glass, ECG, SpO2 sensor, Always-on AMOLED retina display."
  },
  {
    id: 5,
    name: "ApexKey RGB Mechanical Keyboard",
    category: "Electronics",
    price: 36260,
    oldPrice: 44520,
    rating: 4.7,
    reviews: 89,
    badge: "HOT",
    stock: 5,
    public: true,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    description: "Hot-swappable switches with per-key RGB backlighting and aluminum body."
  },
  {
    id: 6,
    name: "Minimalist Polarized Sunglasses",
    category: "Accessories",
    price: 15120,
    oldPrice: 21000,
    rating: 4.6,
    reviews: 65,
    badge: "SALE",
    stock: 20,
    public: true,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    description: "Polarized UV400 lenses with ultralight stainless steel frame."
  },
  {
    id: 7,
    name: "NeoRunner Breathable Sport Sneakers",
    category: "Footwear",
    price: 33320,
    oldPrice: 39200,
    rating: 4.9,
    reviews: 180,
    badge: "HOT",
    stock: 15,
    public: true,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    description: "Engineered responsive knit with superior energy rebound cushioning."
  }
];

export const FALLBACK_PROMOS: Promo[] = [
  { code: 'PREMIUM20', discount: 0.20, desc: '20% OFF your entire order', badge: 'HOT', badgeType: 'hot', active: true },
  { code: 'WELCOME10', discount: 0.10, desc: '10% OFF for new customers', badge: 'NEW', badgeType: 'new', active: true },
  { code: 'APEXFLASH', discount: 0.30, desc: '30% Flash drop discount', badge: 'PROMO', badgeType: 'promo', active: true }
];

export const FALLBACK_SECTIONS: Section[] = [
  { id: 1, title: 'HEADPHONE', filter: 'headphone', layout: '', order: 1, active: true },
  { id: 2, title: 'WATCHES', filter: 'watch', layout: 'vertical', order: 2, active: true },
  { id: 3, title: 'SHOES', filter: 'shoe', layout: 'horizontal', order: 3, active: true },
  { id: 4, title: 'GLASSES', filter: 'glasses', layout: 'vertical', order: 4, active: true },
  { id: 5, title: 'ELECTRONICS', filter: 'electronics', layout: 'horizontal', order: 5, active: true }
];

export const FALLBACK_GALLERY: string[] = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
];

export const DEFAULT_PAYMENT_METHODS = {
  easypaisa: { active: true, number: '03455724552', name: 'ApexStore — EasyPaisa' },
  jazzcash: { active: true, number: '03455724552', name: 'ApexStore — JazzCash' },
  bank: { active: true, number: 'PK36MEZN0001234567890123', name: 'ApexStore Pvt Ltd' },
  card: { active: true, gateway: 'Secure Card Gateway', desc: 'Visa / Mastercard accepted' }
};

export const INITIAL_TRANSCRIPT_SETTINGS = {
  title: 'Payment Receipt',
  subtitle: 'Order Confirmation Transcript',
  thanks: 'Thank you for your order! 🎉',
  footer: 'Your payment has been verified successfully.\nPlease keep this receipt for your records.',
  badge: 'Verified',
  watermark: 'ApexStore Receipt',
  allowDownload: true
};

export const INITIAL_STORE_STATE: StoreState = {
  products: FALLBACK_PRODUCTS,
  promos: FALLBACK_PROMOS,
  orders: [],
  sections: FALLBACK_SECTIONS,
  categories: FALLBACK_CATEGORIES,
  users: [],
  gallery: FALLBACK_GALLERY,
  galleryEnabled: true,
  bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80",
  launchPool: [
    {
      id: "lp_1",
      name: "CyberSound Spatial Audio Headset",
      category: "Audio",
      price: 62000,
      oldPrice: 75000,
      stock: 25,
      rating: 4.9,
      reviews: 12,
      badge: "EXCLUSIVE",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
      description: "Next-gen spatial audio headset with planar magnetic drivers."
    },
    {
      id: "lp_2",
      name: "PulseVolt Wireless Charging Station",
      category: "Electronics",
      price: 18500,
      oldPrice: 22000,
      stock: 40,
      rating: 4.8,
      reviews: 8,
      badge: "NEW",
      image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600",
      description: "3-in-1 fast Qi charging station for smartphone, watch, and earbuds."
    }
  ],
  nextLaunchProductId: "lp_1",
  launchConfig: {
    mode: 'public',
    autoLaunch: true,
    totalSeconds: 300,
    secondsLeft: 300,
    isRunning: false
  },
  globalLayout: 'horizontal',
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  customPaymentMethods: [
    {
      id: 101,
      name: "Crypto USDT (TRC-20)",
      desc: "Fast TRC-20 instant confirmation",
      account: "TXg9jX...99aPz",
      accountName: "ApexStore Treasury",
      icon: "fa-coins",
      color: "emerald",
      active: true
    }
  ],
  notifications: [
    {
      id: "notif-1",
      type: "promo",
      icon: "fa-bolt",
      title: "🔥 Flash Weekend Launch",
      desc: "Get ready for the biggest electronic drops this weekend with instant delivery across Pakistan!",
      time: Date.now() - 1000 * 60 * 45,
      active: true,
      sender: "Admin"
    },
    {
      id: "notif-2",
      type: "order",
      icon: "fa-truck-fast",
      title: "🚚 Free Nationwide Shipping",
      desc: "Orders over Rs. 5,000 now qualify for zero delivery charges this month.",
      time: Date.now() - 1000 * 60 * 180,
      active: true,
      sender: "System"
    }
  ],
  transcriptSettings: INITIAL_TRANSCRIPT_SETTINGS,
  storeSettings: {
    name: "ApexStore",
    owner: "Anees Abid",
    email: "ownerofapexstore@gmail.com",
    phone: "+92 345 5724552",
    city: "Rawalpindi / Islamabad",
    whatsapp: "https://whatsapp.com/channel/apexstore"
  },
  announcementSettings: {
    offerText: "FLASH SALE: GET UP TO 30% OFF ON PREMIUM AUDIO GEAR",
    offerCode: "APEX30",
    offerDiscount: 30,
    marqueeShipping: "Free Delivery Nationwide on Orders Over Rs. 5,000",
    marqueeNewArrivals: "New Autumn Collection 2026 Dropped Today",
    marqueeReviews: "Over 5,000+ Happy Customers with 4.9 Star Rating"
  }
};

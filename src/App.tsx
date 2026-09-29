import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminDashboard } from './admin/AdminDashboard';

// Storefront Components from Bittp
import { Splash } from './components/Splash';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { AnnouncementBar } from './components/AnnouncementBar';
import { BannerSection } from './components/BannerSection';
import { LaunchCountdown } from './components/LaunchCountdown';
import { GallerySection } from './components/GallerySection';
import { CategoryChips } from './components/CategoryChips';
import { DynamicSections } from './components/DynamicSections';
import { FloatingCart } from './components/FloatingCart';
import { CartDrawer } from './components/CartDrawer';
import { SearchPanel } from './components/SearchPanel';
import { NotificationModal } from './components/NotificationModal';
import { QuickViewModal } from './components/QuickViewModal';
import { PaymentModal } from './components/PaymentModal';
import { PaymentTimerModal } from './components/PaymentTimerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { FlyingCartParticles } from './components/FlyingCartParticles';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';

// Views
import { AllProductsView } from './components/Views/AllProductsView';
import { SearchResultsView } from './components/Views/SearchResultsView';
import { PromoCodesView } from './components/Views/PromoCodesView';
import { ContactView } from './components/Views/ContactView';
import { AboutView } from './components/Views/AboutView';
import { OrdersView } from './components/Views/OrdersView';

const StorefrontLayout: React.FC = () => {
  const { currentView, featureToggles } = useStore();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex flex-col font-sans selection:bg-purple-600 selection:text-white relative">
      {/* 1. Splash Screen Feature */}
      {featureToggles.splash && <Splash />}

      {/* 2. Global Header */}
      <Header />

      {/* 3. Main View Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            {/* Top Announcement Bar Feature */}
            {featureToggles.announcement && <AnnouncementBar />}

            {/* Hero Banner Section Feature */}
            {featureToggles.banner && <BannerSection />}

            {/* Launch Countdown Drop Timer Feature */}
            {featureToggles.launchCountdown && <LaunchCountdown />}

            {/* Gallery Showcase Feature */}
            {featureToggles.gallery && <GallerySection />}

            {/* Category Filter Chips Feature */}
            {featureToggles.categoryChips && <CategoryChips />}

            {/* Dynamic Product Sections Feature */}
            {featureToggles.dynamicSections && <DynamicSections />}
          </>
        )}

        {currentView === 'all' && <AllProductsView />}
        {currentView === 'search' && <SearchResultsView />}
        {currentView === 'promo' && (
          featureToggles.promoCodes ? <PromoCodesView /> : <AllProductsView />
        )}
        {currentView === 'contact' && <ContactView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'orders' && <OrdersView />}
      </main>

      {/* Footer */}
      <Footer />

      {/* 4. Interactive & Floating Features with Enable/Disable Toggles */}
      {featureToggles.flyingParticles && <FlyingCartParticles />}
      {featureToggles.floatingCart && <FloatingCart />}
      {featureToggles.whatsAppFloat && <WhatsAppFloat />}

      {/* Menus, Cart & Modals */}
      {featureToggles.sideMenu !== false && <SideMenu />}
      <CartDrawer />

      {featureToggles.searchPanel && <SearchPanel />}
      {featureToggles.notifications && <NotificationModal />}
      {featureToggles.quickView && <QuickViewModal />}

      <PaymentModal />
      <PaymentTimerModal />

      {featureToggles.receiptDownload && <ReceiptModal />}
      <AuthModal />
      <AdminModal />
      {featureToggles.aiAssistant && <AIAssistantModal />}

      {/* Toast Alerts */}
      <Toast />
    </div>
  );
};

function resolveModeFromUrl(): 'storefront' | 'admin' {
  if (typeof window === 'undefined') return 'storefront';
  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = (urlParams.get('view') || urlParams.get('mode') || '').toLowerCase();

  if (
    pathname.endsWith('/admin') ||
    pathname.endsWith('/poweradmin') ||
    pathname.endsWith('/power-admin') ||
    viewParam === 'admin' ||
    viewParam === 'poweradmin' ||
    urlParams.has('admin') ||
    urlParams.has('poweradmin') ||
    hash === '#admin' ||
    hash === '#poweradmin'
  ) {
    return 'admin';
  }
  return 'storefront';
}

export default function App() {
  const [appMode, setAppMode] = useState<'storefront' | 'admin'>(resolveModeFromUrl);

  const handleSwitchMode = (mode: 'storefront' | 'admin') => {
    setAppMode(mode);
    try {
      const url = new URL(window.location.href);
      if (mode === 'admin') {
        url.searchParams.set('view', 'admin');
      } else {
        url.pathname = '/';
        url.searchParams.delete('view');
        url.searchParams.delete('mode');
        url.searchParams.delete('admin');
        url.searchParams.delete('poweradmin');
        url.hash = '';
      }
      window.history.pushState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const syncFromUrl = () => setAppMode(resolveModeFromUrl());
    const onCustomSwitch = (e: Event) => {
      const custom = e as CustomEvent<'storefront' | 'admin'>;
      if (custom.detail === 'admin' || custom.detail === 'storefront') {
        handleSwitchMode(custom.detail);
      }
    };
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener('apex_switch_mode', onCustomSwitch);
    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener('apex_switch_mode', onCustomSwitch);
    };
  }, []);

  return (
    <StoreProvider>
      <div className="relative min-h-screen">
        {appMode === 'admin' ? (
          <AdminDashboard onSwitchToStorefront={() => handleSwitchMode('storefront')} />
        ) : (
          <StorefrontLayout />
        )}
      </div>
    </StoreProvider>
  );
}

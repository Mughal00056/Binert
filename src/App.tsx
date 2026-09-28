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

interface StorefrontLayoutProps {
  onOpenAdmin: () => void;
}

const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({ onOpenAdmin }) => {
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
      <SideMenu />
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

export default function App() {
  const [appMode, setAppMode] = useState<'storefront' | 'admin'>(() => {
    // Check URL query param or hash for direct deep-linking
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('view') === 'admin' || urlParams.get('mode') === 'admin' || window.location.hash === '#admin') {
        return 'admin';
      }
      const savedMode = localStorage.getItem('apex_active_app_mode');
      if (savedMode === 'admin') return 'admin';
    }
    return 'storefront';
  });

  const handleSwitchMode = (mode: 'storefront' | 'admin') => {
    setAppMode(mode);
    try {
      localStorage.setItem('apex_active_app_mode', mode);
      const url = new URL(window.location.href);
      url.searchParams.set('view', mode);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onCustomSwitch = (e: Event) => {
      const custom = e as CustomEvent<'storefront' | 'admin'>;
      if (custom.detail === 'admin' || custom.detail === 'storefront') {
        handleSwitchMode(custom.detail);
      }
    };
    window.addEventListener('apex_switch_mode', onCustomSwitch);
    return () => window.removeEventListener('apex_switch_mode', onCustomSwitch);
  }, []);

  return (
    <StoreProvider>
      <div className="relative min-h-screen">
        {/* Standalone Active Mode View */}
        {appMode === 'admin' ? (
          <AdminDashboard onSwitchToStorefront={() => handleSwitchMode('storefront')} />
        ) : (
          <StorefrontLayout onOpenAdmin={() => handleSwitchMode('admin')} />
        )}

        {/* Floating Quick Mode Switcher Dock matching Storefront theme */}
        <div className="fixed bottom-4 left-4 z-50 flex items-center bg-[#13131a]/95 backdrop-blur-md p-1.5 rounded-full border border-purple-500/50 shadow-2xl shadow-purple-950/80 text-xs font-bold">
          <button
            onClick={() => handleSwitchMode('storefront')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              appMode === 'storefront'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-900/50'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-store text-xs" />
            <span>Storefront</span>
          </button>

          <button
            onClick={() => handleSwitchMode('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              appMode === 'admin'
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 text-white shadow-md shadow-purple-900/50'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <i className="fa-solid fa-sliders text-xs" />
            <span>Power Admin</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
        </div>
      </div>
    </StoreProvider>
  );
}

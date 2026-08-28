import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/navigation/Header';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileTabBar } from './components/navigation/MobileTabBar';
import { MobileFAB } from './components/navigation/MobileFAB';
import { LandingPage } from './components/landing/LandingPage';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/dashboard/Dashboard';
import { FuelLog } from './components/fuel-log/FuelLog';
import { DailyTrips } from './components/trips/DailyTrips';
import { Calculator } from './components/calculator/Calculator';
import { Settings } from './components/settings/Settings';
import { ProfileModal } from './components/profile/ProfileModal';
import { FuelPriceModal } from './components/settings/FuelPriceModal';
import { AddFuelModal } from './components/fuel-log/AddFuelModal';
import { AddTripModal } from './components/trips/AddTripModal';
import { motion, AnimatePresence } from 'motion/react';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    activeTab,
    isAddFuelModalOpen,
    setIsAddFuelModalOpen,
    isAddTripModalOpen,
    setIsAddTripModalOpen,
  } = useApp();
  const [authMode, setAuthMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering auth-dependent content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a loading state or landing page during SSR/initial render
    return (
      <LandingPage
        onGetStarted={() => setAuthMode('register')}
        onLogin={() => setAuthMode('login')}
      />
    );
  }

  if (!isAuthenticated) {
    if (authMode === 'login') {
      return (
        <Login
          onSwitchToRegister={() => setAuthMode('register')}
          onBackToLanding={() => setAuthMode('landing')}
        />
      );
    }
    if (authMode === 'register') {
      return (
        <Register
          onSwitchToLogin={() => setAuthMode('login')}
          onBackToLanding={() => setAuthMode('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setAuthMode('register')}
        onLogin={() => setAuthMode('login')}
      />
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'fuel-log':
        return <FuelLog />;
      case 'trips':
        return <DailyTrips />;
      case 'calculator':
        return <Calculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-[#e0e0e0] selection:bg-orange-500/30 selection:text-orange-300">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Viewport with page transitions */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderActiveScreen()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Floating Quick Action Button */}
        <MobileFAB />

        {/* Mobile Fixed Bottom Tab Bar */}
        <MobileTabBar />
      </div>

      {/* Global Modals */}
      <ProfileModal />
      <FuelPriceModal />

      {/* Quick Action Modals when opened outside their parent view */}
      {activeTab !== 'fuel-log' && (
        <AddFuelModal
          isOpen={isAddFuelModalOpen}
          onClose={() => setIsAddFuelModalOpen(false)}
        />
      )}
      {activeTab !== 'trips' && (
        <AddTripModal
          isOpen={isAddTripModalOpen}
          onClose={() => setIsAddTripModalOpen(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

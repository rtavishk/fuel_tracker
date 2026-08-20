import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TabBar } from './components/ui/TabBar';
import { ToastContainer } from './components/ui/Toast';
import { ModalDialog } from './components/ui/ModalDialog';

import { DashboardView } from './components/views/DashboardView';
import { FuelLogView } from './components/views/FuelLogView';
import { TripsView } from './components/views/TripsView';
import { CalculatorView } from './components/views/CalculatorView';
import { SettingsView } from './components/views/SettingsView';

import { FuelEntryForm } from './components/fuel/FuelEntryForm';
import { FuelCompletionModal } from './components/fuel/FuelCompletionModal';
import { TripEntryForm } from './components/trips/TripEntryForm';
import { PreTripForm } from './components/calculator/PreTripForm';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { DriverProfileModal } from './components/auth/DriverProfileModal';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    activeModal,
    setActiveModal,
    editingFuelEntry,
    setEditingFuelEntry,
    completingFuelEntry,
    setCompletingFuelEntry,
    editingTrip,
    setEditingTrip,
    isAuthenticated,
    isLoadingAuth,
  } = useApp();

  const handleCloseModal = () => {
    setActiveModal(null);
    setEditingFuelEntry(null);
    setCompletingFuelEntry(null);
    setEditingTrip(null);
  };

  if (isLoadingAuth) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f5f7fa] dark:bg-[#090d15] text-slate-900 dark:text-slate-100">
        <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Verifying Driver Session...
        </span>
      </div>
    );
  }

  // Require login or register before accessing the application
  if (!isAuthenticated) {
    return (
      <>
        <AuthScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#f2f2f7] dark:bg-[#000000] text-slate-900 dark:text-white flex flex-col antialiased font-sans transition-colors duration-300 select-none">
      {/* iOS Soft Ambient Canvas Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-20 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full bg-rose-500/5 dark:bg-rose-500/10 blur-3xl" />
        <div className="absolute top-1/2 -right-28 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/8 blur-3xl" />
      </div>

      {/* Main View Area - Only components scroll */}
      <main className="relative z-10 flex-1 w-full h-full min-w-0 flex flex-col overflow-y-auto overscroll-contain pb-36 sm:pb-32">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'fuel-log' && <FuelLogView />}
        {activeTab === 'trips' && <TripsView />}
        {activeTab === 'calculator' && <CalculatorView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Apple iOS Tab Bar Dock + Floating Mini Player */}
      <TabBar />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Global Modal Dialogs */}
      {/* 1. Log Fuel Modal */}
      <ModalDialog
        isOpen={activeModal === 'log-fuel'}
        onClose={handleCloseModal}
        title={editingFuelEntry ? 'Edit Fill-Up Record' : 'Log Fuel Fill-Up'}
        subtitle="Track petrol cost, litres pumped, and range cluster readings"
        maxWidth="lg"
      >
        <FuelEntryForm
          initialData={editingFuelEntry}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </ModalDialog>

      {/* 2. Complete Fill-Up Modal */}
      <ModalDialog
        isOpen={activeModal === 'complete-fill' && completingFuelEntry !== null}
        onClose={handleCloseModal}
        title="Complete Fill-up Gauge Reading"
        subtitle="Enter post-fueling range on dash to calculate exact km/L economy"
        maxWidth="md"
      >
        {completingFuelEntry && (
          <FuelCompletionModal
            entry={completingFuelEntry}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        )}
      </ModalDialog>

      {/* 3. Log Daily Trip / Odometer Modal */}
      <ModalDialog
        isOpen={activeModal === 'log-trip'}
        onClose={handleCloseModal}
        title={editingTrip ? 'Edit Daily Odometer' : "Log Daily Vehicle Odometer"}
        subtitle="Log cumulative total odometer to compute daily km & driving cost"
        maxWidth="md"
      >
        <TripEntryForm
          initialData={editingTrip}
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </ModalDialog>

      {/* 4. Pre-Trip Range Check Modal */}
      <ModalDialog
        isOpen={activeModal === 'pre-trip-check'}
        onClose={handleCloseModal}
        title="Pre-Drive Range Check"
        subtitle="Instant snapshot of remaining fuel volume and full tank top-off cost"
        maxWidth="md"
      >
        <PreTripForm
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
        />
      </ModalDialog>

      {/* 5. Driver Portal & Authentication Modal */}
      <ModalDialog
        isOpen={activeModal === 'auth'}
        onClose={handleCloseModal}
        title="Driver Telemetry Portal"
        subtitle="Sign in or register your vehicle profile"
        maxWidth="md"
      >
        <AuthModal
          onClose={handleCloseModal}
        />
      </ModalDialog>

      {/* 6. Authenticated Driver Profile & Telemetry Modal */}
      <ModalDialog
        isOpen={activeModal === 'driver-profile'}
        onClose={handleCloseModal}
        title="Driver Profile & Telemetry"
        subtitle="Driver details, vehicle telemetry summary & session management"
        maxWidth="lg"
      >
        <DriverProfileModal
          onClose={handleCloseModal}
        />
      </ModalDialog>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

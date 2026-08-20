import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Mail,
  Car,
  Fuel,
  LogOut,
  Settings,
  Shield,
  Clock,
  CheckCircle2,
  Calendar,
  Gauge,
  Sparkles,
  TrendingUp,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

interface DriverProfileModalProps {
  onClose: () => void;
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({ onClose }) => {
  const {
    config,
    updateConfig,
    changePassword,
    logout,
    fuelEntries,
    dailyTrips,
    kpis,
    setActiveTab,
    showToast,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [driverName, setDriverName] = useState(config.userName || config.name || 'Driver');
  const [vehicleNickname, setVehicleNickname] = useState(config.name);
  const [isSaving, setIsSaving] = useState(false);

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateConfig({
      userName: driverName.trim(),
      name: vehicleNickname.trim() || config.name,
    });
    setIsSaving(false);
    setIsEditing(false);
    showToast({
      title: 'Profile Updated',
      description: 'Your driver profile details have been saved.',
      type: 'success',
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  const handleNavigateToSettings = () => {
    onClose();
    setActiveTab('settings');
  };

  const handleLogout = async () => {
    onClose();
    await logout();
  };

  const userInitial = (config.userName || config.userEmail || 'D').charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-5" id="driver-profile-modal">
      {/* Driver Identity Card - Monochrome Liquid Glass */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-[22px] bg-neutral-950 text-white border border-white/10 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-xl sm:text-2xl font-black border border-white/20 shrink-0">
                {userInitial}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white text-neutral-950 flex items-center justify-center font-bold text-[10px]" title="Active Session">
                ✓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {config.userName || config.userEmail?.split('@')[0] || 'Driver'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-extrabold border border-white/15 uppercase tracking-wider">
                  Verified Driver
                </span>
              </div>
              <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>{config.userEmail || 'driver@telemetry.local'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setIsChangingPassword(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer shrink-0"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(!isChangingPassword);
                setIsEditing(false);
                setPasswordError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isChangingPassword ? 'Cancel' : 'Change Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <AnimatePresence>
        {isChangingPassword && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleChangePassword}
            className="p-4 rounded-2xl liquid-glass border border-black/10 dark:border-white/10 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                Change Security Password
              </span>
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-neutral-900 dark:text-neutral-100 text-xs font-semibold">
                {passwordError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3 pr-9 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-3 pr-9 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordError(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold transition-all cursor-pointer border border-white/10 dark:border-black/10"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Profile Edit Inline Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSaveProfile}
            className="p-4 rounded-2xl liquid-glass border border-black/10 dark:border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                Edit Driver Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Vehicle Nickname
                </label>
                <input
                  type="text"
                  value={vehicleNickname}
                  onChange={(e) => setVehicleNickname(e.target.value)}
                  placeholder="e.g. My RAV4 Hybrid"
                  className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-xs font-bold transition-all cursor-pointer border border-white/10 dark:border-black/10"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Driver Vehicle Telemetry Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl liquid-glass border border-black/5 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">
            <Car className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            <span>Active Vehicle</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white truncate">
            {config.name}
          </p>
          <span className="text-[10px] text-neutral-400 block truncate">
            {config.powertrain || 'HEV'} · {config.tankCapacityLitres}{config.volumeUnit}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass border border-black/5 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">
            <Fuel className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            <span>Fills Logged</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
            {fuelEntries.length} records
          </p>
          <span className="text-[10px] text-neutral-400 block truncate">
            {kpis.totalLitres.toFixed(1)} {config.volumeUnit} total
          </span>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass border border-black/5 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            <span>Avg Economy</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
            {kpis.avgFuelEconomy > 0 ? `${kpis.avgFuelEconomy.toFixed(1)} ${config.distanceUnit}/${config.volumeUnit}` : '—'}
          </p>
          <span className="text-[10px] text-neutral-400 block truncate">
            Cost: {config.currency}{kpis.avgCostPerKm.toFixed(1)}/{config.distanceUnit}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl liquid-glass border border-black/5 dark:border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-[11px] font-medium">
            <Gauge className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            <span>Trips Tracked</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-neutral-900 dark:text-white">
            {dailyTrips.length} drives
          </p>
          <span className="text-[10px] text-neutral-400 block truncate">
            {kpis.totalDistance.toLocaleString()} {config.distanceUnit} logged
          </span>
        </div>
      </div>

      {/* Vehicle Powertrain Spec Sheet */}
      <div className="p-4 rounded-2xl liquid-glass border border-black/5 dark:border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" />
            Powertrain & Tank Spec
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-extrabold uppercase text-neutral-800 dark:text-neutral-200">
            {config.powertrain || 'HEV'}
          </span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          <strong>Model:</strong> {config.model || 'Universal Hybrid DHT'}<br />
          <strong>Fuel Reservoir:</strong> {config.tankCapacityLitres} {config.volumeUnit} · Benchmark Full Range: {config.fullRangeBenchmarkKm ? `${config.fullRangeBenchmarkKm} ${config.distanceUnit}` : 'Derived from fill logs'}
        </p>
      </div>

      {/* Navigation & Session Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-black/5 dark:border-white/10">
        <button
          type="button"
          onClick={handleNavigateToSettings}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl liquid-glass hover:bg-neutral-500/10 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all border border-black/10 dark:border-white/10 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Vehicle Settings & Calibration</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all border border-black/10 dark:border-white/10 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

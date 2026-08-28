import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { UserAvatar, AVATAR_PRESETS } from '../common/UserAvatar';
import {
  User as UserIcon,
  Shield,
  Key,
  LogOut,
  Sparkles,
  Check,
  AlertCircle,
  Gauge,
  Car,
  Fuel,
  Settings,
  Flame,
  Zap,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Compass,
  Award,
  Link,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProfileModal: React.FC = () => {
  const {
    user,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfile,
    changePassword,
    logout,
    vehicleConfig,
    fuelStats,
    fuelEntries,
    tripEntries,
    iCloudSyncEnabled,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'account'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || 'speedometer');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrlTemp, setCustomUrlTemp] = useState('');
  const [driverTier, setDriverTier] = useState<string>(user?.driverTier || 'Pro');
  const [targetEfficiency, setTargetEfficiency] = useState(
    user?.targetEfficiency?.toString() || '14.5'
  );
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'Rs.');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logout confirm state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setSelectedAvatar(user.avatar || 'speedometer');
      setAvatarUrl(user.avatarUrl || '');
      setDriverTier(user.driverTier || 'Pro');
      setTargetEfficiency(user.targetEfficiency?.toString() || '14.5');
      setPreferredCurrency(user.preferredCurrency || vehicleConfig.currency || 'Rs.');
    }
  }, [user, vehicleConfig.currency, isProfileModalOpen]);

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert('Please choose an image smaller than 2.5 MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        setShowUrlInput(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlTemp.trim()) {
      setAvatarUrl(customUrlTemp.trim());
      setCustomUrlTemp('');
      setShowUrlInput(false);
    }
  };

  const handleClearPhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-cyan-400' };
      case 4:
      default:
        return { score: 4, label: 'Ultra Secure', color: 'bg-emerald-400' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const eff = parseFloat(targetEfficiency);
    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
      avatarUrl: avatarUrl || undefined,
      driverTier: driverTier as any,
      targetEfficiency: !isNaN(eff) && eff > 0 ? eff : 14.5,
      preferredCurrency,
    });
    setProfileSuccessMsg('Profile & Avatar preferences saved!');
    setTimeout(() => setProfileSuccessMsg(''), 3500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setPasswordSuccess('Password successfully updated and encrypted!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3500);
    } else {
      setPasswordError(res.error || 'Failed to change password.');
    }
  };

  const handleLogout = () => {
    setIsProfileModalOpen(false);
    logout();
  };

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      title="Driver Profile & Security"
      subtitle="Customize your profile avatar, automotive bio, password, and driver preferences."
      maxWidth="lg"
    >
      {/* Top Driver Hero Banner */}
      <div className="relative mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#091024] to-[#0a152e] border border-cyan-500/25 shadow-lg shadow-cyan-950/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          {/* Avatar Preview */}
          <div className="relative group">
            <UserAvatar
              user={{
                name,
                avatar: selectedAvatar,
                avatarUrl,
              }}
              size="xl"
              showStatus={true}
              isOnline={true}
              className="shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-500/40"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Custom Photo"
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-md shadow-cyan-500/30 transition-all cursor-pointer ring-2 ring-[#060913]"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {name || 'Vehicle Driver'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {driverTier} Pilot
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">{email}</p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                {vehicleConfig.year} {vehicleConfig.make}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                {fuelEntries.length} Fuel Fills
              </span>
            </div>
          </div>

          {/* Quick Password Jump Button */}
          <div className="shrink-0 flex sm:flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className="px-3 py-1.5 rounded-xl bg-[#0f1b36] hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-[#1e293b] mb-5 gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Profile & Avatar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Security & Password</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'account'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Session & Cloud</span>
        </button>
      </div>

      {/* TAB 1: Profile & Avatar Customizer */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileSuccessMsg && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {/* Avatar Selection Section */}
          <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-200">
                  Select Profile Avatar
                </label>
                <p className="text-[11px] text-slate-400">
                  Choose a telemetry badge, custom photo, or initials monogram.
                </p>
              </div>

              {/* Photo Upload Actions */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] text-[11px] font-semibold text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Link className="w-3 h-3" />
                  <span>Image URL</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    title="Remove custom photo"
                    className="p-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Custom URL Input Accordion */}
            {showUrlInput && (
              <div className="flex gap-2 p-2 rounded-xl bg-[#060913] border border-cyan-500/30">
                <input
                  type="url"
                  value={customUrlTemp}
                  onChange={(e) => setCustomUrlTemp(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="flex-1 px-3 py-1.5 bg-[#0a0f1d] border border-[#1e293b] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Preset Avatar Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
              {AVATAR_PRESETS.map((av) => {
                const isSelected = selectedAvatar === av.id && !avatarUrl;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      setSelectedAvatar(av.id);
                      setAvatarUrl('');
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/40'
                        : 'bg-[#060913] border-[#1e293b] hover:border-slate-600 hover:bg-[#0d1424]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0a0f1d] border border-[#1e293b] flex items-center justify-center">
                      {av.icon('w-4 h-4')}
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                      {av.label}
                    </span>
                  </button>
                );
              })}

              {/* Initials Avatar Tile */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAvatar('initials');
                  setAvatarUrl('');
                }}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedAvatar === 'initials' && !avatarUrl
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/40'
                    : 'bg-[#060913] border-[#1e293b] hover:border-slate-600 hover:bg-[#0d1424]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-xs text-cyan-300">
                  {name ? name.slice(0, 2).toUpperCase() : 'DR'}
                </div>
                <span className="text-[10px] font-medium text-slate-300 truncate w-full text-center">
                  Monogram
                </span>
              </button>
            </div>
          </div>

          {/* Name, Email, & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Driver Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Driver Style Tier & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Driving Style / Tier
              </label>
              <select
                value={driverTier}
                onChange={(e) => setDriverTier(e.target.value)}
                className="w-full px-3 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Pro">Pro Driver</option>
                <option value="Eco Master">Eco Master (Efficiency Focused)</option>
                <option value="Speedster">Performance / Track Pilot</option>
                <option value="Fleet Manager">Fleet & Commuter Lead</option>
                <option value="Standard">Daily Cruiser</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Automotive Bio / Garage Note
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Daily commuter & weekend canyon runner"
                className="w-full px-3 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Target Efficiency & Preferred Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                Target Fuel Economy Benchmark
              </label>
              <p className="text-[11px] text-slate-400">
                Baseline economy rating for predictive range calculations.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={targetEfficiency}
                  onChange={(e) => setTargetEfficiency(e.target.value)}
                  placeholder="14.5"
                  className="w-full px-3 py-1.5 bg-[#060913] border border-[#1e293b] rounded-lg text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400"
                />
                <span className="text-xs text-slate-400 font-mono shrink-0">
                  {vehicleConfig.distanceUnit}/{vehicleConfig.volumeUnit}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] space-y-1">
              <label className="block text-xs font-semibold text-slate-200">
                Preferred Currency Symbol
              </label>
              <p className="text-[11px] text-slate-400">
                Default symbol displayed across financial metrics.
              </p>
              <input
                type="text"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                placeholder="Rs., $, €, £, ₹"
                className="w-full px-3 py-1.5 bg-[#060913] border border-[#1e293b] rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400 mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Save Profile & Avatar
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Password Management */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-[#0a0f1d] border border-[#1e293b] space-y-3.5">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b]">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Update Account Password</span>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Live Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-mono">Password Strength:</span>
                    <span className="font-bold text-slate-200">{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#060913] rounded-full overflow-hidden flex gap-1 border border-[#1e293b]">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 transition-all ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-[#060913]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-9 pr-10 py-2 bg-[#060913] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {confirmPassword && newPassword && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e293b] text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS / Salted Encryption</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Your password protects your vehicle logs, cloud backups, and predictive cost algorithms.
            </p>
          </div>

          <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Profile
            </button>
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {isChangingPass ? 'Encrypting & Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Account & Session */}
      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-[#1e293b] space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]">
              <span className="text-xs text-slate-400">Account Status:</span>
              <span className="text-xs font-bold font-mono text-cyan-300 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                {user?.isDemoUser ? 'Demo Sandbox Driver' : 'Authenticated Pro Pilot'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Driver ID:</span>
              <span className="text-xs font-mono text-slate-300">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Cloud Sync:</span>
              <span className="text-xs font-mono text-cyan-400">
                {iCloudSyncEnabled ? 'PostgreSQL Cloud Synced' : 'Local Storage Mode'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Registered On:</span>
              <span className="text-xs font-mono text-slate-300">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>

          {/* Log Out Section */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
            <div className="flex items-start gap-2.5">
              <LogOut className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-300">Sign Out of Fuel Tracker</h4>
                <p className="text-[11px] text-rose-200/80 mt-0.5 leading-snug">
                  You can sign back in anytime. Your odometer records and analytics remain securely stored.
                </p>
              </div>
            </div>

            {showLogoutConfirm ? (
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Yes, Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-3 py-2 rounded-xl bg-[#0f172a] text-slate-300 text-xs hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

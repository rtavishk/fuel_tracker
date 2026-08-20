import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Car,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
  onClose: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSwitchToLogin,
  onSuccess,
  onClose,
}) => {
  const { registerUser } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleModel, setVehicleModel] = useState('Toyota Prius / RAV4 Hybrid (HEV)');
  const [customVehicle, setCustomVehicle] = useState('');
  const [tankCapacityInput, setTankCapacityInput] = useState('50');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Password strength calculation - Monochrome
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'None', width: '0%' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', width: '25%' };
      case 2:
        return { score: 50, label: 'Fair', width: '50%' };
      case 3:
        return { score: 75, label: 'Good', width: '75%' };
      case 4:
        return { score: 100, label: 'Strong', width: '100%' };
      default:
        return { score: 15, label: 'Very Weak', width: '15%' };
    }
  }, [password]);

  const passwordsMatch = Boolean(confirmPassword && password === confirmPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Driver name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please accept the Terms & Privacy Policy to continue';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    const finalModel = vehicleModel === 'Custom Vehicle' ? (customVehicle.trim() || 'Custom Hybrid') : vehicleModel;
    const finalTank = parseFloat(tankCapacityInput) || 50;

    const res = await registerUser({
      email,
      password,
      name: fullName,
      vehicleName: `${fullName}'s ${finalModel.split(' ')[0]}`,
      tankCapacity: finalTank,
      model: finalModel,
    });
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrors({ general: res.error || 'Failed to create account.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="signup-form">
      {errors.general && (
        <div className="p-3 rounded-2xl liquid-glass bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold backdrop-blur-xl">
          {errors.general}
        </div>
      )}

      {/* Full Name & Driver Handle */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          Driver Name
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <User className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -trangray-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type="text"
            id="signup-name-input"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            placeholder="e.g. Alex Morgan"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.fullName
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-300/50 dark:focus:border-blue-400/30'
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.fullName}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -trangray-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type="email"
            id="signup-email-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="driver@domain.com"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-300/50 dark:focus:border-blue-400/30'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.email}</p>
        )}
      </div>

      {/* Vehicle Model Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
          Vehicle Model
        </label>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Car className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -trangray-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <select
            id="signup-vehicle-select"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl liquid-glass text-xs sm:text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer focus:ring-blue-500/30 dark:focus:ring-blue-400/30 focus:border-blue-300/50 dark:focus:border-blue-400/30"
          >
            <option value="Toyota Prius / RAV4 Hybrid (HEV)">Toyota Hybrid (HEV · 43-55L)</option>
            <option value="Honda CR-V / Civic e:HEV">Honda e:HEV (HEV · 40-53L)</option>
            <option value="BAIC BJ30e Dual-Motor Hybrid">BAIC BJ30e Hybrid (52L)</option>
            <option value="Custom Vehicle">Custom Vehicle</option>
          </select>
        </div>
      </div>

      {vehicleModel === 'Custom Vehicle' && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Vehicle Model
            </label>
            <input
              type="text"
              id="signup-custom-model"
              value={customVehicle}
              onChange={(e) => setCustomVehicle(e.target.value)}
              placeholder="e.g. Nissan e-POWER"
              className="w-full px-3 py-2.5 rounded-xl liquid-glass text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
              Tank Size (L)
            </label>
            <input
              type="number"
              id="signup-custom-tank"
              value={tankCapacityInput}
              onChange={(e) => setTankCapacityInput(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2.5 rounded-xl liquid-glass text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30"
            />
          </div>
        </div>
      )}

      {/* Password with Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Password
          </label>
          {password && (
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
              Strength: {passwordStrength.label}
            </span>
          )}
        </div>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-password-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Min. 8 characters"
            className={`w-full pl-10 pr-10 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-400/50 dark:focus:ring-white/30 focus:border-blue-300/50 dark:focus:border-white/30'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter bar */}
        {password && (
          <div className="pt-1 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${passwordStrength.score}%` }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-full bg-blue-500 dark:bg-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10.5px] text-gray-500 dark:text-gray-400">
              <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-gray-900 dark:text-white font-semibold' : ''}`}>
                <span className="text-[12px]">{password.length >= 8 ? '✓' : '•'}</span> 8+ characters
              </span>
              <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-gray-900 dark:text-white font-semibold' : ''}`}>
                <span className="text-[12px]">{/[0-9]/.test(password) ? '✓' : '•'}</span> Contains number
              </span>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Confirm Password
          </label>
          {confirmPassword && (
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
            </span>
          )}
        </div>
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -trangray-y-1/2 pointer-events-none transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-confirm-password-input"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Re-type your password"
            className={`w-full pl-10 pr-4 py-3 rounded-2xl liquid-glass text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? 'ring-2 ring-red-500/50 border-red-500/30'
                : 'focus:ring-blue-400/50 dark:focus:ring-white/30 focus:border-blue-300/50 dark:focus:border-white/30'
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Privacy Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
            }}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-xl mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
              agreedToTerms
                ? 'bg-blue-500 dark:bg-blue-400 border-blue-500 dark:border-blue-400 text-white shadow-md'
                : 'border-gray-300 dark:border-gray-600 bg-gray-100/50 dark:bg-white/5'
            }`}
          >
            {agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            I agree to the{' '}
            <span className="font-semibold text-gray-900 dark:text-white hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-semibold text-gray-900 dark:text-white hover:underline">
              Privacy Policy
            </span>
          </span>
        </label>
        {errors.terms && (
          <p className="text-[11px] font-medium text-red-500 mt-1 pl-1">{errors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        id="signup-submit-button"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 border border-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Switch to Sign In */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          Already have an account? <span className="underline decoration-gray-400 dark:decoration-gray-600 underline-offset-2">Sign in</span>
        </button>
      </div>
    </form>
  );
};

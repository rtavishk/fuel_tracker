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
    <form onSubmit={handleSubmit} className="space-y-3.5" id="signup-form">
      {errors.general && (
        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-neutral-100 text-xs font-semibold">
          {errors.general}
        </div>
      )}

      {/* Full Name & Driver Handle */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Driver Name or Call-Sign
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            id="signup-name-input"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
            }}
            placeholder="e.g. Alex Morgan"
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all ${
              errors.fullName
                ? 'ring-1 ring-neutral-900 dark:ring-white'
                : 'focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white'
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 pl-1">{errors.fullName}</p>
        )}
      </div>

      {/* Email Address */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            id="signup-email-input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="driver@domain.com"
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all ${
              errors.email
                ? 'ring-1 ring-neutral-900 dark:ring-white'
                : 'focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 pl-1">{errors.email}</p>
        )}
      </div>

      {/* Vehicle Model Selector */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
          Vehicle Make / Powertrain
        </label>
        <div className="relative">
          <Car className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="signup-vehicle-select"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl liquid-glass text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white appearance-none cursor-pointer"
          >
            <option value="Toyota Prius / Corolla / RAV4 Hybrid (HEV)">Toyota Hybrid Series (HEV · 43-55L)</option>
            <option value="Honda CR-V / Accord / Civic e:HEV">Honda e:HEV Dual-Motor (HEV · 40-53L)</option>
            <option value="BYD Seal / Song Plus / Sealion DM-i">BYD Super Hybrid DM-i (PHEV · 48-60L)</option>
            <option value="Hyundai Tucson / Santa Fe / Ioniq Hybrid">Hyundai / Kia Smartstream Hybrid (HEV · 45-54L)</option>
            <option value="Ford Maverick / Escape / Kuga Hybrid">Ford Hybrid / PHEV (42-57L)</option>
            <option value="Lexus NX / RX / ES Hybrid Drive">Lexus Self-Charging Hybrid (50-65L)</option>
            <option value="BAIC BJ30e Dual-Motor Hybrid DHT">BAIC BJ30e 1.5T DHT Hybrid (52L)</option>
            <option value="Kia Niro / Sportage / Sorento Hybrid">Kia Hybrid / PHEV Series</option>
            <option value="Custom Vehicle">Custom Vehicle (Any Car / Make / Model)</option>
          </select>
        </div>
      </div>

      {vehicleModel === 'Custom Vehicle' && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Car Make & Model
            </label>
            <input
              type="text"
              id="signup-custom-model"
              value={customVehicle}
              onChange={(e) => setCustomVehicle(e.target.value)}
              placeholder="e.g. Nissan e-POWER / BMW 330e"
              className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
              Fuel Tank Size (L)
            </label>
            <input
              type="number"
              id="signup-custom-tank"
              value={tankCapacityInput}
              onChange={(e) => setTankCapacityInput(e.target.value)}
              placeholder="50"
              className="w-full px-3 py-2 rounded-xl liquid-glass text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white"
            />
          </div>
        </div>
      )}

      {/* Password with Strength Meter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Create Password
          </label>
          {password && (
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">
              Strength: {passwordStrength.label}
            </span>
          )}
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-password-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            placeholder="Min. 8 characters"
            className={`w-full pl-10 pr-10 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all ${
              errors.password
                ? 'ring-1 ring-neutral-900 dark:ring-white'
                : 'focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter bar */}
        {password && (
          <div className="pt-1 space-y-1.5">
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${passwordStrength.score}%` }}
                transition={{ duration: 0.25 }}
                className="h-full rounded-full bg-neutral-900 dark:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[10.5px] text-neutral-500 dark:text-neutral-400">
              <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-neutral-900 dark:text-white font-semibold' : ''}`}>
                <span className="text-[12px]">{password.length >= 8 ? '✓' : '•'}</span> 8+ characters
              </span>
              <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-neutral-900 dark:text-white font-semibold' : ''}`}>
                <span className="text-[12px]">{/[0-9]/.test(password) ? '✓' : '•'}</span> Contains number
              </span>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 pl-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Confirm Password
          </label>
          {confirmPassword && (
            <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
              {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
            </span>
          )}
        </div>
        <div className="relative">
          <Shield className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-confirm-password-input"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            placeholder="Re-type your password"
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl liquid-glass text-sm font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none transition-all ${
              errors.confirmPassword
                ? 'ring-1 ring-neutral-900 dark:ring-white'
                : 'focus:ring-1 focus:ring-neutral-400 dark:focus:ring-white'
            }`}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 pl-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Privacy Checkbox */}
      <div className="pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
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
            className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center border transition-all shrink-0 ${
              agreedToTerms
                ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900 shadow-xs'
                : 'border-neutral-300 dark:border-neutral-700 bg-black/5 dark:bg-white/5'
            }`}
          >
            {agreedToTerms && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            I agree to the{' '}
            <span className="font-semibold text-neutral-900 dark:text-white hover:underline">
              Telemetry Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-semibold text-neutral-900 dark:text-white hover:underline">
              Privacy Policy
            </span>
          </span>
        </label>
        {errors.terms && (
          <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 pl-1">{errors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        id="signup-submit-button"
        disabled={isLoading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 text-sm font-bold shadow-md border border-white/10 dark:border-black/10 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-2"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Create Driver Profile</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </motion.button>

      {/* Switch to Sign In */}
      <div className="pt-2 text-center">
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-neutral-900 dark:text-white hover:underline cursor-pointer ml-1"
          >
            Sign In Instead
          </button>
        </p>
      </div>
    </form>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Gauge,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { getSupabaseClient } from '../../lib/supabase';
import { VehicleConfig } from '../../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onBackToLanding?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onBackToLanding }) => {
  const { register, addVehicle, updateVehicleConfig } = useApp();

  // Wizard Step (1: Account Details, 2: Vehicle Specs)
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: User Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Vehicle Configuration
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Corolla');
  const [vehicleYear, setVehicleYear] = useState('2024');
  const [licensePlate, setLicensePlate] = useState('');
  const [fuelType, setFuelType] = useState('Petrol (95)');
  const [tankCapacity, setTankCapacity] = useState('47');
  const [benchmarkRange, setBenchmarkRange] = useState('680');
  const [initialOdo, setInitialOdo] = useState('0');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>('km');
  const [currencySymbol, setCurrencySymbol] = useState('Rs.');
  const [fuelPrice, setFuelPrice] = useState('106.5');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-zinc-700' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-teal-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const handleStepOneNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    // Auto-suggest vehicle nickname
    if (!vehicleName) {
      setVehicleName(`${vehicleMake} ${vehicleModel}`);
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const tankCapNum = parseFloat(tankCapacity) || 47;
    const benchRangeNum = parseFloat(benchmarkRange) || 680;
    const initialOdoNum = parseFloat(initialOdo) || 0;
    const gasPriceNum = parseFloat(fuelPrice) || 106.5;

    try {
      const supabase = getSupabaseClient();
      let createdUserId = uuidv4();

      // 1. Supabase Auth signup if available
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
              driver_tier: 'Pro',
            },
          },
        });

        if (authError) {
          setError(authError.message);
          setIsLoading(false);
          return;
        }

        if (authData.user?.id) {
          createdUserId = authData.user.id;
        }
      }

      // 2. Prepare vehicle payload
      const initialVehicle: VehicleConfig = {
        id: uuidv4(),
        name: vehicleName.trim() || `${vehicleMake} ${vehicleModel}`,
        make: vehicleMake.trim(),
        model: vehicleModel.trim(),
        year: parseInt(vehicleYear, 10) || new Date().getFullYear(),
        licensePlate: licensePlate.trim().toUpperCase() || undefined,
        fuelType: fuelType,
        tankCapacityLitres: tankCapNum,
        fullRangeBenchmarkKm: benchRangeNum,
        currentCumulativeOdometer: initialOdoNum,
        currency: currencySymbol,
        distanceUnit: distanceUnit,
        volumeUnit: distanceUnit === 'km' ? 'L' : 'gal',
        currentFuelPrice: gasPriceNum,
      };

      // 3. Register user via API with vehicle data
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          name: name.trim(),
          vehicle: {
            name: initialVehicle.name,
            make: initialVehicle.make,
            model: initialVehicle.model,
            year: initialVehicle.year,
            licensePlate: initialVehicle.licensePlate,
            tankCapacityLitres: initialVehicle.tankCapacityLitres,
            fullRangeBenchmarkKm: initialVehicle.fullRangeBenchmarkKm,
            currentCumulativeOdometer: initialVehicle.currentCumulativeOdometer,
            fuelType: initialVehicle.fuelType,
            currency: currencySymbol,
            distanceUnit: distanceUnit,
            volumeUnit: distanceUnit === 'km' ? 'L' : 'gal',
          },
        }),
      });

      // Check if response is JSON before parsing
      const contentType = registerResponse.headers.get('content-type');
      console.log('Register response status:', registerResponse.status, 'content-type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await registerResponse.text();
        console.error('Non-JSON response from register API:', text.substring(0, 200));
        setError('Server returned non-JSON response. This might be a deployment issue.');
        setIsLoading(false);
        return;
      }

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        setError(errorData.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return; // Stop here - don't proceed with local registration
      }

      const registerData = await registerResponse.json();
      
      // 4. Register user locally in context with returned data
      const registerSuccess = await register(name.trim(), email.trim(), password);
      
      if (!registerSuccess) {
        setError('Registration failed. Please try again.');
        setIsLoading(false);
        return; // Stop here - don't proceed with vehicle creation
      }

      // 5. Update initial vehicle config and add to garage
      updateVehicleConfig({
        name: initialVehicle.name,
        make: initialVehicle.make,
        model: initialVehicle.model,
        year: initialVehicle.year,
        fuelType: initialVehicle.fuelType,
        tankCapacityLitres: initialVehicle.tankCapacityLitres,
        fullRangeBenchmarkKm: initialVehicle.fullRangeBenchmarkKm,
        currentCumulativeOdometer: initialVehicle.currentCumulativeOdometer,
        distanceUnit: distanceUnit,
        volumeUnit: distanceUnit === 'km' ? 'L' : 'gal',
        currency: currencySymbol,
        currentFuelPrice: gasPriceNum,
      });

      addVehicle(initialVehicle);

      // 6. Try inserting initial vehicle record to Supabase if connected
      if (supabase) {
        try {
          await supabase.from('vehicles').insert([
            {
              id: initialVehicle.id,
              user_id: createdUserId,
              name: initialVehicle.name,
              make: initialVehicle.make,
              model: initialVehicle.model,
              year: initialVehicle.year,
              license_plate: initialVehicle.licensePlate,
              fuel_type: initialVehicle.fuelType,
              tank_capacity: initialVehicle.tankCapacityLitres,
              full_range_benchmark: initialVehicle.fullRangeBenchmarkKm,
              current_odometer: initialVehicle.currentCumulativeOdometer,
              distance_unit: initialVehicle.distanceUnit,
              volume_unit: initialVehicle.volumeUnit,
              economy_unit: initialVehicle.distanceUnit === 'km' ? 'km/L' : 'mpg',
              currency: initialVehicle.currency,
              created_at: new Date().toISOString(),
            },
          ]);
        } catch (dbErr) {
          console.warn('Could not insert initial vehicle to Supabase:', dbErr);
        }
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || 'Could not complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b] text-zinc-200 relative overflow-x-hidden w-full max-w-full selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10 my-6"
      >
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing</span>
          </button>
        )}

        {/* App Branding */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-emerald-500 text-black font-black shadow-xl shadow-emerald-500/25 mb-2.5 ring-1 ring-emerald-300/40">
            <Gauge className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-sans">
            Create Driver Account
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Setup your personal vehicle profile with automated mileage & gas analytics
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              step === 1
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#121215] text-zinc-400 border border-zinc-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-emerald-400 text-black flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span>Driver Profile</span>
          </div>
          <div className="w-8 h-px bg-zinc-800" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              step === 2
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-[#121215] text-zinc-400 border border-zinc-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Garage Setup</span>
          </div>
        </div>

        <Card className="p-5 sm:p-7 border-zinc-800 bg-[#121215]/95 shadow-2xl backdrop-blur-2xl shadow-black/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStepOneNext}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-400 font-mono">Strength:</span>
                        <span className="font-bold text-zinc-200">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#09090b] rounded-full overflow-hidden flex gap-1 border border-zinc-800">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.score ? passwordStrength.color : 'bg-[#09090b]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Garage Setup</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleFinalSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Make</label>
                    <input
                      type="text"
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      placeholder="e.g. Toyota"
                      required
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Model</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Corolla"
                      required
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Year</label>
                    <input
                      type="number"
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      min="1980"
                      max="2035"
                      required
                      className="w-full px-2.5 sm:px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-2 sm:px-2.5 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="Petrol (95)">Petrol 95</option>
                      <option value="Petrol (91)">Petrol 91</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">License Plate</label>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="ABC-1234"
                      className="w-full px-2.5 sm:px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Tank Capacity ({distanceUnit === 'km' ? 'Litres' : 'Gallons'})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={tankCapacity}
                      onChange={(e) => setTankCapacity(e.target.value)}
                      placeholder="47"
                      required
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Full Tank Range ({distanceUnit})
                    </label>
                    <input
                      type="number"
                      step="1"
                      inputMode="decimal"
                      value={benchmarkRange}
                      onChange={(e) => setBenchmarkRange(e.target.value)}
                      placeholder="680"
                      required
                      className="w-full px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Odometer
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={initialOdo}
                      onChange={(e) => setInitialOdo(e.target.value)}
                      placeholder="0"
                      className="w-full px-2.5 sm:px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Currency</label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      placeholder="Rs. or $"
                      className="w-full px-2.5 sm:px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Gas Price</label>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={fuelPrice}
                      onChange={(e) => setFuelPrice(e.target.value)}
                      placeholder="106.50"
                      className="w-full px-2.5 sm:px-3 py-2 bg-[#09090b] border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setStep(1);
                    }}
                    className="py-2.5 sm:py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-black font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Finish & Enter Garage</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-400">
              Already have a registered vehicle?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-emerald-400 font-semibold hover:underline hover:text-emerald-300 cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </Card>

        {/* Security Footer */}
        <div className="mt-5 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            TLS / SSL Encrypted
          </span>
          <span>•</span>
          <span>PostgreSQL Architecture</span>
          <span>•</span>
          <span>Zero Hardcoded Data</span>
        </div>
      </motion.div>
    </div>
  );
};

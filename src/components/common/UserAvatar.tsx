import React from 'react';
import {
  Gauge,
  Flame,
  Car,
  Zap,
  User as UserIcon,
  Fuel,
  Trophy,
  Compass,
  ShieldCheck,
  Wrench,
  Star,
  Disc,
} from 'lucide-react';
import { User } from '../../types';

export interface AvatarOption {
  id: string;
  label: string;
  category: 'Telemetry' | 'Performance' | 'Driver';
  bgGradient: string;
  borderClass: string;
  iconColor: string;
  icon: (className?: string) => React.ReactNode;
}

export const AVATAR_PRESETS: AvatarOption[] = [
  {
    id: 'speedometer',
    label: 'Telemetry HUD',
    category: 'Telemetry',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    borderClass: 'border-cyan-500/40 text-cyan-400',
    iconColor: 'text-cyan-400',
    icon: (c = 'w-5 h-5') => <Gauge className={`${c} text-cyan-400`} />,
  },
  {
    id: 'turbo',
    label: 'Turbo Flame',
    category: 'Performance',
    bgGradient: 'from-amber-500/20 to-orange-600/20',
    borderClass: 'border-amber-500/40 text-amber-400',
    iconColor: 'text-amber-400',
    icon: (c = 'w-5 h-5') => <Flame className={`${c} text-amber-400`} />,
  },
  {
    id: 'sports-car',
    label: 'Apex GT',
    category: 'Performance',
    bgGradient: 'from-emerald-500/20 to-teal-600/20',
    borderClass: 'border-emerald-500/40 text-emerald-400',
    iconColor: 'text-emerald-400',
    icon: (c = 'w-5 h-5') => <Car className={`${c} text-emerald-400`} />,
  },
  {
    id: 'electric',
    label: 'Eco Spark',
    category: 'Telemetry',
    bgGradient: 'from-yellow-500/20 to-amber-600/20',
    borderClass: 'border-yellow-500/40 text-yellow-400',
    iconColor: 'text-yellow-400',
    icon: (c = 'w-5 h-5') => <Zap className={`${c} text-yellow-400`} />,
  },
  {
    id: 'driver',
    label: 'Pro Pilot',
    category: 'Driver',
    bgGradient: 'from-sky-500/20 to-indigo-600/20',
    borderClass: 'border-sky-500/40 text-sky-300',
    iconColor: 'text-sky-300',
    icon: (c = 'w-5 h-5') => <UserIcon className={`${c} text-sky-300`} />,
  },
  {
    id: 'fuel-pump',
    label: 'Pump Master',
    category: 'Telemetry',
    bgGradient: 'from-cyan-500/20 to-sky-600/20',
    borderClass: 'border-cyan-500/40 text-cyan-400',
    iconColor: 'text-cyan-400',
    icon: (c = 'w-5 h-5') => <Fuel className={`${c} text-cyan-400`} />,
  },
  {
    id: 'trophy',
    label: 'Podium Racer',
    category: 'Performance',
    bgGradient: 'from-yellow-400/20 to-amber-500/20',
    borderClass: 'border-amber-400/40 text-amber-300',
    iconColor: 'text-amber-300',
    icon: (c = 'w-5 h-5') => <Trophy className={`${c} text-amber-300`} />,
  },
  {
    id: 'compass',
    label: 'Navigator',
    category: 'Driver',
    bgGradient: 'from-teal-500/20 to-cyan-600/20',
    borderClass: 'border-teal-500/40 text-teal-300',
    iconColor: 'text-teal-300',
    icon: (c = 'w-5 h-5') => <Compass className={`${c} text-teal-300`} />,
  },
  {
    id: 'shield',
    label: 'Security Guard',
    category: 'Driver',
    bgGradient: 'from-violet-500/20 to-purple-600/20',
    borderClass: 'border-violet-500/40 text-violet-400',
    iconColor: 'text-violet-400',
    icon: (c = 'w-5 h-5') => <ShieldCheck className={`${c} text-violet-400`} />,
  },
  {
    id: 'wrench',
    label: 'Master Tuner',
    category: 'Performance',
    bgGradient: 'from-rose-500/20 to-orange-600/20',
    borderClass: 'border-rose-500/40 text-rose-400',
    iconColor: 'text-rose-400',
    icon: (c = 'w-5 h-5') => <Wrench className={`${c} text-rose-400`} />,
  },
  {
    id: 'apex',
    label: 'Alloy Wheel',
    category: 'Performance',
    bgGradient: 'from-blue-500/20 to-indigo-600/20',
    borderClass: 'border-blue-500/40 text-blue-400',
    iconColor: 'text-blue-400',
    icon: (c = 'w-5 h-5') => <Disc className={`${c} text-blue-400`} />,
  },
  {
    id: 'star',
    label: 'VIP Pilot',
    category: 'Driver',
    bgGradient: 'from-cyan-400/20 to-emerald-500/20',
    borderClass: 'border-cyan-400/40 text-cyan-300',
    iconColor: 'text-cyan-300',
    icon: (c = 'w-5 h-5') => <Star className={`${c} text-cyan-300`} />,
  },
];

export interface UserAvatarProps {
  user?: Partial<User> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  avatarId?: string;
  avatarUrl?: string;
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  avatarId,
  avatarUrl,
  className = '',
  showStatus = false,
  isOnline = true,
  onClick,
}) => {
  const activeAvatarId = avatarId || user?.avatar || 'speedometer';
  const customPhotoUrl = avatarUrl || user?.avatarUrl;
  const userName = user?.name || 'Driver';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-4.5 h-4.5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-12 h-12',
  };

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0 ring-1',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-2',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2',
    xl: 'w-3.5 h-3.5 bottom-1 right-1 ring-2',
    '2xl': 'w-4 h-4 bottom-1.5 right-1.5 ring-3',
  };

  const preset = AVATAR_PRESETS.find((p) => p.id === activeAvatarId) || AVATAR_PRESETS[0];

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'D';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <div
        className={`rounded-xl overflow-hidden flex items-center justify-center font-bold transition-all ${
          sizeClasses[size]
        } ${
          customPhotoUrl
            ? 'bg-[#0a0f1d] border border-cyan-500/40 ring-1 ring-cyan-500/20'
            : `bg-gradient-to-br ${preset.bgGradient} bg-[#0b1120] border ${preset.borderClass}`
        } ${onClick ? 'group-hover:ring-2 group-hover:ring-cyan-400/50 group-hover:scale-[1.02]' : ''}`}
      >
        {customPhotoUrl ? (
          <img
            src={customPhotoUrl}
            alt={userName}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              // Fallback to preset if image URL is invalid
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : activeAvatarId === 'initials' ? (
          <span className="font-mono text-cyan-300 font-black tracking-tighter">
            {getInitials(userName)}
          </span>
        ) : (
          preset.icon(iconSizes[size])
        )}
      </div>

      {showStatus && (
        <span
          className={`absolute rounded-full ring-[#060913] ${statusDotSizes[size]} ${
            isOnline
              ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
              : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};

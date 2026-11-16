import type React from 'react';
import {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Truck,
  Cpu,
  Zap,
} from 'lucide-react';

const AREA_ICONS: Record<string, React.FC<{ className?: string }>> = {
  CircleDollarSign,
  Megaphone,
  Receipt,
  Users,
  Boxes,
  MessageSquare,
  Shield,
  Truck,
  Cpu,
  Zap,
};

export function getAreaIcon(iconName: string): React.FC<{ className?: string }> {
  return AREA_ICONS[iconName] || CircleDollarSign;
}

const PRICING_BADGES: Record<string, string> = {
  open_source: 'bg-purple-100 text-purple-900 border-purple-200',
  free: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  freemium: 'bg-blue-100 text-blue-900 border-blue-200',
  paid_low_cost: 'bg-amber-100 text-amber-900 border-amber-200',
};

export function getPricingBadge(pricingType: string): string {
  return PRICING_BADGES[pricingType] || 'bg-gray-100 text-gray-800 border-gray-200';
}

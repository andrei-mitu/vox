import { LayoutDashboard, Package, Users, Truck, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Shipments', href: '/shipments', icon: Package },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Carriers', href: '/carriers', icon: Truck },
];

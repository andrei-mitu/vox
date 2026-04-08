import { LayoutDashboard, type LucideIcon, Package, Truck, Users } from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export function getNavItems(workspaceSlug: string): NavItem[] {
    return [
        { label: 'Dashboard', href: `/${workspaceSlug}/dashboard`, icon: LayoutDashboard },
        { label: 'Shipments', href: `/${workspaceSlug}/shipments`, icon: Package },
        { label: 'Clients', href: `/${workspaceSlug}/clients`, icon: Users },
        { label: 'Carriers', href: `/${workspaceSlug}/carriers`, icon: Truck },
    ];
}

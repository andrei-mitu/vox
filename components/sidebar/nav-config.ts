import {
    LayoutDashboard,
    type LucideIcon,
    MapPin,
    Route,
    Truck,
    Users,
} from 'lucide-react';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export function getNavItems(workspaceSlug: string): NavItem[] {
    return [
        { label: 'Dashboard', href: `/${ workspaceSlug }/dashboard`, icon: LayoutDashboard },
        { label: 'Trips', href: `/${ workspaceSlug }/trips`, icon: MapPin },
        { label: 'Routes', href: `/${ workspaceSlug }/routes`, icon: Route },
        { label: 'Carriers', href: `/${ workspaceSlug }/carriers`, icon: Truck },
        { label: 'Clients', href: `/${ workspaceSlug }/clients`, icon: Users },
    ];
}

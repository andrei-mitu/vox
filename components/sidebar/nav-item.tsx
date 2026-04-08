'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {Tooltip} from '@radix-ui/themes';
import {cn} from '@/lib/utils';
import type {NavItem} from './nav-config';

interface SidebarNavItemProps {
    item: NavItem;
    collapsed: boolean;
}

export function SidebarNavItem({item, collapsed}: SidebarNavItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
    const Icon = item.icon;

    const linkClass = cn(
        'flex items-center w-full rounded-lg transition-colors duration-150',
        collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
        isActive
            ? 'bg-accent-muted text-accent-primary'
            : 'text-text-secondary hover:bg-background-muted hover:text-text-primary'
    );

    const inner = (
        <>
            <Icon size={18} className="shrink-0"/>
            {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
            )}
        </>
    );

    if (collapsed) {
        return (
            <Tooltip content={item.label} side="right">
                <Link href={item.href} className={linkClass} aria-label={item.label}>
                    {inner}
                </Link>
            </Tooltip>
        );
    }

    return (
        <Link href={item.href} className={linkClass}>
            {inner}
        </Link>
    );
}

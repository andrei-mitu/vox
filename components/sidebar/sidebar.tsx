'use client';

import { useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LogOut, Plus } from 'lucide-react';
import { Tooltip } from '@radix-ui/themes';
import { getNavItems } from './nav-config';
import { SidebarNavItem } from './nav-item';
import { ThemeToggleButton } from '@/components/theme/theme-toggle';
import { VoxLogo } from '@/components/ui/vox-logo';
import { cn } from '@/lib/utils';

interface SidebarProps {
    user: {
        email: string | undefined;
        id: string;
    };
    workspace: {
        slug: string;
        name: string;
    };
}

export function Sidebar({ user, workspace }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    useLayoutEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    }, []);

    const toggle = () => {
        setCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar-collapsed', String(next));
            return next;
        });
    };

    const initials = user.email?.[0]?.toUpperCase() ?? '?';
    const navItems = getNavItems(workspace.slug);
    const dashboardHref = `/${workspace.slug}/dashboard`;
    const newShipmentHref = `/${workspace.slug}/shipments/new`;

    return (
        <aside
            className={cn(
                'relative flex flex-col shrink-0 h-screen overflow-hidden',
                'bg-background-secondary border-r border-border-default',
                'transition-[width] duration-200 ease-out',
                collapsed ? 'w-16' : 'w-60'
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    'flex items-center h-14 shrink-0 px-3',
                    'border-b border-border-default',
                    collapsed ? 'justify-center' : 'justify-between'
                )}
            >
                {!collapsed && (
                    <Link href={dashboardHref} aria-label="Go to dashboard">
                        <VoxLogo width={90} height={45} />
                    </Link>
                )}
                <button
                    onClick={toggle}
                    className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-background-muted transition-colors"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Workspace name */}
            {!collapsed && (
                <div className="shrink-0 px-4 py-2 border-b border-border-default">
                    <p className="text-xs font-medium text-text-muted truncate">{workspace.name}</p>
                </div>
            )}

            {/* Primary action */}
            <div className={cn('shrink-0 px-3 py-4', collapsed && 'px-2')}>
                {collapsed ? (
                    <Tooltip content="New Shipment" side="right">
                        <Link
                            href={newShipmentHref}
                            aria-label="New Shipment"
                            className="flex items-center justify-center w-full p-3 rounded-lg bg-accent-primary text-white hover:opacity-90 transition-opacity"
                        >
                            <Plus size={18} />
                        </Link>
                    </Tooltip>
                ) : (
                    <Link
                        href={newShipmentHref}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus size={16} className="shrink-0" />
                        New Shipment
                    </Link>
                )}
            </div>

            {/* Nav */}
            <nav
                className={cn(
                    'flex flex-col gap-1 flex-1 overflow-y-auto px-3',
                    collapsed && 'px-2'
                )}
                aria-label="Main navigation"
            >
                {navItems.map(item => (
                    <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
                ))}
            </nav>

            {/* Footer */}
            <div
                className={cn(
                    'shrink-0 border-t border-border-default',
                    collapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-3 flex flex-col gap-2'
                )}
            >
                {collapsed ? (
                    <Tooltip content="Toggle theme" side="right">
                        <span><ThemeToggleButton /></span>
                    </Tooltip>
                ) : (
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Theme</span>
                        <ThemeToggleButton />
                    </div>
                )}

                {collapsed ? (
                    <>
                        <Tooltip content={user.email ?? 'Profile'} side="right">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-muted text-accent-primary font-semibold text-sm cursor-default select-none">
                                {initials}
                            </div>
                        </Tooltip>
                        <form action="/api/auth/logout" method="post">
                            <Tooltip content="Sign out" side="right">
                                <button
                                    type="submit"
                                    aria-label="Sign out"
                                    className="p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-background-muted transition-colors"
                                >
                                    <LogOut size={14} />
                                </button>
                            </Tooltip>
                        </form>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-muted text-accent-primary font-semibold text-sm shrink-0 select-none">
                            {initials}
                        </div>
                        <p className="flex-1 min-w-0 text-xs text-text-muted truncate font-safe">
                            {user.email}
                        </p>
                        <form action="/api/auth/logout" method="post">
                            <Tooltip content="Sign out" side="right">
                                <button
                                    type="submit"
                                    aria-label="Sign out"
                                    className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-background-muted transition-colors"
                                >
                                    <LogOut size={14} />
                                </button>
                            </Tooltip>
                        </form>
                    </div>
                )}
            </div>
        </aside>
    );
}

'use client';

import {
    Box,
    Flex,
    Text,
    Tooltip
}                            from '@radix-ui/themes';
import {
    LogOut,
    Mail,
    Shield,
    Users
}                            from 'lucide-react';
import Link                  from 'next/link';
import { usePathname }       from 'next/navigation';
import { ThemeToggleButton } from '@/components/theme/theme-toggle';
import { VoxLogo }           from '@/components/ui/vox-logo';
import { cn }                from '@/lib/utils';

interface AdminSidebarProps {
    user: { email: string; id: string };
    pendingCount: number;
}

const NAV = [
    { href: '/admin/access-requests', label: 'Access Requests', icon: Mail, exact: false },
    { href: '/admin/accounts', label: 'Accounts', icon: Users, exact: false },
    { href: '/admin/workspaces', label: 'Teams', icon: Shield, exact: false },
];

export function AdminSidebar({ user, pendingCount }: AdminSidebarProps) {
    const pathname = usePathname();
    const initials = user.email[0]?.toUpperCase() ?? '?';

    function isActive(href: string, exact: boolean) {
        return exact ? pathname === href : pathname.startsWith(href);
    }

    return (
        <aside className="flex flex-col shrink-0 w-60 h-screen bg-background-secondary border-r border-border-default">
            {/* Logo */ }
            <div className="flex items-center h-14 shrink-0 px-4 border-b border-border-default">
                <Link href="/admin" aria-label="Admin panel">
                    <VoxLogo width={ 90 } height={ 45 }/>
                </Link>
            </div>

            {/* Admin badge */ }
            <div className="shrink-0 px-4 py-2 border-b border-border-default">
                <Text size="1" weight="medium" className="text-text-muted uppercase tracking-wider">
                    Admin Panel
                </Text>
            </div>

            {/* Nav */ }
            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-3" aria-label="Admin navigation">
                { NAV.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact);
                    return (
                        <Link
                            key={ href }
                            href={ href }
                            className={ cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                active
                                    ? 'bg-accent-muted text-accent-primary'
                                    : 'text-text-muted hover:text-text-primary hover:bg-background-muted',
                            ) }
                            aria-current={ active ? 'page' : undefined }
                        >
                            <Icon size={ 16 } className="shrink-0"/>
                            <span className="flex-1">{ label }</span>
                            { href === '/admin/access-requests' && pendingCount > 0 && (
                                <span
                                    className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-accent-primary text-white text-[10px] font-bold">
                                    { pendingCount > 99 ? '99+' : pendingCount }
                                </span>
                            ) }
                        </Link>
                    );
                }) }
            </nav>

            {/* Footer */ }
            <div className="shrink-0 border-t border-border-default p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Text size="1" color="gray">Theme</Text>
                    <ThemeToggleButton/>
                </div>
                <div className="flex items-center gap-2">
                    <Flex
                        align="center"
                        justify="center"
                        className="w-8 h-8 rounded-full bg-accent-muted text-accent-primary font-semibold text-sm shrink-0 select-none"
                    >
                        { initials }
                    </Flex>
                    <Box className="flex-1 min-w-0">
                        <Text size="1" color="gray" className="truncate block">{ user.email }</Text>
                    </Box>
                    <form action="/api/auth/logout" method="post">
                        <Tooltip content="Sign out">
                            <button
                                type="submit"
                                aria-label="Sign out"
                                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-background-muted transition-colors"
                            >
                                <LogOut size={ 14 }/>
                            </button>
                        </Tooltip>
                    </form>
                </div>
            </div>
        </aside>
    );
}

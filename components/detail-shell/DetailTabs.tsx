'use client';

import Link            from 'next/link';
import { usePathname } from 'next/navigation';

export interface TabItem {
    label: string;
    href: string;
}

interface DetailTabsProps {
    tabs: TabItem[];
}

export function DetailTabs({ tabs }: DetailTabsProps): React.ReactElement {
    const pathname = usePathname();

    return (
        <div className="flex border-b border-(--gray-6)">
            { tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={ tab.href }
                        href={ tab.href }
                        className={ [
                            'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                            isActive
                                ? 'border-(--accent-9) text-(--accent-9)'
                                : 'border-transparent text-(--gray-11) hover:text-(--gray-12)',
                        ].join(' ') }
                    >
                        { tab.label }
                    </Link>
                );
            }) }
        </div>
    );
}

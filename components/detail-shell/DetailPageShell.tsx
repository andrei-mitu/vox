import Link             from 'next/link';
import {
    Box,
    Flex,
    Heading,
}                       from '@radix-ui/themes';
import { ArrowLeft }    from 'lucide-react';
import type { TabItem } from './DetailTabs';
import { DetailTabs }   from './DetailTabs';

interface DetailPageShellProps {
    backHref: string;
    backLabel: string;
    title: string;
    badges?: React.ReactNode;
    tabs: TabItem[];
    children: React.ReactNode;
}

export function DetailPageShell({
                                    backHref,
                                    backLabel,
                                    title,
                                    badges,
                                    tabs,
                                    children,
                                }: DetailPageShellProps): React.ReactElement {
    return (
        <Box>
            <Box px="6" pt="6" pb="0">
                <Flex mb="4">
                    <Link
                        href={ backHref }
                        className="flex items-center gap-1 text-sm text-(--gray-11) hover:text-(--gray-12) transition-colors"
                    >
                        <ArrowLeft size={ 14 }/>
                        { backLabel }
                    </Link>
                </Flex>

                <Flex justify="between" align="start" mb="4">
                    <Box>
                        <Heading size="6" mb={ badges ? '2' : undefined }>{ title }</Heading>
                        { badges && <Flex gap="2" align="center">{ badges }</Flex> }
                    </Box>
                </Flex>

                <DetailTabs tabs={ tabs }/>
            </Box>

            <Box px="6" pt="5" pb="6">
                { children }
            </Box>
        </Box>
    );
}

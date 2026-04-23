import {
    notFound,
    redirect,
}                         from 'next/navigation';
import Link               from 'next/link';
import {
    Box,
    Flex,
    Heading,
}                         from '@radix-ui/themes';
import { ArrowLeft }      from 'lucide-react';
import { DetailTabs }     from '@/components/detail-shell/DetailTabs';
import { findTeamBySlug } from '@/lib/repositories/team.repository';
import { getRoute }       from '@/lib/services/route.service';

export default async function RouteDetailLayout({
                                                    children,
                                                    params,
                                                }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; routeId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, routeId } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect('/no-access');
    }

    const route = await getRoute(team.id, routeId);
    if ( !route ) {
        notFound();
    }

    const displayName = `${ route.originCity }, ${ route.originCountry } → ${ route.destCity }, ${ route.destCountry }`;
    const base = `/${ slug }/routes/${ routeId }`;
    const tabs = [
        { label: 'Details', href: `${ base }/details` },
        { label: 'Shipments', href: `${ base }/shipments` },
        { label: 'Carriers', href: `${ base }/carriers` },
    ];

    return (
        <Box>
            {/* Header */ }
            <Box px="6" pt="6" pb="0">
                {/* Back link */ }
                <Flex mb="4">
                    <Link
                        href={ `/${ slug }/routes` }
                        className="flex items-center gap-1 text-sm text-[var(--gray-11)] hover:text-[var(--gray-12)] transition-colors"
                    >
                        <ArrowLeft size={ 14 }/>
                        Routes
                    </Link>
                </Flex>

                {/* Title row */ }
                <Flex justify="between" align="start" mb="4">
                    <Heading size="6">{ displayName }</Heading>
                </Flex>

                {/* Tabs */ }
                <DetailTabs tabs={ tabs }/>
            </Box>

            {/* Tab content */ }
            <Box px="6" pt="5" pb="6">
                { children }
            </Box>
        </Box>
    );
}

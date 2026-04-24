import { DetailPageShell }   from '@/components/detail-shell/DetailPageShell';
import { getRoute }          from '@/lib/services/route.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function RouteDetailLayout({
                                                    children,
                                                    params,
                                                }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; routeId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, routeId } = await params;
    const { entity: route } = await resolveTeamEntity(slug, routeId, getRoute);

    const displayName = `${ route.originCity }, ${ route.originCountry } → ${ route.destCity }, ${ route.destCountry }`;
    const base = `/${ slug }/routes/${ routeId }`;
    const tabs = [
        { label: 'Details', href: `${ base }/details` },
        { label: 'Trips', href: `${ base }/shipments` },
        { label: 'Carriers', href: `${ base }/carriers` },
    ];

    return (
        <DetailPageShell
            backHref={ `/${ slug }/routes` }
            backLabel="Routes"
            title={ displayName }
            tabs={ tabs }
        >
            { children }
        </DetailPageShell>
    );
}

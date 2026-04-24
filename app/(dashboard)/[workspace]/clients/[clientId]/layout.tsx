import { DetailPageShell }   from '@/components/detail-shell/DetailPageShell';
import { getClient }         from '@/lib/services/client.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function ClientDetailLayout({
                                                     children,
                                                     params,
                                                 }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; clientId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, clientId } = await params;
    const { entity: client } = await resolveTeamEntity(slug, clientId, getClient);

    const base = `/${ slug }/clients/${ clientId }`;
    const tabs = [
        { label: 'Details', href: `${ base }/details` },
        { label: 'Trips', href: `${ base }/shipments` },
        { label: 'Carriers', href: `${ base }/carriers` },
    ];

    return (
        <DetailPageShell
            backHref={ `/${ slug }/clients` }
            backLabel="Clients"
            title={ client.name }
            tabs={ tabs }
        >
            { children }
        </DetailPageShell>
    );
}

import { ClientDetailsTab }  from '@/components/clients/tabs/ClientDetailsTab';
import { getClient }         from '@/lib/services/client.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function ClientDetailsPage({
                                                    params,
                                                }: {
    params: Promise<{ workspace: string; clientId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, clientId } = await params;
    const { entity: client } = await resolveTeamEntity(slug, clientId, getClient);
    return <ClientDetailsTab client={ client } workspaceSlug={ slug }/>;
}

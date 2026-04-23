import {
    notFound,
    redirect,
}                           from 'next/navigation';
import { ClientDetailsTab } from '@/components/clients/tabs/ClientDetailsTab';
import { findTeamBySlug }   from '@/lib/repositories/team.repository';
import { getClient }        from '@/lib/services/client.service';

export default async function ClientDetailsPage({
                                                    params,
                                                }: {
    params: Promise<{ workspace: string; clientId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, clientId } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect('/no-access');
    }

    const client = await getClient(clientId, team.id);
    if ( !client ) {
        notFound();
    }

    return <ClientDetailsTab client={ client } workspaceSlug={ slug }/>;
}

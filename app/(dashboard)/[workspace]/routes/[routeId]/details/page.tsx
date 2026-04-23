import {
    notFound,
    redirect,
}                          from 'next/navigation';
import { RouteDetailsTab } from '@/components/routes/tabs/RouteDetailsTab';
import { findTeamBySlug }  from '@/lib/repositories/team.repository';
import { getRoute }        from '@/lib/services/route.service';

export default async function RouteDetailsPage({
                                                   params,
                                               }: {
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

    return <RouteDetailsTab route={ route } workspaceSlug={ slug }/>;
}

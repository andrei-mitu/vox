import { RouteDetailsTab }   from '@/components/routes/tabs/RouteDetailsTab';
import { getRoute }          from '@/lib/services/route.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function RouteDetailsPage({
                                                   params,
                                               }: {
    params: Promise<{ workspace: string; routeId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, routeId } = await params;
    const { entity: route } = await resolveTeamEntity(slug, routeId, getRoute);
    return <RouteDetailsTab route={ route } workspaceSlug={ slug }/>;
}

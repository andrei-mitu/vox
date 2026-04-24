import { TripDetailsTab }    from '@/components/trips/tabs/TripDetailsTab';
import { getTrip }           from '@/lib/services/trip.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function TripDetailsPage({
                                                  params,
                                              }: {
    params: Promise<{ workspace: string; tripId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, tripId } = await params;
    const { entity: trip } = await resolveTeamEntity(slug, tripId, getTrip);
    return <TripDetailsTab trip={ trip } workspaceSlug={ slug }/>;
}

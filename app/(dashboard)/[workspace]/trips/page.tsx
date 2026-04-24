import { Box }             from '@radix-ui/themes';
import { redirect }        from 'next/navigation';
import { TripsClient }     from '@/components/trips/TripsClient';
import { findTeamBySlug }  from '@/lib/repositories/team.repository';
import { getTripsForTeam } from '@/lib/services/trip.service';

export default async function TripsPage({
                                            params,
                                        }: {
    params: Promise<{ workspace: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect('/no-access');
    }

    const trips = await getTripsForTeam(team.id);

    return (
        <Box p="6">
            <TripsClient initialTrips={ trips } workspaceSlug={ slug }/>
        </Box>
    );
}

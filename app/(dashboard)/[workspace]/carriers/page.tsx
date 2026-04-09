import {redirect} from 'next/navigation';
import {Box} from '@radix-ui/themes';
import {getSessionUser} from '@/lib/services/auth.service';
import {findTeamBySlug} from '@/lib/repositories/team.repository';
import {getCarriersForTeam} from '@/lib/services/carrier.service';
import {CarriersClient} from '@/components/carriers/CarriersClient';

export default async function CarriersPage({
    params,
}: {
    params: Promise<{workspace: string}>;
}): Promise<React.ReactElement> {
    const {workspace: slug} = await params;

    const user = await getSessionUser();
    if (!user) redirect('/login');

    const team = await findTeamBySlug(slug);
    if (!team) redirect('/no-access');

    const carriers = await getCarriersForTeam(team.id);

    return (
        <Box p="6">
            <CarriersClient initialCarriers={carriers} workspaceSlug={slug} />
        </Box>
    );
}

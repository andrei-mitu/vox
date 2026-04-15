import { Box }                from "@radix-ui/themes";
import { redirect }           from "next/navigation";
import { CarriersClient }     from "@/components/carriers/CarriersClient";
import { findTeamBySlug }     from "@/lib/repositories/team.repository";
import { getCarriersForTeam } from "@/lib/services/carrier.service";

export default async function CarriersPage({
                                               params,
}: {
    params: Promise<{ workspace: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    const carriers = await getCarriersForTeam(team.id);

    return (
        <Box p="6">
            <CarriersClient initialCarriers={ carriers } workspaceSlug={ slug }/>
        </Box>
    );
}

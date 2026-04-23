import { Box }              from "@radix-ui/themes";
import { redirect }         from "next/navigation";
import { RoutesClient }     from "@/components/routes/RoutesClient";
import { findTeamBySlug }   from "@/lib/repositories/team.repository";
import { getRoutesForTeam } from "@/lib/services/route.service";

export default async function RoutesPage({
                                             params,
                                         }: {
    params: Promise<{ workspace: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    const routes = await getRoutesForTeam(team.id);

    return (
        <Box p="6">
            <RoutesClient initialRoutes={ routes } workspaceSlug={ slug }/>
        </Box>
    );
}

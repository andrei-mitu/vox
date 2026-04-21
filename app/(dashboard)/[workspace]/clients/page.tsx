import { Box }               from "@radix-ui/themes";
import { redirect }          from "next/navigation";
import { ClientsClient }     from "@/components/clients/ClientsClient";
import { findTeamBySlug }    from "@/lib/repositories/team.repository";
import { getClientsForTeam } from "@/lib/services/client.service";

export default async function ClientsPage({
    params,
}: {
    params: Promise<{ workspace: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    const clients = await getClientsForTeam(team.id);

    return (
        <Box p="6">
            <ClientsClient initialClients={ clients } workspaceSlug={ slug } />
        </Box>
    );
}

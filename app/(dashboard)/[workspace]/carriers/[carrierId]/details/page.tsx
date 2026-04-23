import {
    notFound,
    redirect
}                            from "next/navigation";
import { CarrierDetailsTab } from "@/components/carriers/tabs/CarrierDetailsTab";
import { findTeamBySlug }    from "@/lib/repositories/team.repository";
import { getCarrier }        from "@/lib/services/carrier.service";

export default async function CarrierDetailsPage({
                                                     params,
                                                 }: {
    params: Promise<{ workspace: string; carrierId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, carrierId } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    const carrier = await getCarrier(team.id, carrierId);
    if ( !carrier ) {
        notFound();
    }

    return <CarrierDetailsTab carrier={ carrier } workspaceSlug={ slug }/>;
}

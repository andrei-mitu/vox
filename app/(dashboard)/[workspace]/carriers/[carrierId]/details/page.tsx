import { CarrierDetailsTab } from '@/components/carriers/tabs/CarrierDetailsTab';
import { getCarrier }        from '@/lib/services/carrier.service';
import { resolveTeamEntity } from '@/lib/api/page-utils';

export default async function CarrierDetailsPage({
                                                     params,
                                                 }: {
    params: Promise<{ workspace: string; carrierId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, carrierId } = await params;
    const { entity: carrier } = await resolveTeamEntity(slug, carrierId, getCarrier);
    return <CarrierDetailsTab carrier={ carrier } workspaceSlug={ slug }/>;
}

import { Badge }               from '@radix-ui/themes';
import { DetailPageShell }     from '@/components/detail-shell/DetailPageShell';
import { CARRIER_MODE_LABELS } from '@/lib/dto/carrier.dto';
import { getCarrier }          from '@/lib/services/carrier.service';
import { resolveTeamEntity }   from '@/lib/api/page-utils';

export default async function CarrierDetailLayout({
                                                      children,
                                                      params,
                                                  }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; carrierId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, carrierId } = await params;
    const { entity: carrier } = await resolveTeamEntity(slug, carrierId, getCarrier);

    const base = `/${ slug }/carriers/${ carrierId }`;
    const tabs = [
        { label: 'Details', href: `${ base }/details` },
        { label: 'Trips', href: `${ base }/shipments` },
        { label: 'Clients', href: `${ base }/clients` },
        { label: 'Routes', href: `${ base }/routes` },
    ];

    return (
        <DetailPageShell
            backHref={ `/${ slug }/carriers` }
            backLabel="Carriers"
            title={ carrier.name }
            badges={
                <>
                    <Badge color="blue" variant="soft">
                        { CARRIER_MODE_LABELS[carrier.mode] }
                    </Badge>
                    <Badge
                        color={ carrier.status === 'active' ? 'green' : 'gray' }
                        variant="soft"
                    >
                        { carrier.status === 'active' ? 'Active' : 'Inactive' }
                    </Badge>
                    <Badge variant="outline" color="gray">{ carrier.code }</Badge>
                </>
            }
            tabs={ tabs }
        >
            { children }
        </DetailPageShell>
    );
}

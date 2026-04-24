import { Badge }              from '@radix-ui/themes';
import { DetailPageShell }    from '@/components/detail-shell/DetailPageShell';
import type { TripStatus }    from '@/lib/dto/trip.dto';
import { TRIP_STATUS_LABELS } from '@/lib/dto/trip.dto';
import { getTrip }            from '@/lib/services/trip.service';
import { resolveTeamEntity }  from '@/lib/api/page-utils';

const STATUS_COLORS: Record<TripStatus, 'gray' | 'blue' | 'orange' | 'yellow' | 'green'> = {
    CREATED: 'gray',
    CARRIER_ASSIGNED: 'blue',
    MONITORING: 'orange',
    AWAITING_PAYMENT: 'yellow',
    COMPLETED: 'green',
};

export default async function TripDetailLayout({
                                                   children,
                                                   params,
                                               }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; tripId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, tripId } = await params;
    const { entity: trip } = await resolveTeamEntity(slug, tripId, getTrip);

    const base = `/${ slug }/trips/${ tripId }`;
    const tabs = [
        { label: 'Details', href: `${ base }/details` },
    ];

    return (
        <DetailPageShell
            backHref={ `/${ slug }/trips` }
            backLabel="Trips"
            title={ trip.cargoName }
            badges={
                <>
                    <Badge color={ STATUS_COLORS[trip.status] } variant="soft">
                        { TRIP_STATUS_LABELS[trip.status] }
                    </Badge>
                    { trip.clientName && (
                        <Badge variant="outline" color="gray">{ trip.clientName }</Badge>
                    ) }
                </>
            }
            tabs={ tabs }
        >
            { children }
        </DetailPageShell>
    );
}

import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function TripShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No shipments yet."
            description="Shipments linked to this trip will appear here."
        />
    );
}

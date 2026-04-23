import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function CarrierShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No shipments yet."
            description="Shipments assigned to this carrier will appear here."
        />
    );
}

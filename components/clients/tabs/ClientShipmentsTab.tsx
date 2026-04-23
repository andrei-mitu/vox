import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function ClientShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No shipments yet."
            description="Shipments for this client will appear here."
        />
    );
}

import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function RouteShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No shipments yet."
            description="Shipments that used this route will appear here."
        />
    );
}

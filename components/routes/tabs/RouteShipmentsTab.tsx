import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function RouteShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No trips yet."
            description="Trips that used this route will appear here."
        />
    );
}

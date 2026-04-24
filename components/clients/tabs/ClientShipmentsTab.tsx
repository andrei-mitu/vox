import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function ClientShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No trips yet."
            description="Trips for this client will appear here."
        />
    );
}

import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function CarrierShipmentsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No trips yet."
            description="Trips assigned to this carrier will appear here."
        />
    );
}

import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function CarrierClientsTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No clients yet."
            description="Clients linked via shipments with this carrier will appear here."
        />
    );
}

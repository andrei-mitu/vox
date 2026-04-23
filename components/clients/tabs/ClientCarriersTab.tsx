import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function ClientCarriersTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No carriers yet."
            description="Carriers used by this client will appear here."
        />
    );
}

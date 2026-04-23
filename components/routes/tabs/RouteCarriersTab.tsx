import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function RouteCarriersTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No carriers yet."
            description="Carriers that have serviced this route will appear here."
        />
    );
}

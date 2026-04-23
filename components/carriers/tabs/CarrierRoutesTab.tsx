import { EmptyTabState } from '@/components/detail-shell/EmptyTabState';

export function CarrierRoutesTab(): React.ReactElement {
    return (
        <EmptyTabState
            title="No routes yet."
            description="Routes serviced by this carrier will appear here."
        />
    );
}

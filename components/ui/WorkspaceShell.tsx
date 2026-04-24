import { NotificationProvider } from '@/lib/client/notifications';
import { NotificationStack }    from '@/components/ui/NotificationStack';

export function WorkspaceShell({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <NotificationProvider>
            { children }
            <NotificationStack/>
        </NotificationProvider>
    );
}

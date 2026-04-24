import { redirect }                   from 'next/navigation';
import { findAccessRequestsByStatus } from '@/lib/repositories/access-request.repository';
import { getSessionUser }             from '@/lib/services/auth.service';
import { AdminSidebar }               from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = await getSessionUser();
    if ( !user ) {
        redirect('/login');
    }
    if ( user.role !== 'admin' ) {
        redirect('/no-access');
    }

    const pending = await findAccessRequestsByStatus('pending');

    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar
                user={ { email: user.email, id: user.id } }
                pendingCount={ pending.length }
            />
            <main className="flex-1 overflow-y-auto bg-background-primary">
                { children }
            </main>
        </div>
    );
}

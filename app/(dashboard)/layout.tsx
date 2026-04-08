import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/services/auth.service';
import { Sidebar } from '@/components/sidebar/sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ email: user.email, id: user.id }} />
      <main className="flex-1 overflow-auto bg-background-primary">
        {children}
      </main>
    </div>
  );
}

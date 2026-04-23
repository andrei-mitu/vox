import { redirect }       from 'next/navigation';
import { Sidebar }        from '@/components/sidebar/sidebar';
import { WorkspaceShell } from '@/components/ui/WorkspaceShell';
import {
    findMembership,
    findTeamBySlug,
}                         from '@/lib/repositories/team.repository';
import { getSessionUser } from '@/lib/services/auth.service';

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({
                                                  children,
                                                  params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspace: string }>;
}) {
    const { workspace: slug } = await params;

    const user = await getSessionUser();
    if ( !user ) {
        redirect("/login");
    }

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    if ( user.role !== "admin" ) {
        const membership = await findMembership(team.id, user.id);
        if ( !membership ) {
            redirect("/no-access");
        }
    }

    return (
        <WorkspaceShell>
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    user={ { email: user.email, id: user.id } }
                    workspace={ { slug: team.slug, name: team.name } }
                    isAdmin={ user.role === 'admin' }
                />
                <main className="flex-1 overflow-auto bg-background-primary">
                    { children }
                </main>
            </div>
        </WorkspaceShell>
    );
}

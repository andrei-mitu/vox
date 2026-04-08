import { getVisibleTeams } from '@/lib/services/team.service';

const SAFE_SLUG = /^[a-z0-9-]+$/;

function safeSlugPath(slug: string, path: string): string {
    if (!SAFE_SLUG.test(slug)) throw new Error(`Invalid workspace slug: ${slug}`);
    return `/${slug}/${path}`;
}

/**
 * Resolves where to send a user after login based on their workspace memberships.
 * Admins see all workspaces; regular users see only their own.
 * This is the single source of truth for post-login routing.
 */
export async function resolvePostLoginRedirect(userId: string, role: 'admin' | 'user'): Promise<string> {
    const teams = await getVisibleTeams(userId, role);

    if (teams.length === 0) return '/no-access';
    if (teams.length === 1) return safeSlugPath(teams[0].slug, 'dashboard');
    return '/select-workspace';
}

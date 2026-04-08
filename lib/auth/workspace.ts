import { findMembership, findTeamBySlug } from '@/lib/repositories/team.repository';
import type { SessionUserDto } from '@/lib/dto/auth.dto';
import type { Team } from '@/lib/db/schema';

export type WorkspaceAccessResult =
    | { ok: true; team: Team }
    | { ok: false; status: 403 | 404 };

/**
 * Verifies the current user may access the given workspace slug.
 * Admins bypass the membership check and can access any existing workspace.
 *
 * Use this in every workspace-scoped Route Handler — the layout guard only
 * runs for page renders, not for API routes.
 *
 * @example
 * const access = await assertWorkspaceAccess(slug, user);
 * if (!access.ok) return ApiResponse.error(access.status, 'Not found');
 */
export async function assertWorkspaceAccess(
    slug: string,
    user: SessionUserDto,
): Promise<WorkspaceAccessResult> {
    const team = await findTeamBySlug(slug);
    if (!team) return { ok: false, status: 404 };

    if (user.role === 'admin') return { ok: true, team };

    const membership = await findMembership(team.id, user.id);
    if (!membership) return { ok: false, status: 403 };

    return { ok: true, team };
}

import 'server-only';
import {
    notFound,
    redirect
}                         from 'next/navigation';
import type { Team }      from '@/lib/db/schema/teams';
import { findTeamBySlug } from '@/lib/repositories/team.repository';

export async function resolveTeamEntity<T>(
    slug: string,
    rawId: string,
    fetchFn: (teamId: string, seqId: number) => Promise<T | null>,
): Promise<{ team: Team; entity: T }> {
    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect('/no-access');
    }

    const seqId = parseInt(rawId, 10);
    if ( !Number.isInteger(seqId) || seqId <= 0 || String(seqId) !== rawId ) {
        notFound();
    }

    const entity = await fetchFn(team.id, seqId);
    if ( !entity ) {
        notFound();
    }

    return { team, entity };
}

import type { Team }             from '@/lib/db/schema';
import type { SessionUserDto }   from '@/lib/dto/auth.dto';
import { ApiResponse }           from '@/lib/api/response';
import { assertWorkspaceAccess } from '@/lib/auth/workspace';
import { getSessionUser }        from '@/lib/services/auth.service';

type WorkspaceContext = {
    slug: string;
    team: Team;
    user: SessionUserDto;
    params: Record<string, string>;
};

type WorkspaceHandler = (
    req: Request,
    ctx: WorkspaceContext,
) => Promise<Response>;

export function withWorkspace(handler: WorkspaceHandler) {
    return async (
        req: Request,
        { params }: { params: Promise<Record<string, string>> },
    ): Promise<Response> => {
        const { workspace: slug, ...rest } = await params;

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }

        const access = await assertWorkspaceAccess(slug, user);
        if ( !access.ok ) {
            return ApiResponse.error('Not found', access.status);
        }

        try {
            return await handler(req, { slug, team: access.team, user, params: rest });
        } catch ( error ) {
            return ApiResponse.internalServerError(error);
        }
    };
}

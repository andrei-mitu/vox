import { ApiResponse } from '@/lib/api/response';
import { banUser } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';

// Sets bannedUntil to year 9999 — effectively permanent.
const PERMANENT_BAN = new Date('9999-12-31T23:59:59Z');

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const admin = await getSessionUser();
        if (!admin) return ApiResponse.unauthorized();
        if (admin.role !== 'admin') return ApiResponse.forbidden();
        if (admin.id === id) return ApiResponse.badRequest('You cannot ban yourself.');

        await banUser(id, PERMANENT_BAN);
        return ApiResponse.ok({ ok: true });
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

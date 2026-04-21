import { ApiResponse } from '@/lib/api/response';
import { unbanUser } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const admin = await getSessionUser();
        if (!admin) return ApiResponse.unauthorized();
        if (admin.role !== 'admin') return ApiResponse.forbidden();

        await unbanUser(id);
        return ApiResponse.ok({ ok: true });
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

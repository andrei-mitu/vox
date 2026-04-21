import { ApiResponse } from '@/lib/api/response';
import { getSessionUser, rejectAccessRequest } from '@/lib/services/auth.service';

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const user = await getSessionUser();
        if (!user) return ApiResponse.unauthorized();
        if (user.role !== 'admin') return ApiResponse.forbidden();

        const result = await rejectAccessRequest(id, user.id);
        if (!result.ok) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok({ ok: true });
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

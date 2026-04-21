import { ApiResponse } from '@/lib/api/response';
import { deleteUserById } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const admin = await getSessionUser();
        if (!admin) return ApiResponse.unauthorized();
        if (admin.role !== 'admin') return ApiResponse.forbidden();
        if (admin.id === id) return ApiResponse.badRequest('You cannot delete yourself.');

        await deleteUserById(id);
        return ApiResponse.ok({ ok: true });
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

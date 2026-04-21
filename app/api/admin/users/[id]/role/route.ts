import { ApiResponse } from '@/lib/api/response';
import { readJsonBody } from '@/lib/api/request';
import { updateUserRole } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';
import { z } from 'zod';

const schema = z.object({
    role: z.enum(['admin', 'user']),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const admin = await getSessionUser();
        if (!admin) return ApiResponse.unauthorized();
        if (admin.role !== 'admin') return ApiResponse.forbidden();
        if (admin.id === id) return ApiResponse.badRequest('You cannot change your own role.');

        const body = await readJsonBody(request);
        if (body === null) return ApiResponse.badRequest('Invalid JSON body.');

        const parsed = schema.safeParse(body);
        if (!parsed.success) return ApiResponse.badRequest('role must be "admin" or "user".');

        await updateUserRole(id, parsed.data.role);
        return ApiResponse.ok({ ok: true });
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

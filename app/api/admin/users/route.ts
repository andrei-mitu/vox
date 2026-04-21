import { ApiResponse } from '@/lib/api/response';
import { findAllUsersWithProfiles } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';

export async function GET(): Promise<Response> {
    try {
        const user = await getSessionUser();
        if (!user) return ApiResponse.unauthorized();
        if (user.role !== 'admin') return ApiResponse.forbidden();

        const users = await findAllUsersWithProfiles();
        return ApiResponse.ok(users);
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

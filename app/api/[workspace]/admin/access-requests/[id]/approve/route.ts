import { ApiResponse } from "@/lib/api/response";
import {
    approveAccessRequest,
    getSessionUser,
}                      from "@/lib/services/auth.service";

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ workspace: string; id: string }> },
): Promise<Response> {
    try {
        const { id } = await params;

        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }
        if ( user.role !== "admin" ) {
            return ApiResponse.forbidden();
        }

        const result = await approveAccessRequest(id, user.id);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok({
            ok: true,
            userId: result.userId,
            email: result.email,
            tempPassword: result.tempPassword,
        });
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

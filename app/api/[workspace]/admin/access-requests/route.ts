import { ApiResponse }                from "@/lib/api/response";
import type { AccessRequest }         from "@/lib/db/schema";
import { findAccessRequestsByStatus } from "@/lib/repositories/access-request.repository";
import { getSessionUser }             from "@/lib/services/auth.service";

const VALID_STATUSES: AccessRequest["status"][] = [
    "pending",
    "approved",
    "rejected",
];

export async function GET(request: Request): Promise<Response> {
    try {
        const user = await getSessionUser();
        if ( !user ) {
            return ApiResponse.unauthorized();
        }
        if ( user.role !== "admin" ) {
            return ApiResponse.forbidden();
        }

        const { searchParams } = new URL(request.url);
        const rawStatus = (searchParams.get("status") ??
            "pending") as AccessRequest["status"];
        if ( !VALID_STATUSES.includes(rawStatus) ) {
            return ApiResponse.badRequest(
                "Invalid status filter. Use: pending, approved, or rejected.",
            );
        }

        const requests = await findAccessRequestsByStatus(rawStatus);
        return ApiResponse.ok(requests);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

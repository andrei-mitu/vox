import { readJsonBody }           from "@/lib/api/request";
import { ApiResponse }            from "@/lib/api/response";
import { parseRequestAccessBody } from "@/lib/dto/auth.dto";
import { requestAccess }          from "@/lib/services/auth.service";

export async function POST(request: Request): Promise<Response> {
    try {
        const body = await readJsonBody(request);
        if ( body === null ) {
            return ApiResponse.badRequest("Invalid JSON body");
        }

        const parsed = parseRequestAccessBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await requestAccess(parsed.data);
        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok({ id: result.id }, 201);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

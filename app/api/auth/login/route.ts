import { readJsonBody }   from "@/lib/api/request";
import { ApiResponse }    from "@/lib/api/response";
import { parseLoginBody } from "@/lib/dto/auth.dto";
import { signIn }         from "@/lib/services/auth.service";

export async function POST(request: Request) {
    try {
        const body = await readJsonBody(request);
        if ( body === null ) {
            return ApiResponse.badRequest("Invalid JSON body");
        }

        const parsed = parseLoginBody(body);
        if ( !parsed.ok ) {
            return ApiResponse.badRequest(parsed.message);
        }

        const result = await signIn(parsed.data.email, parsed.data.password);

        if ( !result.ok ) {
            return ApiResponse.error(result.message, result.status);
        }

        return ApiResponse.ok(null);
    } catch ( error ) {
        return ApiResponse.internalServerError(error);
    }
}

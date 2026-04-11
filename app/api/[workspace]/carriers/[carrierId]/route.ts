import {getSessionUser} from '@/lib/services/auth.service';
import {assertWorkspaceAccess} from '@/lib/auth/workspace';
import {updateExistingCarrier, removeCarrier} from '@/lib/services/carrier.service';
import {parseUpdateCarrierBody} from '@/lib/dto/carrier.dto';
import {ApiResponse} from '@/lib/api/response';
import {readJsonBody} from '@/lib/api/request';

export async function PATCH(
    request: Request,
    {params}: {params: Promise<{workspace: string; carrierId: string}>},
): Promise<Response> {
    try {
        const {workspace: slug, carrierId} = await params;

        const user = await getSessionUser();
        if (!user) return ApiResponse.unauthorized();

        const access = await assertWorkspaceAccess(slug, user);
        if (!access.ok) return ApiResponse.error('Not found', access.status);

        const body = await readJsonBody(request);
        if (body === null) return ApiResponse.badRequest('Invalid JSON body');

        const parsed = parseUpdateCarrierBody(body);
        if (!parsed.ok) return ApiResponse.badRequest(parsed.message);

        const result = await updateExistingCarrier(carrierId, access.team.id, parsed.data);
        if (!result.ok) return ApiResponse.error(result.message, result.status);

        return ApiResponse.ok(result.carrier);
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

export async function DELETE(
    _request: Request,
    {params}: {params: Promise<{workspace: string; carrierId: string}>},
): Promise<Response> {
    try {
        const {workspace: slug, carrierId} = await params;

        const user = await getSessionUser();
        if (!user) return ApiResponse.unauthorized();

        const access = await assertWorkspaceAccess(slug, user);
        if (!access.ok) return ApiResponse.error('Not found', access.status);

        const result = await removeCarrier(carrierId, access.team.id);
        if (!result.ok) return ApiResponse.error(result.message, result.status);

        return ApiResponse.ok(null);
    } catch (error) {
        return ApiResponse.internalServerError(error);
    }
}

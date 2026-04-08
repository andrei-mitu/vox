import {NextResponse} from 'next/server';

/**
 * Utility class for consistent HTTP JSON responses in Route Handlers.
 */
export class ApiResponse {
    /**
     * 200 OK / 201 Created (default: 200)
     */
    static ok<T>(data: T, status = 200) {
        return NextResponse.json(data, {status});
    }

    /**
     * 400 Bad Request
     */
    static badRequest(message = 'Bad request') {
        return NextResponse.json({error: message}, {status: 400});
    }

    /**
     * 401 Unauthorized
     */
    static unauthorized(message = 'Unauthorized') {
        return NextResponse.json({error: message}, {status: 401});
    }

    /**
     * 403 Forbidden
     */
    static forbidden(message = 'Forbidden') {
        return NextResponse.json({error: message}, {status: 403});
    }

    /**
     * 404 Not Found
     */
    static notFound(message = 'Not found') {
        return NextResponse.json({error: message}, {status: 404});
    }

    /**
     * 422 Unprocessable Entity
     */
    static unprocessableEntity(message = 'Unprocessable entity') {
        return NextResponse.json({error: message}, {status: 422});
    }

    /**
     * 500 Internal Server Error
     */
    static internalServerError(error: unknown, message = 'Internal server error') {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('API Error:', msg);
        return NextResponse.json({error: message}, {status: 500});
    }

    /**
     * Generic Error
     */
    static error(message: string, status: number) {
        return NextResponse.json({error: message}, {status});
    }
}

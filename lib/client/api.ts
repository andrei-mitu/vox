type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function parseResponse<T>(res: Response): Promise<ApiResult<T>> {
    if ( res.ok ) {
        return { ok: true, data: (await res.json()) as T };
    }
    const body = await res.json().catch(() => ({})) as { error?: string; fieldErrors?: Record<string, string> };
    return { ok: false, error: body.error ?? 'Something went wrong.', fieldErrors: body.fieldErrors };
}

export async function apiPatch<T>(url: string, body: unknown): Promise<ApiResult<T>> {
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return parseResponse<T>(res);
}

export async function apiPost<T>(url: string, body: unknown): Promise<ApiResult<T>> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return parseResponse<T>(res);
}

export async function apiDelete(url: string): Promise<ApiResult<void>> {
    const res = await fetch(url, { method: 'DELETE' });
    if ( res.ok ) {
        return { ok: true, data: undefined };
    }
    const body = await res.json().catch(() => ({})) as { error?: string };
    return { ok: false, error: body.error ?? 'Something went wrong.' };
}

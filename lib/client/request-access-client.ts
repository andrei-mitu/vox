import type { RequestAccessInput } from "@/lib/dto/auth.dto";

export type RequestAccessClientResult =
    | { ok: true }
    | { ok: false; error: string };

export async function submitAccessRequest(
    input: RequestAccessInput,
): Promise<RequestAccessClientResult> {
    try {
        const res = await fetch("/api/auth/request-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });

        if ( !res.ok ) {
            const data = (await res.json()) as { error?: string };
            return {
                ok: false,
                error: data.error ?? "Something went wrong. Please try again.",
            };
        }

        return { ok: true };
    } catch {
        return {
            ok: false,
            error: "Unexpected error. Please check your connection and try again.",
        };
    }
}

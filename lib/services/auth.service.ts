import { randomBytes }       from "node:crypto";
import bcrypt                from "bcryptjs";
import { cookies }           from "next/headers";
import { NextResponse }      from "next/server";
import {
    sessionCookie,
    signSession,
    verifySession
}                            from "@/lib/auth/session";
import type { User }         from "@/lib/db/schema";
import type {
    ApproveAccessRequestResult,
    RequestAccessInput,
    SessionUserDto,
}                            from "@/lib/dto/auth.dto";
import {
    createAccessRequest,
    findAccessRequestByEmail,
    findAccessRequestById,
    updateAccessRequestStatus,
}                            from "@/lib/repositories/access-request.repository";
import {
    createProfile,
    createUser,
    findSystemRoleById,
    findUserByEmail,
}                            from "@/lib/repositories/user.repository";
import { isUniqueViolation } from "@/lib/db/errors";

// ---------------------------------------------------------------------------
// Error messages
// ---------------------------------------------------------------------------

export const ERR_INVALID_CREDENTIALS =
    "Incorrect email or password. Please try again.";

// Dummy hash used when no user is found — ensures constant-time response
// regardless of whether the email exists, preventing timing-based enumeration.
const DUMMY_HASH =
    "$2b$12$invalidsaltinvalidsaltinvalidXXXXXXXXXXXXXXXXXXXXXXX";

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

export type SignInSuccess = { ok: true; user: SessionUserDto };
export type SignInFailure = { ok: false; status: 401; message: string };

export async function signIn(
    email: string,
    password: string,
): Promise<SignInSuccess | SignInFailure> {
    const user = await findUserByEmail(email);

    // Always run bcrypt to prevent timing-based email enumeration.
    const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if ( !user || !passwordMatch ) {
        return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
    }

    if ( !user.emailConfirmedAt ) {
        return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
    }

    if ( user.bannedUntil && user.bannedUntil > new Date() ) {
        return { ok: false, status: 401, message: ERR_INVALID_CREDENTIALS };
    }

    const cookieStore = await cookies();
    const token = await signSession({
        sub: user.id,
        email: user.email,
        role: user.systemRole,
    });
    const secure = process.env.NODE_ENV === "production";
    cookieStore.set(sessionCookie.name, token, sessionCookie.options(secure));

    return {
        ok: true,
        user: { id: user.id, email: user.email, role: user.systemRole },
    };
}

// ---------------------------------------------------------------------------
// Get session user
// ---------------------------------------------------------------------------

export async function getSessionUser(): Promise<SessionUserDto | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookie.name)?.value;
    if ( !token ) {
        return null;
    }

    const payload = await verifySession(token);
    if ( !payload ) {
        return null;
    }

    // Always fetch the live role from DB — the JWT role may be stale if the
    // user's system_role was changed after the token was issued.
    const role = await findSystemRoleById(payload.sub);
    if ( !role ) {
        return null;
    }

    return { id: payload.sub, email: payload.email, role };
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOutAndRedirect(
    requestUrl: string,
): Promise<NextResponse> {
    const cookieStore = await cookies();
    cookieStore.delete(sessionCookie.name);
    return NextResponse.redirect(new URL("/login", requestUrl));
}

// ---------------------------------------------------------------------------
// Request access (public)
// ---------------------------------------------------------------------------

export type RequestAccessSuccess = { ok: true; id: string };
export type RequestAccessFailure = {
    ok: false;
    status: number;
    message: string;
};

export async function requestAccess(
    input: RequestAccessInput,
): Promise<RequestAccessSuccess | RequestAccessFailure> {
    const existing = await findAccessRequestByEmail(input.email);
    if ( existing?.status === "pending" ) {
        return {
            ok: false,
            status: 409,
            message: "A request for this email is already pending review.",
        };
    }
    const record = await createAccessRequest({
        email: input.email.toLowerCase(),
        fullName: input.fullName,
        companyName: input.companyName,
        message: input.message ?? null,
    });
    return { ok: true, id: record.id };
}

// ---------------------------------------------------------------------------
// Approve access request (admin only)
// ---------------------------------------------------------------------------

export type ApproveSuccess = { ok: true } & ApproveAccessRequestResult;
export type ApproveFailure = { ok: false; status: number; message: string };

export async function approveAccessRequest(
    requestId: string,
    adminId: string,
): Promise<ApproveSuccess | ApproveFailure> {
    const req = await findAccessRequestById(requestId);
    if ( !req ) {
        return { ok: false, status: 404, message: "Access request not found." };
    }
    if ( req.status !== "pending" ) {
        return { ok: false, status: 409, message: "Request already reviewed." };
    }

    // Prefix guarantees uppercase + digit so the password satisfies the login schema.
    const tempPassword = `Vx1${ randomBytes(12).toString("base64url") }`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    let user: User;
    try {
        user = await createUser({
            email: req.email.toLowerCase(),
            passwordHash,
            emailConfirmedAt: new Date(), // approval IS confirmation
        });
    } catch ( err ) {
        if ( isUniqueViolation(err) ) {
            return {
                ok: false,
                status: 409,
                message: "A user account for this email already exists.",
            };
        }
        throw err;
    }

    await createProfile({
        id: user.id,
        fullName: req.fullName,
        systemRole: "user",
    });
    await updateAccessRequestStatus(requestId, "approved", adminId);

    return { ok: true, userId: user.id, email: user.email, tempPassword };
}

// ---------------------------------------------------------------------------
// Reject access request (admin only)
// ---------------------------------------------------------------------------

export type RejectSuccess = { ok: true };
export type RejectFailure = { ok: false; status: number; message: string };

export async function rejectAccessRequest(
    requestId: string,
    adminId: string,
): Promise<RejectSuccess | RejectFailure> {
    const req = await findAccessRequestById(requestId);
    if ( !req ) {
        return { ok: false, status: 404, message: "Access request not found." };
    }
    if ( req.status !== "pending" ) {
        return { ok: false, status: 409, message: "Request already reviewed." };
    }

    await updateAccessRequestStatus(requestId, "rejected", adminId);
    return { ok: true };
}


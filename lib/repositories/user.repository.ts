import { asc, count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import type {
    NewProfile,
    NewUser,
    Profile,
    User
}             from "@/lib/db/schema";
import {
    profiles,
    users
}             from "@/lib/db/schema";

export interface UserWithProfile extends User {
    systemRole: Profile["systemRole"];
}

export async function findUserByEmail(
    email: string,
): Promise<UserWithProfile | null> {
    const rows = await db()
        .select({
            id: users.id,
            email: users.email,
            passwordHash: users.passwordHash,
            emailConfirmedAt: users.emailConfirmedAt,
            bannedUntil: users.bannedUntil,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
            systemRole: profiles.systemRole,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.id, users.id))
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

    const row = rows[0];
    if ( !row?.systemRole ) {
        return null;
    }
    return row as UserWithProfile;
}

export async function findUserById(id: string): Promise<User | null> {
    const rows = await db().select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function findSystemRoleById(
    id: string,
): Promise<Profile["systemRole"] | null> {
    const rows = await db()
        .select({ systemRole: profiles.systemRole })
        .from(profiles)
        .where(eq(profiles.id, id))
        .limit(1);
    return rows[0]?.systemRole ?? null;
}

// fullName and systemRole are nullable: users without a profile row
// are still returned (LEFT JOIN) so admins can see and act on them.
export interface AdminUserRow {
    id: string;
    email: string;
    fullName: string | null;
    systemRole: Profile['systemRole'] | null;
    emailConfirmedAt: Date | null;
    bannedUntil: Date | null;
    createdAt: Date;
}

export async function countAllUsers(): Promise<number> {
    const rows = await db().select({ value: count() }).from(users);
    return Number(rows[0]?.value ?? 0);
}

export async function findAllUsersWithProfiles(
    page = 1,
    limit = 50,
): Promise<AdminUserRow[]> {
    const offset = (page - 1) * limit;
    return db()
        .select({
            id: users.id,
            email: users.email,
            fullName: profiles.fullName,
            systemRole: profiles.systemRole,
            emailConfirmedAt: users.emailConfirmedAt,
            bannedUntil: users.bannedUntil,
            createdAt: users.createdAt,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.id, users.id))
        .orderBy(asc(users.createdAt))
        .limit(limit)
        .offset(offset);
}

export async function banUser(id: string, until: Date): Promise<void> {
    await db().update(users).set({ bannedUntil: until }).where(eq(users.id, id));
}

export async function unbanUser(id: string): Promise<void> {
    await db().update(users).set({ bannedUntil: null }).where(eq(users.id, id));
}

export async function updateUserRole(
    id: string,
    role: Profile['systemRole'],
): Promise<void> {
    await db().update(profiles).set({ systemRole: role }).where(eq(profiles.id, id));
}

export async function deleteUserById(id: string): Promise<void> {
    await db().delete(users).where(eq(users.id, id));
}

export async function createUser(data: NewUser): Promise<User> {
    const rows = await db().insert(users).values(data).returning();
    return rows[0]!;
}

export async function createProfile(data: NewProfile): Promise<Profile> {
    const rows = await db().insert(profiles).values(data).returning();
    return rows[0]!;
}

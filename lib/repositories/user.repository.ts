import {eq} from 'drizzle-orm';
import {db} from '@/lib/db';
import type {NewUser, Profile, User} from '@/lib/db/schema';
import {profiles, users} from '@/lib/db/schema';

export interface UserWithProfile extends User {
    systemRole: Profile['systemRole'];
}

export async function findUserByEmail(email: string): Promise<UserWithProfile | null> {
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
    if (!row || !row.systemRole) return null;
    return row as UserWithProfile;
}

export async function findUserById(id: string): Promise<User | null> {
    const rows = await db().select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
}

export async function createUser(data: NewUser): Promise<User> {
    const rows = await db().insert(users).values(data).returning();
    return rows[0]!;
}

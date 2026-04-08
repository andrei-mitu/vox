import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accessRequests } from '@/lib/db/schema';
import type { AccessRequest, NewAccessRequest } from '@/lib/db/schema';

export async function createAccessRequest(data: NewAccessRequest): Promise<AccessRequest> {
  const rows = await db().insert(accessRequests).values(data).returning();
  return rows[0]!;
}

export async function findAccessRequestsByStatus(status: AccessRequest['status']): Promise<AccessRequest[]> {
  return db().select().from(accessRequests).where(eq(accessRequests.status, status));
}

export async function updateAccessRequestStatus(
  id: string,
  status: AccessRequest['status'],
  reviewedBy: string
): Promise<AccessRequest | null> {
  const rows = await db()
    .update(accessRequests)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(accessRequests.id, id))
    .returning();
  return rows[0] ?? null;
}

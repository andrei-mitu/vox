import { Badge, Heading, Table, Text } from '@radix-ui/themes';
import Link from 'next/link';
import type { AccessRequest } from '@/lib/db/schema';
import { findAccessRequestsByStatus } from '@/lib/repositories/access-request.repository';
import { cn } from '@/lib/utils';
import { AccessRequestActions } from './AccessRequestActions';

const STATUSES = ['pending', 'approved', 'rejected'] as const;
type Status = (typeof STATUSES)[number];

function StatusBadge({ status }: { status: Status }) {
    const color = status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'amber';
    return <Badge color={color} radius="full" size="1">{status}</Badge>;
}

// Auth guard lives in (admin)/layout.tsx.
export default async function AccessRequestsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {

    const { status: rawStatus } = await searchParams;
    const status: Status = STATUSES.includes(rawStatus as Status) ? (rawStatus as Status) : 'pending';
    const requests = await findAccessRequestsByStatus(status);

    return (
        <div className="p-8 max-w-6xl">
            <Heading size="6" mb="2">Access Requests</Heading>
            <Text size="2" color="gray" mb="6" as="p">
                Review and act on user access requests.
            </Text>

            {/* Status tabs */}
            <div className="flex gap-1 mb-6 p-1 rounded-lg bg-background-secondary w-fit">
                {STATUSES.map((s) => (
                    <Link
                        key={s}
                        href={`/admin/access-requests?status=${s}`}
                        className={cn(
                            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
                            status === s
                                ? 'bg-white dark:bg-background-primary text-text-primary shadow-sm'
                                : 'text-text-muted hover:text-text-primary',
                        )}
                    >
                        {s}
                    </Link>
                ))}
            </div>

            {requests.length === 0 ? (
                <Text size="3" color="gray">No {status} requests.</Text>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                            {status === 'pending' && <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>}
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {requests.map((req: AccessRequest) => (
                            <Table.Row key={req.id}>
                                <Table.Cell>{req.fullName}</Table.Cell>
                                <Table.Cell>{req.email}</Table.Cell>
                                <Table.Cell>{req.companyName}</Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray" className="max-w-xs truncate block">
                                        {req.message ?? '—'}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell><StatusBadge status={req.status} /></Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </Text>
                                </Table.Cell>
                                {status === 'pending' && (
                                    <Table.Cell>
                                        <AccessRequestActions id={req.id} email={req.email} />
                                    </Table.Cell>
                                )}
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            )}
        </div>
    );
}

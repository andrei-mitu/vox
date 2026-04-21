import { Badge, Button, Flex, Heading, Table, Text } from '@radix-ui/themes';
import Link from 'next/link';
import type { AdminUserRow } from '@/lib/repositories/user.repository';
import { countAllUsers, findAllUsersWithProfiles } from '@/lib/repositories/user.repository';
import { getSessionUser } from '@/lib/services/auth.service';
import { AccountActions } from './AccountActions';

const PAGE_SIZE = 50;

function statusOf(user: AdminUserRow): { label: string; color: 'green' | 'red' | 'gray' } {
    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        return { label: 'Banned', color: 'red' };
    }
    if (!user.emailConfirmedAt) {
        return { label: 'Unconfirmed', color: 'gray' };
    }
    return { label: 'Active', color: 'green' };
}

// Auth guard lives in (admin)/layout.tsx.
// getSessionUser() is called here only to obtain admin.id for self-action prevention.
export default async function AccountsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page: rawPage } = await searchParams;
    const page = Math.max(1, Number.isNaN(parseInt(rawPage ?? '', 10)) ? 1 : parseInt(rawPage ?? '1', 10));

    const [admin, users, total] = await Promise.all([
        getSessionUser(),
        findAllUsersWithProfiles(page, PAGE_SIZE),
        countAllUsers(),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const adminId = admin?.id ?? '';

    return (
        <div className="p-8 max-w-6xl">
            <Heading size="6" mb="2">Accounts</Heading>
            <Text size="2" color="gray" mb="6" as="p">
                {total} account{total !== 1 ? 's' : ''} registered.
            </Text>

            <Table.Root variant="surface">
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {users.map((user) => {
                        const st = statusOf(user);
                        return (
                            <Table.Row key={user.id} align="center">
                                <Table.Cell>
                                    <div>
                                        <Text size="2" weight="medium" className="block">
                                            {user.fullName ?? '—'}
                                        </Text>
                                        <Text size="1" color="gray">{user.email}</Text>
                                    </div>
                                </Table.Cell>
                                <Table.Cell>
                                    {user.systemRole ? (
                                        <Badge
                                            color={user.systemRole === 'admin' ? 'violet' : 'blue'}
                                            radius="full"
                                            size="1"
                                        >
                                            {user.systemRole}
                                        </Badge>
                                    ) : (
                                        <Badge color="orange" radius="full" size="1" variant="soft">
                                            no profile
                                        </Badge>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color={st.color} radius="full" size="1">{st.label}</Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <AccountActions user={user} currentAdminId={adminId} />
                                </Table.Cell>
                            </Table.Row>
                        );
                    })}
                </Table.Body>
            </Table.Root>

            {totalPages > 1 && (
                <Flex align="center" justify="between" mt="4">
                    <Text size="2" color="gray">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                    </Text>
                    <Flex gap="2">
                        {page > 1 && (
                            <Button asChild size="1" variant="soft">
                                <Link href={`/admin/accounts?page=${page - 1}`}>Previous</Link>
                            </Button>
                        )}
                        {page < totalPages && (
                            <Button asChild size="1" variant="soft">
                                <Link href={`/admin/accounts?page=${page + 1}`}>Next</Link>
                            </Button>
                        )}
                    </Flex>
                </Flex>
            )}
        </div>
    );
}

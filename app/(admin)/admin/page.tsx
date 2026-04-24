import {
    Badge,
    Heading,
    Table,
    Text
}                                     from '@radix-ui/themes';
import {
    Mail,
    Shield,
    Users
}                                     from 'lucide-react';
import Link                           from 'next/link';
import { findAccessRequestsByStatus } from '@/lib/repositories/access-request.repository';
import { findAllTeams }               from '@/lib/repositories/team.repository';
import { countAllUsers }              from '@/lib/repositories/user.repository';

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    href: string;
    accent?: boolean;
}

function StatCard({ label, value, icon, href, accent }: StatCardProps) {
    return (
        <Link
            href={ href }
            className="flex items-center gap-4 p-5 rounded-xl border border-border-default bg-background-secondary hover:bg-background-muted transition-colors"
        >
            <div
                className={ `flex items-center justify-center w-10 h-10 rounded-lg ${ accent ? 'bg-accent-muted text-accent-primary' : 'bg-background-muted text-text-muted' }` }>
                { icon }
            </div>
            <div>
                <Text size="6" weight="bold" className="block leading-none">{ value }</Text>
                <Text size="2" color="gray" className="mt-1 block">{ label }</Text>
            </div>
        </Link>
    );
}

// Auth guard lives in (admin)/layout.tsx — no need to repeat it here.
export default async function AdminDashboardPage() {
    const [userCount, teams, pending] = await Promise.all([
        countAllUsers(),
        findAllTeams(),
        findAccessRequestsByStatus('pending'),
    ]);

    return (
        <div className="p-8 max-w-5xl">
            <Heading size="6" mb="1">Dashboard</Heading>
            <Text size="2" color="gray" mb="6" as="p">System overview</Text>

            {/* Stats */ }
            <div className="grid grid-cols-3 gap-4 mb-10">
                <StatCard
                    label="Accounts"
                    value={ userCount }
                    icon={ <Users size={ 18 }/> }
                    href="/admin/accounts"
                />
                <StatCard
                    label="Workspaces"
                    value={ teams.length }
                    icon={ <Shield size={ 18 }/> }
                    href="/admin/workspaces"
                />
                <StatCard
                    label="Pending requests"
                    value={ pending.length }
                    icon={ <Mail size={ 18 }/> }
                    href="/admin/access-requests"
                    accent={ pending.length > 0 }
                />
            </div>

            {/* Recent pending requests */ }
            <div className="flex items-center justify-between mb-3">
                <Heading size="3">Pending access requests</Heading>
                <Link
                    href="/admin/access-requests"
                    className="text-sm text-accent-primary hover:underline"
                >
                    View all
                </Link>
            </div>

            { pending.length === 0 ? (
                <div
                    className="flex items-center justify-center h-24 rounded-xl border border-border-default bg-background-secondary">
                    <Text size="2" color="gray">No pending requests</Text>
                </div>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { pending.slice(0, 8).map((req) => (
                            <Table.Row key={ req.id }>
                                <Table.Cell>
                                    <Text size="2" weight="medium">{ req.fullName }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">{ req.email }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">{ req.companyName }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        { new Date(req.createdAt).toLocaleDateString() }
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="amber" radius="full" size="1">pending</Badge>
                                </Table.Cell>
                            </Table.Row>
                        )) }
                    </Table.Body>
                </Table.Root>
            ) }
            { pending.length > 8 && (
                <Text size="2" color="gray" className="mt-2 block">
                    + { pending.length - 8 } more —{ ' ' }
                    <Link href="/admin/access-requests" className="text-accent-primary hover:underline">
                        view all
                    </Link>
                </Text>
            ) }
        </div>
    );
}

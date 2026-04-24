import {
    Badge,
    Button,
    Heading,
    Table,
    Text
}                       from '@radix-ui/themes';
import { ExternalLink } from 'lucide-react';
import Link             from 'next/link';
import { findAllTeams } from '@/lib/repositories/team.repository';

// Auth guard lives in (admin)/layout.tsx.
export default async function TeamsPage() {

    const teams = await findAllTeams();

    return (
        <div className="p-8 max-w-5xl">
            <Heading size="6" mb="2">Teams</Heading>
            <Text size="2" color="gray" mb="6" as="p">
                { teams.length } team{ teams.length !== 1 ? 's' : '' } registered. Click Enter to access team
                as a user.
            </Text>

            { teams.length === 0 ? (
                <Text size="3" color="gray">No teams yet.</Text>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Team</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Slug</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Visibility</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Created</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { teams.map((team) => (
                            <Table.Row key={ team.id } align="center">
                                <Table.Cell>
                                    <Text size="2" weight="medium">{ team.name }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray" className="font-mono">{ team.slug }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={ team.visibility === 'shared' ? 'blue' : 'gray' }
                                        radius="full"
                                        size="1"
                                    >
                                        { team.visibility }
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        { new Date(team.createdAt).toLocaleDateString() }
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button asChild size="1" variant="soft">
                                        <Link href={ `/${ team.slug }/dashboard` }>
                                            <ExternalLink size={ 12 }/>
                                        </Link>
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        )) }
                    </Table.Body>
                </Table.Root>
            ) }
        </div>
    );
}

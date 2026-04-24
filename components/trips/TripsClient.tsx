'use client';

import { useState }            from 'react';
import { useRouter }           from 'next/navigation';
import Link                    from 'next/link';
import {
    Badge,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    Table,
    Tabs,
    Text,
}                              from '@radix-ui/themes';
import {
    Plus,
    Trash2
}                              from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useEntityDelete }     from '@/hooks/use-entity-delete';
import type {
    TripDto,
    TripStatus,
}                              from '@/lib/dto/trip.dto';
import {
    TRIP_STATUS_LABELS,
    TRIP_STATUS_PIPELINE,
}                              from '@/lib/dto/trip.dto';

interface TripsClientProps {
    initialTrips: TripDto[];
    workspaceSlug: string;
}

const STATUS_COLORS: Record<TripStatus, 'gray' | 'blue' | 'orange' | 'yellow' | 'green'> = {
    CREATED: 'gray',
    CARRIER_ASSIGNED: 'blue',
    MONITORING: 'orange',
    AWAITING_PAYMENT: 'yellow',
    COMPLETED: 'green',
};

export function TripsClient({ initialTrips, workspaceSlug }: TripsClientProps): React.ReactElement {
    const router = useRouter();
    const [trips, setTrips] = useState<TripDto[]>(initialTrips);
    const [activeTab, setActiveTab] = useState<TripStatus | 'all'>('all');

    const { deleteTarget, setDeleteTarget, deleting, handleDelete } = useEntityDelete<TripDto>({
        endpoint: (t) => `/api/${ workspaceSlug }/trips/${ t.seqId }`,
        onDeleted: (t) => setTrips((prev) => prev.filter((x) => x.id !== t.id)),
    });

    const filtered = activeTab === 'all'
        ? trips
        : trips.filter((t) => t.status === activeTab);

    const countFor = (status: TripStatus | 'all') =>
        status === 'all' ? trips.length : trips.filter((t) => t.status === status).length;

    return (
        <>
            <Flex justify="between" align="center" mb="5">
                <Heading size="6">Trips</Heading>
                <Button asChild>
                    <Link href={ `/${ workspaceSlug }/trips/new` }>
                        <Plus size={ 16 }/>
                        New Trip
                    </Link>
                </Button>
            </Flex>

            { trips.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No trips yet.</Text>
                    <Button variant="soft" asChild>
                        <Link href={ `/${ workspaceSlug }/trips/new` }>Create your first trip</Link>
                    </Button>
                </Flex>
            ) : (
                <Box>
                    <Tabs.Root value={ activeTab } onValueChange={ (v) => setActiveTab(v as TripStatus | 'all') }>
                        <Tabs.List mb="4">
                            <Tabs.Trigger value="all">
                                All ({ countFor('all') })
                            </Tabs.Trigger>
                            { TRIP_STATUS_PIPELINE.map((status) => (
                                <Tabs.Trigger key={ status } value={ status }>
                                    { TRIP_STATUS_LABELS[status] } ({ countFor(status) })
                                </Tabs.Trigger>
                            )) }
                        </Tabs.List>
                    </Tabs.Root>

                    { filtered.length === 0 ? (
                        <Flex py="6" justify="center">
                            <Text size="2" color="gray">No trips with this status.</Text>
                        </Flex>
                    ) : (
                        <Table.Root variant="surface">
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Cargo</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Client</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Route</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell>Loading date</Table.ColumnHeaderCell>
                                    <Table.ColumnHeaderCell/>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                { filtered.map((trip) => (
                                    <Table.Row
                                        key={ trip.id }
                                        align="center"
                                        style={ { cursor: 'pointer' } }
                                        onClick={ () =>
                                            router.push(`/${ workspaceSlug }/trips/${ trip.seqId }/details`)
                                        }
                                    >
                                        <Table.Cell>
                                            <Text size="2" color="gray">#{ trip.seqId }</Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text weight="medium">{ trip.cargoName }</Text>
                                            { trip.cargoType && (
                                                <Text size="1" color="gray" as="p">{ trip.cargoType }</Text>
                                            ) }
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="2">
                                                { trip.clientName ?? <Text color="gray">—</Text> }
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            { (trip.loadingAddress || trip.unloadingAddress) ? (
                                                <Text size="2" color="gray">
                                                    { trip.loadingAddress ?? '?' } → { trip.unloadingAddress ?? '?' }
                                                </Text>
                                            ) : (
                                                <Text size="2" color="gray">—</Text>
                                            ) }
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge color={ STATUS_COLORS[trip.status] } variant="soft">
                                                { TRIP_STATUS_LABELS[trip.status] }
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text size="2" color="gray">
                                                { trip.loadingDateFrom ?? '—' }
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell onClick={ (e) => e.stopPropagation() }>
                                            <Flex justify="end">
                                                { trip.status === 'CREATED' && (
                                                    <IconButton
                                                        variant="ghost"
                                                        size="1"
                                                        color="red"
                                                        aria-label="Delete trip"
                                                        onClick={ () => setDeleteTarget(trip) }
                                                    >
                                                        <Trash2 size={ 14 }/>
                                                    </IconButton>
                                                ) }
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                )) }
                            </Table.Body>
                        </Table.Root>
                    ) }
                </Box>
            ) }

            <DeleteConfirmDialog
                open={ Boolean(deleteTarget) }
                onOpenChange={ (open) => {
                    if ( !open ) {
                        setDeleteTarget(undefined);
                    }
                } }
                title="Delete trip?"
                description={
                    <><strong>{ deleteTarget?.cargoName }</strong> will be permanently removed. This
                        action cannot be undone.</>
                }
                onConfirm={ handleDelete }
                deleting={ deleting }
            />
        </>
    );
}

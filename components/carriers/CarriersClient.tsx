'use client';

import { useState }            from 'react';
import { useRouter }           from 'next/navigation';
import {
    Badge,
    Button,
    Flex,
    Heading,
    IconButton,
    Select,
    Table,
    Text,
}                              from '@radix-ui/themes';
import { Trash2 }              from 'lucide-react';
import { CarrierDialog }       from './CarrierDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useEntityDelete }     from '@/hooks/use-entity-delete';
import type {
    CarrierDto,
    CarrierMode,
    CarrierStatus,
}                              from '@/lib/dto/carrier.dto';
import { CARRIER_MODE_LABELS } from '@/lib/dto/carrier.dto';

interface CarriersClientProps {
    initialCarriers: CarrierDto[];
    workspaceSlug: string;
}

export function CarriersClient({
                                   initialCarriers,
                                   workspaceSlug,
                               }: CarriersClientProps): React.ReactElement {
    const router = useRouter();
    const [carriers, setCarriers] = useState<CarrierDto[]>(initialCarriers);
    const [filterMode, setFilterMode] = useState<CarrierMode | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CarrierStatus | 'all'>('all');
    const [dialogOpen, setDialogOpen] = useState(false);

    const { deleteTarget, setDeleteTarget, deleting, handleDelete } = useEntityDelete<CarrierDto>({
        endpoint: (c) => `/api/${ workspaceSlug }/carriers/${ c.seqId }`,
        onDeleted: (c) => setCarriers((prev) => prev.filter((x) => x.id !== c.id)),
    });

    const filtered = carriers.filter((c) => {
        if ( filterMode !== 'all' && c.mode !== filterMode ) {
            return false;
        }
        return !(filterStatus !== 'all' && c.status !== filterStatus);
    });

    function handleSaved(saved: CarrierDto): void {
        setCarriers((prev) =>
            [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)),
        );
    }

    return (
        <>
            <Flex justify="between" align="center" mb="5">
                <Heading size="6">Carriers</Heading>
                <Button onClick={ () => setDialogOpen(true) }>New Carrier</Button>
            </Flex>

            { carriers.length > 0 && (
                <Flex gap="3" mb="4">
                    <Select.Root
                        value={ filterMode }
                        onValueChange={ (v) => setFilterMode(v as CarrierMode | 'all') }
                    >
                        <Select.Trigger placeholder="Mode"/>
                        <Select.Content>
                            <Select.Item value="all">All modes</Select.Item>
                            { (Object.entries(CARRIER_MODE_LABELS) as [CarrierMode, string][]).map(
                                ([value, label]) => (
                                    <Select.Item key={ value } value={ value }>{ label }</Select.Item>
                                ),
                            ) }
                        </Select.Content>
                    </Select.Root>

                    <Select.Root
                        value={ filterStatus }
                        onValueChange={ (v) => setFilterStatus(v as CarrierStatus | 'all') }
                    >
                        <Select.Trigger placeholder="Status"/>
                        <Select.Content>
                            <Select.Item value="all">All statuses</Select.Item>
                            <Select.Item value="active">Active</Select.Item>
                            <Select.Item value="inactive">Inactive</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>
            ) }

            { carriers.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No carriers yet.</Text>
                    <Button variant="soft" onClick={ () => setDialogOpen(true) }>
                        Add your first carrier
                    </Button>
                </Flex>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Code</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Mode</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Contact</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { filtered.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={ 6 }>
                                    <Text size="2" color="gray">
                                        No carriers match the selected filters.
                                    </Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : filtered.map((carrier) => (
                            <Table.Row
                                key={ carrier.id }
                                align="center"
                                style={ { cursor: 'pointer' } }
                                onClick={ () =>
                                    router.push(`/${ workspaceSlug }/carriers/${ carrier.seqId }/details`)
                                }
                            >
                                <Table.Cell>
                                    <Text weight="medium">{ carrier.name }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">{ carrier.code }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="blue" variant="soft">
                                        { CARRIER_MODE_LABELS[carrier.mode] }
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={ carrier.status === 'active' ? 'green' : 'gray' }
                                        variant="soft"
                                    >
                                        { carrier.status === 'active' ? 'Active' : 'Inactive' }
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    { carrier.contactName ? (
                                        <>
                                            <Text size="2">{ carrier.contactName }</Text>
                                            { carrier.contactEmail && (
                                                <Text size="1" color="gray" as="p">
                                                    { carrier.contactEmail }
                                                </Text>
                                            ) }
                                        </>
                                    ) : (
                                        <Text size="2" color="gray">—</Text>
                                    ) }
                                </Table.Cell>
                                <Table.Cell onClick={ (e) => e.stopPropagation() }>
                                    <Flex justify="end">
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            color="red"
                                            aria-label="Delete carrier"
                                            onClick={ () => setDeleteTarget(carrier) }
                                        >
                                            <Trash2 size={ 14 }/>
                                        </IconButton>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        )) }
                    </Table.Body>
                </Table.Root>
            ) }

            <CarrierDialog
                workspaceSlug={ workspaceSlug }
                open={ dialogOpen }
                onOpenChange={ setDialogOpen }
                onSuccess={ handleSaved }
            />

            <DeleteConfirmDialog
                open={ Boolean(deleteTarget) }
                onOpenChange={ (open) => {
                    if ( !open ) {
                        setDeleteTarget(undefined);
                    }
                } }
                title="Delete carrier?"
                description={
                    <><strong>{ deleteTarget?.name }</strong> will be permanently removed. This
                        action cannot be undone.</>
                }
                onConfirm={ handleDelete }
                deleting={ deleting }
            />
        </>
    );
}

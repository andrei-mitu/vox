'use client';

import {useState} from 'react';
import {AlertDialog, Badge, Button, Flex, Heading, IconButton, Select, Table, Text} from '@radix-ui/themes';
import {Pencil, Trash2} from 'lucide-react';
import {CarrierDialog} from './CarrierDialog';
import {CARRIER_MODE_LABELS} from '@/lib/dto/carrier.dto';
import type {CarrierDto} from '@/lib/dto/carrier.dto';
import type {CarrierMode, CarrierStatus} from '@/lib/db/schema';

interface CarriersClientProps {
    initialCarriers: CarrierDto[];
    workspaceSlug: string;
}

export function CarriersClient({
    initialCarriers,
    workspaceSlug,
}: CarriersClientProps): React.ReactElement {
    const [carriers, setCarriers] = useState<CarrierDto[]>(initialCarriers);
    const [filterMode, setFilterMode] = useState<CarrierMode | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<CarrierStatus | 'all'>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<CarrierDto | undefined>(undefined);
    const [deleteTarget, setDeleteTarget] = useState<CarrierDto | undefined>(undefined);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filtered = carriers.filter((c) => {
        if (filterMode !== 'all' && c.mode !== filterMode) return false;
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        return true;
    });

    function openCreate(): void {
        setEditTarget(undefined);
        setDialogOpen(true);
    }

    function openEdit(carrier: CarrierDto): void {
        setEditTarget(carrier);
        setDialogOpen(true);
    }

    function handleSaved(saved: CarrierDto): void {
        setCarriers((prev) => {
            const exists = prev.some((c) => c.id === saved.id);
            const next = exists
                ? prev.map((c) => (c.id === saved.id ? saved : c))
                : [...prev, saved];
            return next.sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    async function handleDelete(): Promise<void> {
        if (!deleteTarget) return;
        setDeleteError(null);
        setDeleting(true);

        try {
            const res = await fetch(`/api/${workspaceSlug}/carriers/${deleteTarget.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setDeleteError((body as {error?: string}).error ?? 'Failed to delete carrier.');
                return;
            }

            setCarriers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            setDeleteTarget(undefined);
        } catch {
            setDeleteError('Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <Flex justify="between" align="center" mb="5">
                <Heading size="6">Carriers</Heading>
                <Button onClick={openCreate}>New Carrier</Button>
            </Flex>

            {carriers.length > 0 && (
                <Flex gap="3" mb="4">
                    <Select.Root
                        value={filterMode}
                        onValueChange={(v) => setFilterMode(v as CarrierMode | 'all')}
                    >
                        <Select.Trigger placeholder="Mode" />
                        <Select.Content>
                            <Select.Item value="all">All modes</Select.Item>
                            {(Object.entries(CARRIER_MODE_LABELS) as [CarrierMode, string][]).map(([value, label]) => (
                                <Select.Item key={value} value={value}>{label}</Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Root>

                    <Select.Root
                        value={filterStatus}
                        onValueChange={(v) => setFilterStatus(v as CarrierStatus | 'all')}
                    >
                        <Select.Trigger placeholder="Status" />
                        <Select.Content>
                            <Select.Item value="all">All statuses</Select.Item>
                            <Select.Item value="active">Active</Select.Item>
                            <Select.Item value="inactive">Inactive</Select.Item>
                        </Select.Content>
                    </Select.Root>
                </Flex>
            )}

            {carriers.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No carriers yet.</Text>
                    <Button variant="soft" onClick={openCreate}>Add your first carrier</Button>
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
                            <Table.ColumnHeaderCell />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filtered.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={6}>
                                    <Text size="2" color="gray">No carriers match the selected filters.</Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : filtered.map((carrier) => (
                            <Table.Row key={carrier.id} align="center">
                                <Table.Cell>
                                    <Text weight="medium">{carrier.name}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">{carrier.code}</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge color="blue" variant="soft">
                                        {CARRIER_MODE_LABELS[carrier.mode]}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    <Badge
                                        color={carrier.status === 'active' ? 'green' : 'gray'}
                                        variant="soft"
                                    >
                                        {carrier.status === 'active' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>
                                    {carrier.contactName ? (
                                        <>
                                            <Text size="2">{carrier.contactName}</Text>
                                            {carrier.contactEmail && (
                                                <Text size="1" color="gray" as="p">{carrier.contactEmail}</Text>
                                            )}
                                        </>
                                    ) : (
                                        <Text size="2" color="gray">—</Text>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex gap="2" justify="end">
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            aria-label="Edit carrier"
                                            onClick={() => openEdit(carrier)}
                                        >
                                            <Pencil size={14} />
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            color="red"
                                            aria-label="Delete carrier"
                                            onClick={() => {
                                                setDeleteError(null);
                                                setDeleteTarget(carrier);
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    </Flex>
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            )}

            <CarrierDialog
                key={editTarget?.id ?? 'new'}
                workspaceSlug={workspaceSlug}
                carrier={editTarget}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={handleSaved}
            />

            <AlertDialog.Root
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteTarget(undefined);
                        setDeleteError(null);
                    }
                }}
            >
                <AlertDialog.Content maxWidth="400px">
                    <AlertDialog.Title>Delete carrier?</AlertDialog.Title>
                    <AlertDialog.Description>
                        <strong>{deleteTarget?.name}</strong> will be permanently removed. This action
                        cannot be undone.
                    </AlertDialog.Description>

                    {deleteError && (
                        <Text size="2" color="red" mt="2" as="p">{deleteError}</Text>
                    )}

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </AlertDialog.Cancel>
                        <Button color="red" onClick={handleDelete} disabled={deleting}>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    );
}

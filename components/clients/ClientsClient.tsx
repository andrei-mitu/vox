'use client';

import {useState} from 'react';
import {AlertDialog, Button, Flex, Heading, IconButton, Table, Text, TextField} from '@radix-ui/themes';
import {Pencil, Search, Trash2} from 'lucide-react';
import {ClientDialog} from './ClientDialog';
import type {ClientDto} from '@/lib/dto/client.dto';

interface ClientsClientProps {
    initialClients: ClientDto[];
    workspaceSlug: string;
}

export function ClientsClient({
    initialClients,
    workspaceSlug,
}: ClientsClientProps): React.ReactElement {
    const [clientsList, setClientsList] = useState<ClientDto[]>(initialClients);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<ClientDto | undefined>(undefined);
    const [deleteTarget, setDeleteTarget] = useState<ClientDto | undefined>(undefined);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filtered = search.trim()
        ? clientsList.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false),
        )
        : clientsList;

    function openCreate(): void {
        setEditTarget(undefined);
        setDialogOpen(true);
    }

    function openEdit(client: ClientDto): void {
        setEditTarget(client);
        setDialogOpen(true);
    }

    function handleSaved(saved: ClientDto): void {
        setClientsList((prev) => {
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
            const res = await fetch(`/api/${workspaceSlug}/clients/${deleteTarget.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setDeleteError((body as {error?: string}).error ?? 'Failed to delete client.');
                return;
            }

            setClientsList((prev) => prev.filter((c) => c.id !== deleteTarget.id));
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
                <Heading size="6">Clients</Heading>
                <Button onClick={openCreate}>New Client</Button>
            </Flex>

            {clientsList.length > 0 && (
                <Flex mb="4" style={{maxWidth: 320}}>
                    <TextField.Root
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or contact…"
                        style={{width: '100%'}}
                    >
                        <TextField.Slot>
                            <Search size={14} />
                        </TextField.Slot>
                    </TextField.Root>
                </Flex>
            )}

            {clientsList.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No clients yet.</Text>
                    <Button variant="soft" onClick={openCreate}>Add your first client</Button>
                </Flex>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Contact</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {filtered.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={4}>
                                    <Text size="2" color="gray">No clients match your search.</Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : filtered.map((client) => (
                            <Table.Row key={client.id} align="center">
                                <Table.Cell>
                                    <Flex direction="column" gap="1">
                                        <Text weight="medium">{client.name}</Text>
                                        {client.contactEmail && (
                                            <Text size="1" color="gray">{client.contactEmail}</Text>
                                        )}
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    {client.contactName
                                        ? <Text size="2">{client.contactName}</Text>
                                        : <Text size="2" color="gray">—</Text>
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    {client.contactPhone
                                        ? <Text size="2">{client.contactPhone}</Text>
                                        : <Text size="2" color="gray">—</Text>
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    <Flex gap="2" justify="end">
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            aria-label="Edit client"
                                            onClick={() => openEdit(client)}
                                        >
                                            <Pencil size={14} />
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            color="red"
                                            aria-label="Delete client"
                                            onClick={() => {
                                                setDeleteError(null);
                                                setDeleteTarget(client);
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

            <ClientDialog
                key={editTarget?.id ?? 'new'}
                workspaceSlug={workspaceSlug}
                client={editTarget}
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
                    <AlertDialog.Title>Delete client?</AlertDialog.Title>
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

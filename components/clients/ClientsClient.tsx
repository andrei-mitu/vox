'use client';

import { useState }            from 'react';
import { useRouter }           from 'next/navigation';
import {
    Button,
    Flex,
    Heading,
    IconButton,
    Table,
    Text,
    TextField,
}                              from '@radix-ui/themes';
import {
    Search,
    Trash2
}                              from 'lucide-react';
import { ClientDialog }        from './ClientDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useEntityDelete }     from '@/hooks/use-entity-delete';
import type { ClientDto }      from '@/lib/dto/client.dto';

interface ClientsClientProps {
    initialClients: ClientDto[];
    workspaceSlug: string;
}

export function ClientsClient({
                                  initialClients,
                                  workspaceSlug,
                              }: ClientsClientProps): React.ReactElement {
    const router = useRouter();
    const [clientsList, setClientsList] = useState<ClientDto[]>(initialClients);
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const { deleteTarget, setDeleteTarget, deleting, handleDelete } = useEntityDelete<ClientDto>({
        endpoint: (c) => `/api/${ workspaceSlug }/clients/${ c.seqId }`,
        onDeleted: (c) => setClientsList((prev) => prev.filter((x) => x.id !== c.id)),
    });

    const filtered = search.trim()
        ? clientsList.filter((c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.contactName?.toLowerCase().includes(search.toLowerCase()) ?? false),
        )
        : clientsList;

    function handleSaved(saved: ClientDto): void {
        setClientsList((prev) =>
            [...prev, saved].sort((a, b) => a.name.localeCompare(b.name)),
        );
    }

    return (
        <>
            <Flex justify="between" align="center" mb="5">
                <Heading size="6">Clients</Heading>
                <Button onClick={ () => setDialogOpen(true) }>New Client</Button>
            </Flex>

            { clientsList.length > 0 && (
                <Flex mb="4" style={ { maxWidth: 320 } }>
                    <TextField.Root
                        value={ search }
                        onChange={ (e) => setSearch(e.target.value) }
                        placeholder="Search by name or contact…"
                        style={ { width: '100%' } }
                    >
                        <TextField.Slot>
                            <Search size={ 14 }/>
                        </TextField.Slot>
                    </TextField.Root>
                </Flex>
            ) }

            { clientsList.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No clients yet.</Text>
                    <Button variant="soft" onClick={ () => setDialogOpen(true) }>
                        Add your first client
                    </Button>
                </Flex>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Contact</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { filtered.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={ 4 }>
                                    <Text size="2" color="gray">No clients match your search.</Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : filtered.map((client) => (
                            <Table.Row
                                key={ client.id }
                                align="center"
                                style={ { cursor: 'pointer' } }
                                onClick={ () =>
                                    router.push(`/${ workspaceSlug }/clients/${ client.seqId }/details`)
                                }
                            >
                                <Table.Cell>
                                    <Flex direction="column" gap="1">
                                        <Text weight="medium">{ client.name }</Text>
                                        { client.contactEmail && (
                                            <Text size="1" color="gray">{ client.contactEmail }</Text>
                                        ) }
                                    </Flex>
                                </Table.Cell>
                                <Table.Cell>
                                    { client.contactName
                                        ? <Text size="2">{ client.contactName }</Text>
                                        : <Text size="2" color="gray">—</Text>
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    { client.contactPhone
                                        ? <Text size="2">{ client.contactPhone }</Text>
                                        : <Text size="2" color="gray">—</Text>
                                    }
                                </Table.Cell>
                                <Table.Cell onClick={ (e) => e.stopPropagation() }>
                                    <Flex justify="end">
                                        <IconButton
                                            variant="ghost"
                                            size="1"
                                            color="red"
                                            aria-label="Delete client"
                                            onClick={ () => setDeleteTarget(client) }
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

            <ClientDialog
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
                title="Delete client?"
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

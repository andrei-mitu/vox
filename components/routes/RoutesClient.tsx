'use client';

import { useState }            from 'react';
import { useRouter }           from 'next/navigation';
import {
    Badge,
    Button,
    Flex,
    Heading,
    IconButton,
    Table,
    Text,
}                              from '@radix-ui/themes';
import { Trash2 }              from 'lucide-react';
import { RouteDialog }         from './RouteDialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { useEntityDelete }     from '@/hooks/use-entity-delete';
import type { RouteDto }       from '@/lib/dto/route.dto';

interface RoutesClientProps {
    initialRoutes: RouteDto[];
    workspaceSlug: string;
}

export function RoutesClient({
                                 initialRoutes,
                                 workspaceSlug,
                             }: RoutesClientProps): React.ReactElement {
    const router = useRouter();
    const [routes, setRoutes] = useState<RouteDto[]>(initialRoutes);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { deleteTarget, setDeleteTarget, deleting, handleDelete } = useEntityDelete<RouteDto>({
        endpoint: (r) => `/api/${ workspaceSlug }/routes/${ r.seqId }`,
        onDeleted: (r) => setRoutes((prev) => prev.filter((x) => x.id !== r.id)),
    });

    function handleSaved(saved: RouteDto): void {
        setRoutes((prev) => {
            const exists = prev.some((r) => r.id === saved.id);
            const next = exists
                ? prev.map((r) => (r.id === saved.id ? saved : r))
                : [...prev, saved];
            return next.sort((a, b) =>
                `${ a.originCity }${ a.destCity }`.localeCompare(`${ b.originCity }${ b.destCity }`),
            );
        });
    }

    return (
        <>
            <Flex justify="between" align="center" mb="5">
                <Heading size="6">Routes</Heading>
                <Button onClick={ () => setDialogOpen(true) }>New Route</Button>
            </Flex>

            { routes.length === 0 ? (
                <Flex direction="column" align="center" gap="2" py="9">
                    <Text size="3" color="gray">No routes yet.</Text>
                    <Button variant="soft" onClick={ () => setDialogOpen(true) }>
                        Add your first route
                    </Button>
                </Flex>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Origin</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Destination</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Distance</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Transit</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell/>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { routes.map((route) => (
                            <Table.Row
                                key={ route.id }
                                align="center"
                                style={ { cursor: 'pointer' } }
                                onClick={ () =>
                                    router.push(`/${ workspaceSlug }/routes/${ route.seqId }/details`)
                                }
                            >
                                <Table.Cell>
                                    <Text weight="medium">{ route.originCity }</Text>
                                    <Text size="1" color="gray" as="p">{ route.originCountry }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text weight="medium">{ route.destCity }</Text>
                                    <Text size="1" color="gray" as="p">{ route.destCountry }</Text>
                                </Table.Cell>
                                <Table.Cell>
                                    { route.distanceKm != null ? (
                                        <Badge color="blue" variant="soft">
                                            { route.distanceKm.toLocaleString() } km
                                        </Badge>
                                    ) : (
                                        <Text size="2" color="gray">—</Text>
                                    ) }
                                </Table.Cell>
                                <Table.Cell>
                                    { route.transitDays != null ? (
                                        <Text size="2">
                                            { route.transitDays } { route.transitDays === 1 ? 'day' : 'days' }
                                        </Text>
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
                                            aria-label="Delete route"
                                            onClick={ () => setDeleteTarget(route) }
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

            <RouteDialog
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
                title="Delete route?"
                description={
                    <>
                        <strong>
                            { deleteTarget?.originCity }, { deleteTarget?.originCountry }
                            { ' → ' }
                            { deleteTarget?.destCity }, { deleteTarget?.destCountry }
                        </strong>{ ' ' }
                        will be permanently removed. This action cannot be undone.
                    </>
                }
                onConfirm={ handleDelete }
                deleting={ deleting }
            />
        </>
    );
}

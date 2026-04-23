'use client';

import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import Link             from 'next/link';
import {
    AlertDialog,
    Button,
    Flex,
    Heading,
    Text,
    TextArea,
    TextField,
}                       from '@radix-ui/themes';
import {
    ArrowLeft,
    Pencil,
    Trash2,
}                       from 'lucide-react';
import type {
    CreateRouteInput,
    RouteDto,
}                       from '@/lib/dto/route.dto';
import { DetailsTable } from '@/components/detail-shell/DetailsTable';

interface RouteDetailClientProps {
    route: RouteDto;
    workspaceSlug: string;
}

function routeToForm(route: RouteDto): CreateRouteInput {
    return {
        originCity: route.originCity,
        originCountry: route.originCountry,
        destCity: route.destCity,
        destCountry: route.destCountry,
        distanceKm: route.distanceKm,
        transitDays: route.transitDays,
        notes: route.notes,
    };
}

export function RouteDetailClient({
                                      route: initialRoute,
                                      workspaceSlug,
                                  }: RouteDetailClientProps): React.ReactElement {
    const router = useRouter();
    const [route, setRoute] = useState<RouteDto>(initialRoute);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CreateRouteInput>(routeToForm(initialRoute));
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    function startEdit(): void {
        setForm(routeToForm(route));
        setSaveError(null);
        setEditing(true);
    }

    function cancelEdit(): void {
        setEditing(false);
        setSaveError(null);
    }

    function set<K extends keyof CreateRouteInput>(key: K, value: CreateRouteInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSaveError(null);
        setSaving(true);

        try {
            const res = await fetch(`/api/${ workspaceSlug }/routes/${ route.id }`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setSaveError((body as { error?: string }).error ?? 'Something went wrong.');
                return;
            }

            const saved: RouteDto = await res.json();
            setRoute(saved);
            setEditing(false);
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(): Promise<void> {
        setDeleteError(null);
        setDeleting(true);

        try {
            const res = await fetch(`/api/${ workspaceSlug }/routes/${ route.id }`, {
                method: 'DELETE',
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setDeleteError((body as { error?: string }).error ?? 'Failed to delete route.');
                return;
            }

            router.push(`/${ workspaceSlug }/routes`);
        } catch {
            setDeleteError('Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    }

    const displayName = `${ route.originCity }, ${ route.originCountry } → ${ route.destCity }, ${ route.destCountry }`;

    return (
        <>
            {/* Back link */ }
            <Flex mb="4">
                <Link
                    href={ `/${ workspaceSlug }/routes` }
                    className="flex items-center gap-1 text-sm text-[var(--gray-11)] hover:text-[var(--gray-12)] transition-colors"
                >
                    <ArrowLeft size={ 14 }/>
                    Routes
                </Link>
            </Flex>

            {/* Header */ }
            <Flex justify="between" align="start" mb="6">
                <Heading size="6">{ displayName }</Heading>
                { !editing && (
                    <Flex gap="2">
                        <Button variant="soft" onClick={ startEdit }>
                            <Pencil size={ 14 }/>
                            Edit
                        </Button>
                        <Button
                            variant="soft"
                            color="red"
                            onClick={ () => {
                                setDeleteError(null);
                                setDeleteOpen(true);
                            } }
                        >
                            <Trash2 size={ 14 }/>
                            Delete
                        </Button>
                    </Flex>
                ) }
            </Flex>

            {/* Details */ }
            { editing ? (
                <form onSubmit={ handleSave }>
                    <Flex direction="column" gap="4" style={ { maxWidth: 560 } }>
                        <Text size="2" weight="medium" color="gray">Origin</Text>
                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">City *</Text>
                                <TextField.Root
                                    value={ form.originCity }
                                    onChange={ (e) => set('originCity', e.target.value) }
                                    required
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Country *</Text>
                                <TextField.Root
                                    value={ form.originCountry }
                                    onChange={ (e) => set('originCountry', e.target.value) }
                                    required
                                />
                            </Flex>
                        </Flex>

                        <Text size="2" weight="medium" color="gray">Destination</Text>
                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">City *</Text>
                                <TextField.Root
                                    value={ form.destCity }
                                    onChange={ (e) => set('destCity', e.target.value) }
                                    required
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Country *</Text>
                                <TextField.Root
                                    value={ form.destCountry }
                                    onChange={ (e) => set('destCountry', e.target.value) }
                                    required
                                />
                            </Flex>
                        </Flex>

                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Distance (km)</Text>
                                <TextField.Root
                                    type="number"
                                    min="1"
                                    value={ form.distanceKm ?? '' }
                                    onChange={ (e) =>
                                        set('distanceKm', e.target.value ? Number(e.target.value) : null)
                                    }
                                    placeholder="e.g. 450"
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Transit days</Text>
                                <TextField.Root
                                    type="number"
                                    min="1"
                                    value={ form.transitDays ?? '' }
                                    onChange={ (e) =>
                                        set('transitDays', e.target.value ? Number(e.target.value) : null)
                                    }
                                    placeholder="e.g. 2"
                                />
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Notes</Text>
                            <TextArea
                                value={ form.notes ?? '' }
                                onChange={ (e) => set('notes', e.target.value || null) }
                                rows={ 4 }
                            />
                        </Flex>

                        { saveError && (
                            <Text size="2" color="red">{ saveError }</Text>
                        ) }

                        <Flex gap="3">
                            <Button type="submit" disabled={ saving }>
                                { saving ? 'Saving…' : 'Save changes' }
                            </Button>
                            <Button variant="soft" color="gray" type="button" onClick={ cancelEdit }>
                                Cancel
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            ) : (
                <Flex style={ { maxWidth: 640 } }>
                    <DetailsTable rows={ [
                        { label: 'Origin city', value: route.originCity },
                        { label: 'Origin country', value: route.originCountry },
                        { label: 'Destination city', value: route.destCity },
                        { label: 'Destination country', value: route.destCountry },
                        {
                            label: 'Distance',
                            value: route.distanceKm != null
                                ? `${ route.distanceKm.toLocaleString() } km`
                                : null,
                        },
                        {
                            label: 'Est. transit',
                            value: route.transitDays != null
                                ? `${ route.transitDays } ${ route.transitDays === 1 ? 'day' : 'days' }`
                                : null,
                        },
                        { label: 'Notes', value: route.notes },
                    ] }/>
                </Flex>
            ) }

            {/* Delete confirmation */ }
            <AlertDialog.Root
                open={ deleteOpen }
                onOpenChange={ (open) => {
                    if ( !open ) {
                        setDeleteOpen(false);
                        setDeleteError(null);
                    }
                } }
            >
                <AlertDialog.Content maxWidth="400px">
                    <AlertDialog.Title>Delete route?</AlertDialog.Title>
                    <AlertDialog.Description>
                        <strong>{ displayName }</strong> will be permanently removed. This action
                        cannot be undone.
                    </AlertDialog.Description>

                    { deleteError && (
                        <Text size="2" color="red" mt="2" as="p">{ deleteError }</Text>
                    ) }

                    <Flex gap="3" mt="4" justify="end">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray">Cancel</Button>
                        </AlertDialog.Cancel>
                        <Button color="red" onClick={ handleDelete } disabled={ deleting }>
                            { deleting ? 'Deleting…' : 'Delete' }
                        </Button>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    );
}

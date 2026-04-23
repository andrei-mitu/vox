'use client';

import { useState } from 'react';
import {
    Button,
    Dialog,
    Flex,
    Text,
    TextArea,
    TextField,
}                   from '@radix-ui/themes';
import type {
    CreateRouteInput,
    RouteDto,
}                   from '@/lib/dto/route.dto';

interface RouteDialogProps {
    workspaceSlug: string;
    route?: RouteDto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (route: RouteDto) => void;
}

const defaultForm = (): CreateRouteInput => ({
    originCity: '',
    originCountry: '',
    destCity: '',
    destCountry: '',
    distanceKm: null,
    transitDays: null,
    notes: null,
});

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

export function RouteDialog({
                                workspaceSlug,
                                route,
                                open,
                                onOpenChange,
                                onSuccess,
                            }: RouteDialogProps): React.ReactElement {
    const isEditing = Boolean(route);
    const [form, setForm] = useState<CreateRouteInput>(
        route ? routeToForm(route) : defaultForm(),
    );
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean): void {
        if ( !next ) {
            setForm(route ? routeToForm(route) : defaultForm());
            setError(null);
        }
        onOpenChange(next);
    }

    function set<K extends keyof CreateRouteInput>(key: K, value: CreateRouteInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const url = isEditing
                ? `/api/${ workspaceSlug }/routes/${ route!.id }`
                : `/api/${ workspaceSlug }/routes`;
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setError((body as { error?: string }).error ?? 'Something went wrong.');
                return;
            }

            const saved: RouteDto = await res.json();
            onSuccess(saved);
            handleOpenChange(false);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog.Root open={ open } onOpenChange={ handleOpenChange }>
            <Dialog.Content maxWidth="480px">
                <Dialog.Title>{ isEditing ? 'Edit Route' : 'New Route' }</Dialog.Title>

                <form onSubmit={ handleSubmit }>
                    <Flex direction="column" gap="3" mt="4">
                        <Text size="2" weight="medium" color="gray">Origin</Text>
                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">City *</Text>
                                <TextField.Root
                                    value={ form.originCity }
                                    onChange={ (e) => set('originCity', e.target.value) }
                                    placeholder="e.g. Chișinău"
                                    required
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Country *</Text>
                                <TextField.Root
                                    value={ form.originCountry }
                                    onChange={ (e) => set('originCountry', e.target.value) }
                                    placeholder="e.g. MD"
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
                                    placeholder="e.g. Bucharest"
                                    required
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Country *</Text>
                                <TextField.Root
                                    value={ form.destCountry }
                                    onChange={ (e) => set('destCountry', e.target.value) }
                                    placeholder="e.g. RO"
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
                                    onChange={ (e) => set(
                                        'distanceKm',
                                        e.target.value ? Number(e.target.value) : null,
                                    ) }
                                    placeholder="e.g. 450"
                                />
                            </Flex>
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Transit days</Text>
                                <TextField.Root
                                    type="number"
                                    min="1"
                                    value={ form.transitDays ?? '' }
                                    onChange={ (e) => set(
                                        'transitDays',
                                        e.target.value ? Number(e.target.value) : null,
                                    ) }
                                    placeholder="e.g. 2"
                                />
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Notes</Text>
                            <TextArea
                                value={ form.notes ?? '' }
                                onChange={ (e) => set('notes', e.target.value || null) }
                                placeholder="Additional notes..."
                                rows={ 3 }
                            />
                        </Flex>

                        { error && (
                            <Text size="2" color="red">{ error }</Text>
                        ) }

                        <Flex gap="3" justify="end" mt="2">
                            <Dialog.Close>
                                <Button variant="soft" color="gray" type="button">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button type="submit" disabled={ submitting }>
                                { submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create route' }
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

'use client';

import {
    Button,
    Dialog,
    Flex,
    Text,
    TextArea,
    TextField,
}                        from '@radix-ui/themes';
import type {
    CreateRouteInput,
    RouteDto,
}                        from '@/lib/dto/route.dto';
import { useDialogForm } from '@/hooks/use-dialog-form';

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
    const { form, set, submitting, isEditing, handleOpenChange, handleSubmit } =
        useDialogForm<CreateRouteInput, RouteDto>({
            entity: route,
            defaultForm,
            entityToForm: routeToForm,
            createEndpoint: `/api/${ workspaceSlug }/routes`,
            updateEndpoint: route ? `/api/${ workspaceSlug }/routes/${ route.seqId }` : undefined,
            onSuccess,
            onOpenChange,
        });

    return (
        <Dialog.Root open={ open } onOpenChange={ handleOpenChange }>
            <Dialog.Content maxWidth="480px">
                <Dialog.Title>{ isEditing ? 'Edit Route' : 'New Route' }</Dialog.Title>

                <form onSubmit={ handleSubmit }>
                    <Flex direction="column" gap="3" mt="4">
                        <Text size="2" weight="medium" color="gray">Origin</Text>
                        <Flex gap="3">
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.originCity }
                                onChange={ (e) => set('originCity', e.target.value) }
                                placeholder="City *"
                                required
                            />
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.originCountry }
                                onChange={ (e) => set('originCountry', e.target.value) }
                                placeholder="Country *"
                                required
                            />
                        </Flex>

                        <Text size="2" weight="medium" color="gray">Destination</Text>
                        <Flex gap="3">
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.destCity }
                                onChange={ (e) => set('destCity', e.target.value) }
                                placeholder="City *"
                                required
                            />
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.destCountry }
                                onChange={ (e) => set('destCountry', e.target.value) }
                                placeholder="Country *"
                                required
                            />
                        </Flex>

                        <Flex gap="3">
                            <TextField.Root
                                style={ { flex: 1 } }
                                type="number"
                                min="1"
                                value={ form.distanceKm ?? '' }
                                onChange={ (e) => set('distanceKm', e.target.value ? Number(e.target.value) : null) }
                                placeholder="Distance (km)"
                            />
                            <TextField.Root
                                style={ { flex: 1 } }
                                type="number"
                                min="1"
                                value={ form.transitDays ?? '' }
                                onChange={ (e) => set('transitDays', e.target.value ? Number(e.target.value) : null) }
                                placeholder="Transit days"
                            />
                        </Flex>

                        <TextArea
                            value={ form.notes ?? '' }
                            onChange={ (e) => set('notes', e.target.value || null) }
                            placeholder="Notes"
                            rows={ 3 }
                        />

                        <Flex gap="3" justify="end" mt="2">
                            <Dialog.Close>
                                <Button variant="soft" color="gray" type="button">Cancel</Button>
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

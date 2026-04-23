'use client';

import { useState }            from 'react';
import {
    Button,
    Dialog,
    Flex,
    Select,
    TextArea,
    TextField,
}                              from '@radix-ui/themes';
import type {
    CarrierDto,
    CreateCarrierInput
}                              from '@/lib/dto/carrier.dto';
import { CARRIER_MODE_LABELS } from '@/lib/dto/carrier.dto';
import {
    apiPatch,
    apiPost
}                              from '@/lib/client/api';
import { useNotify }           from '@/lib/client/notifications';

interface CarrierDialogProps {
    workspaceSlug: string;
    carrier?: CarrierDto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (carrier: CarrierDto) => void;
}

const defaultForm = (): CreateCarrierInput => ({
    name: '',
    code: '',
    mode: 'road',
    status: 'active',
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    notes: null,
});

function carrierToForm(carrier: CarrierDto): CreateCarrierInput {
    return {
        name: carrier.name,
        code: carrier.code,
        mode: carrier.mode,
        status: carrier.status,
        contactName: carrier.contactName,
        contactEmail: carrier.contactEmail,
        contactPhone: carrier.contactPhone,
        notes: carrier.notes,
    };
}

export function CarrierDialog({
    workspaceSlug,
    carrier,
    open,
    onOpenChange,
    onSuccess,
}: CarrierDialogProps): React.ReactElement {
    const isEditing = Boolean(carrier);
    const notify = useNotify();
    const [form, setForm] = useState<CreateCarrierInput>(
        carrier ? carrierToForm(carrier) : defaultForm(),
    );
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean): void {
        if ( !next ) {
            setForm(carrier ? carrierToForm(carrier) : defaultForm());
        }
        onOpenChange(next);
    }

    function set<K extends keyof CreateCarrierInput>(key: K, value: CreateCarrierInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = isEditing
                ? await apiPatch<CarrierDto>(`/api/${ workspaceSlug }/carriers/${ carrier!.id }`, form)
                : await apiPost<CarrierDto>(`/api/${ workspaceSlug }/carriers`, form);

            if ( !result.ok ) {
                notify(result.error, 'error');
                return;
            }

            onSuccess(result.data);
            handleOpenChange(false);
        } catch {
            notify('Network error. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog.Root open={ open } onOpenChange={ handleOpenChange }>
            <Dialog.Content maxWidth="480px">
                <Dialog.Title>{ isEditing ? 'Edit Carrier' : 'New Carrier' }</Dialog.Title>

                <form onSubmit={ handleSubmit }>
                    <Flex direction="column" gap="3" mt="4">
                        <Flex direction="column" gap="1">
                            <TextField.Root
                                value={ form.name }
                                onChange={ (e) => set('name', e.target.value) }
                                placeholder="Name *"
                                required
                            />
                        </Flex>

                        <Flex direction="column" gap="1">
                            <TextField.Root
                                value={ form.code }
                                onChange={ (e) => set('code', e.target.value.toUpperCase()) }
                                placeholder="Code *"
                                required
                            />
                        </Flex>

                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Select.Root
                                    value={ form.mode }
                                    onValueChange={ (v) => set('mode', v as CreateCarrierInput['mode']) }
                                >
                                    <Select.Trigger style={ { width: '100%' } }/>
                                    <Select.Content>
                                        { (Object.entries(CARRIER_MODE_LABELS) as [CreateCarrierInput['mode'], string][]).map(([value, label]) => (
                                            <Select.Item key={ value } value={ value }>{ label }</Select.Item>
                                        )) }
                                    </Select.Content>
                                </Select.Root>
                            </Flex>

                            <Flex direction="column" gap="1" flexGrow="1">
                                <Select.Root
                                    value={ form.status }
                                    onValueChange={ (v) => set('status', v as CreateCarrierInput['status']) }
                                >
                                    <Select.Trigger style={ { width: '100%' } }/>
                                    <Select.Content>
                                        <Select.Item value="active">Active</Select.Item>
                                        <Select.Item value="inactive">Inactive</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </Flex>
                        </Flex>

                        <TextField.Root
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="Contact name"
                        />

                        <Flex gap="3">
                            <TextField.Root
                                style={ { flex: 1 } }
                                type="email"
                                value={ form.contactEmail ?? '' }
                                onChange={ (e) => set('contactEmail', e.target.value || null) }
                                placeholder="Contact email"
                            />
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.contactPhone ?? '' }
                                onChange={ (e) => set('contactPhone', e.target.value || null) }
                                placeholder="Contact phone"
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
                                { submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create carrier' }
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

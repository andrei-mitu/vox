'use client';

import { useState }  from 'react';
import {
    Button,
    Dialog,
    Flex,
    TextArea,
    TextField,
}                    from '@radix-ui/themes';
import type {
    ClientDto,
    CreateClientInput
}                    from '@/lib/dto/client.dto';
import {
    apiPatch,
    apiPost
}                    from '@/lib/client/api';
import { useNotify } from '@/lib/client/notifications';

interface ClientDialogProps {
    workspaceSlug: string;
    client?: ClientDto;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (client: ClientDto) => void;
}

const defaultForm = (): CreateClientInput => ({
    name: '',
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    billingAddress: null,
    notes: null,
});

function clientToForm(client: ClientDto): CreateClientInput {
    return {
        name: client.name,
        contactName: client.contactName,
        contactEmail: client.contactEmail,
        contactPhone: client.contactPhone,
        billingAddress: client.billingAddress,
        notes: client.notes,
    };
}

export function ClientDialog({
                                 workspaceSlug,
                                 client,
                                 open,
                                 onOpenChange,
                                 onSuccess,
                             }: ClientDialogProps): React.ReactElement {
    const isEditing = Boolean(client);
    const notify = useNotify();
    const [form, setForm] = useState<CreateClientInput>(
        client ? clientToForm(client) : defaultForm(),
    );
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean): void {
        if ( !next ) {
            setForm(client ? clientToForm(client) : defaultForm());
        }
        onOpenChange(next);
    }

    function set<K extends keyof CreateClientInput>(key: K, value: CreateClientInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = isEditing
                ? await apiPatch<ClientDto>(`/api/${ workspaceSlug }/clients/${ client!.id }`, form)
                : await apiPost<ClientDto>(`/api/${ workspaceSlug }/clients`, form);

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
                <Dialog.Title>{ isEditing ? 'Edit Client' : 'New Client' }</Dialog.Title>

                <form onSubmit={ handleSubmit }>
                    <Flex direction="column" gap="3" mt="4">
                        <TextField.Root
                            value={ form.name }
                            onChange={ (e) => set('name', e.target.value) }
                            placeholder="Company name *"
                            required
                        />

                        <TextField.Root
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="Contact person"
                        />

                        <Flex gap="3">
                            <TextField.Root
                                style={ { flex: 1 } }
                                type="email"
                                value={ form.contactEmail ?? '' }
                                onChange={ (e) => set('contactEmail', e.target.value || null) }
                                placeholder="Email"
                            />
                            <TextField.Root
                                style={ { flex: 1 } }
                                value={ form.contactPhone ?? '' }
                                onChange={ (e) => set('contactPhone', e.target.value || null) }
                                placeholder="Phone"
                            />
                        </Flex>

                        <TextArea
                            value={ form.billingAddress ?? '' }
                            onChange={ (e) => set('billingAddress', e.target.value || null) }
                            placeholder="Billing address"
                            rows={ 2 }
                        />

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
                                { submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create client' }
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

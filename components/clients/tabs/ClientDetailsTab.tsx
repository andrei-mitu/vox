'use client';

import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import {
    Button,
    Flex,
    Text,
    TextArea,
    TextField,
}                       from '@radix-ui/themes';
import { Pencil }       from 'lucide-react';
import type {
    ClientDto,
    CreateClientInput,
}                       from '@/lib/dto/client.dto';
import { DetailsTable } from '@/components/detail-shell/DetailsTable';

interface ClientDetailsTabProps {
    client: ClientDto;
    workspaceSlug: string;
}

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

export function ClientDetailsTab({
                                     client: initialClient,
                                     workspaceSlug,
                                 }: ClientDetailsTabProps): React.ReactElement {
    const router = useRouter();
    const [client, setClient] = useState<ClientDto>(initialClient);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CreateClientInput>(clientToForm(initialClient));
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    function startEdit(): void {
        setForm(clientToForm(client));
        setSaveError(null);
        setEditing(true);
    }

    function cancelEdit(): void {
        setEditing(false);
        setSaveError(null);
    }

    function set<K extends keyof CreateClientInput>(key: K, value: CreateClientInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSaveError(null);
        setSaving(true);

        try {
            const res = await fetch(`/api/${ workspaceSlug }/clients/${ client.id }`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setSaveError((body as { error?: string }).error ?? 'Something went wrong.');
                return;
            }

            const saved: ClientDto = await res.json();
            setClient(saved);
            setEditing(false);
            router.refresh();
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    if ( editing ) {
        return (
            <form onSubmit={ handleSave }>
                <Flex direction="column" gap="4" style={ { maxWidth: 560 } }>
                    <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">Company Name *</Text>
                        <TextField.Root
                            value={ form.name }
                            onChange={ (e) => set('name', e.target.value) }
                            required
                        />
                    </Flex>

                    <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">Contact Name</Text>
                        <TextField.Root
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="e.g. Jane Doe"
                        />
                    </Flex>

                    <Flex gap="3">
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Contact Email</Text>
                            <TextField.Root
                                type="email"
                                value={ form.contactEmail ?? '' }
                                onChange={ (e) => set('contactEmail', e.target.value || null) }
                                placeholder="contact@company.com"
                            />
                        </Flex>
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Contact Phone</Text>
                            <TextField.Root
                                value={ form.contactPhone ?? '' }
                                onChange={ (e) => set('contactPhone', e.target.value || null) }
                                placeholder="+1 555 000 0000"
                            />
                        </Flex>
                    </Flex>

                    <Flex direction="column" gap="1">
                        <Text as="label" size="2" weight="medium">Billing Address</Text>
                        <TextArea
                            value={ form.billingAddress ?? '' }
                            onChange={ (e) => set('billingAddress', e.target.value || null) }
                            rows={ 3 }
                            placeholder="Street, City, Country"
                        />
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
        );
    }

    return (
        <Flex direction="column" gap="4" style={ { maxWidth: 640 } }>
            <Flex justify="end">
                <Button variant="soft" onClick={ startEdit }>
                    <Pencil size={ 14 }/>
                    Edit
                </Button>
            </Flex>

            <DetailsTable rows={ [
                { label: 'Company', value: client.name },
                { label: 'Contact name', value: client.contactName },
                { label: 'Contact email', value: client.contactEmail },
                { label: 'Contact phone', value: client.contactPhone },
                { label: 'Billing address', value: client.billingAddress },
                { label: 'Notes', value: client.notes },
            ] }/>
        </Flex>
    );
}

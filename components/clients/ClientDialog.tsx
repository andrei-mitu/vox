'use client';

import {useState} from 'react';
import {Button, Dialog, Flex, Text, TextArea, TextField} from '@radix-ui/themes';
import type {ClientDto, CreateClientInput} from '@/lib/dto/client.dto';

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
    const [form, setForm] = useState<CreateClientInput>(
        client ? clientToForm(client) : defaultForm(),
    );
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean): void {
        if (!next) {
            setForm(client ? clientToForm(client) : defaultForm());
            setError(null);
        }
        onOpenChange(next);
    }

    function set<K extends keyof CreateClientInput>(key: K, value: CreateClientInput[K]): void {
        setForm((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const url = isEditing
                ? `/api/${workspaceSlug}/clients/${client!.id}`
                : `/api/${workspaceSlug}/clients`;
            const method = isEditing ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError((body as {error?: string}).error ?? 'Something went wrong.');
                return;
            }

            const saved: ClientDto = await res.json();
            onSuccess(saved);
            handleOpenChange(false);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Content maxWidth="480px">
                <Dialog.Title>{isEditing ? 'Edit Client' : 'New Client'}</Dialog.Title>

                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="3" mt="4">
                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Company Name *</Text>
                            <TextField.Root
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="e.g. Acme Logistics SRL"
                                required
                            />
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Contact Person</Text>
                            <TextField.Root
                                value={form.contactName ?? ''}
                                onChange={(e) => set('contactName', e.target.value || null)}
                                placeholder="e.g. John Smith"
                            />
                        </Flex>

                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Email</Text>
                                <TextField.Root
                                    type="email"
                                    value={form.contactEmail ?? ''}
                                    onChange={(e) => set('contactEmail', e.target.value || null)}
                                    placeholder="contact@company.com"
                                />
                            </Flex>

                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Phone</Text>
                                <TextField.Root
                                    value={form.contactPhone ?? ''}
                                    onChange={(e) => set('contactPhone', e.target.value || null)}
                                    placeholder="+1 555 000 0000"
                                />
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Billing Address</Text>
                            <TextArea
                                value={form.billingAddress ?? ''}
                                onChange={(e) => set('billingAddress', e.target.value || null)}
                                placeholder="Street, City, Country"
                                rows={2}
                            />
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Notes</Text>
                            <TextArea
                                value={form.notes ?? ''}
                                onChange={(e) => set('notes', e.target.value || null)}
                                placeholder="Additional notes..."
                                rows={3}
                            />
                        </Flex>

                        {error && (
                            <Text size="2" color="red">{error}</Text>
                        )}

                        <Flex gap="3" justify="end" mt="2">
                            <Dialog.Close>
                                <Button variant="soft" color="gray" type="button">
                                    Cancel
                                </Button>
                            </Dialog.Close>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create client'}
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

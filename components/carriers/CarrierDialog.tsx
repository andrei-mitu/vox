'use client';

import {useState} from 'react';
import {Button, Dialog, Flex, Select, Text, TextArea, TextField} from '@radix-ui/themes';
import {CARRIER_MODE_LABELS} from '@/lib/dto/carrier.dto';
import type {CarrierDto, CreateCarrierInput} from '@/lib/dto/carrier.dto';

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
    const [form, setForm] = useState<CreateCarrierInput>(
        carrier ? carrierToForm(carrier) : defaultForm(),
    );
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleOpenChange(next: boolean): void {
        if (!next) {
            setForm(carrier ? carrierToForm(carrier) : defaultForm());
            setError(null);
        }
        onOpenChange(next);
    }

    function set<K extends keyof CreateCarrierInput>(key: K, value: CreateCarrierInput[K]): void {
        setForm((prev) => ({...prev, [key]: value}));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const url = isEditing
                ? `/api/${workspaceSlug}/carriers/${carrier!.id}`
                : `/api/${workspaceSlug}/carriers`;
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

            const saved: CarrierDto = await res.json();
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
                <Dialog.Title>{isEditing ? 'Edit Carrier' : 'New Carrier'}</Dialog.Title>

                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap="3" mt="4">
                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Name *</Text>
                            <TextField.Root
                                value={form.name}
                                onChange={(e) => set('name', e.target.value)}
                                placeholder="e.g. FedEx Express"
                                required
                            />
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Code *</Text>
                            <TextField.Root
                                value={form.code}
                                onChange={(e) => set('code', e.target.value.toUpperCase())}
                                placeholder="e.g. FEDEX"
                                required
                            />
                        </Flex>

                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Mode *</Text>
                                <Select.Root
                                    value={form.mode}
                                    onValueChange={(v) => set('mode', v as CreateCarrierInput['mode'])}
                                >
                                    <Select.Trigger style={{width: '100%'}} />
                                    <Select.Content>
                                        {(Object.entries(CARRIER_MODE_LABELS) as [CreateCarrierInput['mode'], string][]).map(([value, label]) => (
                                            <Select.Item key={value} value={value}>
                                                {label}
                                            </Select.Item>
                                        ))}
                                    </Select.Content>
                                </Select.Root>
                            </Flex>

                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Status</Text>
                                <Select.Root
                                    value={form.status}
                                    onValueChange={(v) => set('status', v as CreateCarrierInput['status'])}
                                >
                                    <Select.Trigger style={{width: '100%'}} />
                                    <Select.Content>
                                        <Select.Item value="active">Active</Select.Item>
                                        <Select.Item value="inactive">Inactive</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap="1">
                            <Text as="label" size="2" weight="medium">Contact Name</Text>
                            <TextField.Root
                                value={form.contactName ?? ''}
                                onChange={(e) => set('contactName', e.target.value || null)}
                                placeholder="e.g. John Smith"
                            />
                        </Flex>

                        <Flex gap="3">
                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Contact Email</Text>
                                <TextField.Root
                                    type="email"
                                    value={form.contactEmail ?? ''}
                                    onChange={(e) => set('contactEmail', e.target.value || null)}
                                    placeholder="contact@carrier.com"
                                />
                            </Flex>

                            <Flex direction="column" gap="1" flexGrow="1">
                                <Text as="label" size="2" weight="medium">Contact Phone</Text>
                                <TextField.Root
                                    value={form.contactPhone ?? ''}
                                    onChange={(e) => set('contactPhone', e.target.value || null)}
                                    placeholder="+1 555 000 0000"
                                />
                            </Flex>
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
                                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create carrier'}
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Dialog.Content>
        </Dialog.Root>
    );
}

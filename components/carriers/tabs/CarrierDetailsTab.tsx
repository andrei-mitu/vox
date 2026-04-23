'use client';

import { useState }            from 'react';
import { useRouter }           from 'next/navigation';
import {
    Badge,
    Button,
    Flex,
    Select,
    Text,
    TextArea,
    TextField,
}                              from '@radix-ui/themes';
import { Pencil }              from 'lucide-react';
import type {
    CarrierDto,
    CarrierMode,
    CreateCarrierInput,
}                              from '@/lib/dto/carrier.dto';
import { CARRIER_MODE_LABELS } from '@/lib/dto/carrier.dto';
import { DetailsTable }        from '@/components/detail-shell/DetailsTable';

interface CarrierDetailsTabProps {
    carrier: CarrierDto;
    workspaceSlug: string;
}

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

export function CarrierDetailsTab({
                                      carrier: initialCarrier,
                                      workspaceSlug,
                                  }: CarrierDetailsTabProps): React.ReactElement {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<CreateCarrierInput>(carrierToForm(initialCarrier));
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Local display state (synced on save via router.refresh)
    const [carrier, setCarrier] = useState<CarrierDto>(initialCarrier);

    function startEdit(): void {
        setForm(carrierToForm(carrier));
        setSaveError(null);
        setEditing(true);
    }

    function cancelEdit(): void {
        setEditing(false);
        setSaveError(null);
    }

    function set<K extends keyof CreateCarrierInput>(key: K, value: CreateCarrierInput[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSaveError(null);
        setSaving(true);

        try {
            const res = await fetch(`/api/${ workspaceSlug }/carriers/${ carrier.id }`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setSaveError((body as { error?: string }).error ?? 'Something went wrong.');
                return;
            }

            const saved: CarrierDto = await res.json();
            setCarrier(saved);
            setEditing(false);
            // Refresh the layout so the header reflects the new name / status
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
                    <Flex gap="3">
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Name *</Text>
                            <TextField.Root
                                value={ form.name }
                                onChange={ (e) => set('name', e.target.value) }
                                required
                            />
                        </Flex>
                        <Flex direction="column" gap="1" style={ { width: 120 } }>
                            <Text as="label" size="2" weight="medium">Code *</Text>
                            <TextField.Root
                                value={ form.code }
                                onChange={ (e) => set('code', e.target.value.toUpperCase()) }
                                required
                            />
                        </Flex>
                    </Flex>

                    <Flex gap="3">
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Mode *</Text>
                            <Select.Root
                                value={ form.mode }
                                onValueChange={ (v) => set('mode', v as CarrierMode) }
                            >
                                <Select.Trigger style={ { width: '100%' } }/>
                                <Select.Content>
                                    { (Object.entries(CARRIER_MODE_LABELS) as [CarrierMode, string][]).map(
                                        ([value, label]) => (
                                            <Select.Item key={ value } value={ value }>{ label }</Select.Item>
                                        ),
                                    ) }
                                </Select.Content>
                            </Select.Root>
                        </Flex>
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Status</Text>
                            <Select.Root
                                value={ form.status }
                                onValueChange={ (v) => set('status', v as 'active' | 'inactive') }
                            >
                                <Select.Trigger style={ { width: '100%' } }/>
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
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="e.g. John Smith"
                        />
                    </Flex>

                    <Flex gap="3">
                        <Flex direction="column" gap="1" flexGrow="1">
                            <Text as="label" size="2" weight="medium">Contact Email</Text>
                            <TextField.Root
                                type="email"
                                value={ form.contactEmail ?? '' }
                                onChange={ (e) => set('contactEmail', e.target.value || null) }
                                placeholder="contact@carrier.com"
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
                { label: 'Name', value: carrier.name },
                { label: 'Code', value: carrier.code },
                {
                    label: 'Mode',
                    value: (
                        <Badge color="blue" variant="soft">
                            { CARRIER_MODE_LABELS[carrier.mode] }
                        </Badge>
                    ),
                },
                {
                    label: 'Status',
                    value: (
                        <Badge color={ carrier.status === 'active' ? 'green' : 'gray' } variant="soft">
                            { carrier.status === 'active' ? 'Active' : 'Inactive' }
                        </Badge>
                    ),
                },
                { label: 'Contact Name', value: carrier.contactName },
                { label: 'Contact Email', value: carrier.contactEmail },
                { label: 'Contact Phone', value: carrier.contactPhone },
                { label: 'Notes', value: carrier.notes },
            ] }/>
        </Flex>
    );
}

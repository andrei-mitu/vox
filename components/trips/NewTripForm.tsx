'use client';

import { useState }         from 'react';
import { useRouter }        from 'next/navigation';
import {
    Box,
    Button,
    Checkbox,
    Flex,
    Heading,
    Select,
    Text,
    TextArea,
    TextField,
}                           from '@radix-ui/themes';
import { apiPost }          from '@/lib/client/api';
import { useNotify }        from '@/lib/client/notifications';
import type {
    CreateTripInput,
    TripDto,
}                           from '@/lib/dto/trip.dto';
import { createTripSchema } from '@/lib/dto/trip.dto';

interface NewTripFormProps {
    workspaceSlug: string;
}

type FormState = {
    cargoName: string;
    cargoType: string;
    weightKg: string;
    volumeM3: string;
    thermal: boolean;
    tempMin: string;
    tempMax: string;
    thermodiagram: boolean;
    adr: boolean;
    adrClass: string;
    phytosanitary: boolean;
    phytoCostBy: '' | 'CARRIER' | 'SENDER';
    clientName: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    price: string;
    currency: string;
    paymentPeriod: string;
    loadingAddress: string;
    loadingCustoms: string;
    unloadingAddress: string;
    unloadingCustoms: string;
    loadingDateFrom: string;
    loadingDateTo: string;
    comments: string;
};

const INITIAL: FormState = {
    cargoName: '',
    cargoType: '',
    weightKg: '',
    volumeM3: '',
    thermal: false,
    tempMin: '',
    tempMax: '',
    thermodiagram: false,
    adr: false,
    adrClass: '',
    phytosanitary: false,
    phytoCostBy: '',
    clientName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    price: '',
    currency: 'EUR',
    paymentPeriod: '',
    loadingAddress: '',
    loadingCustoms: '',
    unloadingAddress: '',
    unloadingCustoms: '',
    loadingDateFrom: '',
    loadingDateTo: '',
    comments: '',
};

function toInput(form: FormState): CreateTripInput {
    return {
        cargoName: form.cargoName,
        cargoType: form.cargoType || null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        volumeM3: form.volumeM3 ? Number(form.volumeM3) : null,
        thermal: form.thermal,
        tempMin: form.tempMin ? Number(form.tempMin) : null,
        tempMax: form.tempMax ? Number(form.tempMax) : null,
        thermodiagram: form.thermodiagram,
        adr: form.adr,
        adrClass: form.adrClass || null,
        phytosanitary: form.phytosanitary,
        phytoCostBy: form.phytoCostBy || null,
        clientName: form.clientName || null,
        contactPerson: form.contactPerson || null,
        contactPhone: form.contactPhone || null,
        contactEmail: form.contactEmail || null,
        price: form.price ? Number(form.price) : null,
        currency: form.currency || 'EUR',
        paymentPeriod: form.paymentPeriod ? Number(form.paymentPeriod) : null,
        loadingAddress: form.loadingAddress || null,
        loadingCustoms: form.loadingCustoms || null,
        unloadingAddress: form.unloadingAddress || null,
        unloadingCustoms: form.unloadingCustoms || null,
        loadingDateFrom: form.loadingDateFrom || null,
        loadingDateTo: form.loadingDateTo || null,
        comments: form.comments || null,
    };
}

function SectionHeading({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
        <Heading size="3" mb="3" style={ { borderBottom: '1px solid var(--gray-4)', paddingBottom: 8 } }>
            { children }
        </Heading>
    );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
    return (
        <Flex direction="column" gap="1" mb="3">
            <Text size="2" weight="medium" color="gray">{ label }</Text>
            { children }
        </Flex>
    );
}

export function NewTripForm({ workspaceSlug }: NewTripFormProps): React.ReactElement {
    const router = useRouter();
    const notify = useNotify();
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    function set<K extends keyof FormState>(key: K, value: FormState[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        const input = toInput(form);
        const parsed = createTripSchema.safeParse(input);
        if ( !parsed.success ) {
            const flat = parsed.error.flatten().fieldErrors;
            const errs: Record<string, string> = {};
            for ( const [k, msgs] of Object.entries(flat) ) {
                if ( msgs?.[0] ) {
                    errs[k] = msgs[0];
                }
            }
            setErrors(errs);
            return;
        }
        setErrors({});
        setSaving(true);

        try {
            const result = await apiPost<TripDto>(`/api/${ workspaceSlug }/trips`, parsed.data);
            if ( !result.ok ) {
                notify(result.error, 'error');
                return;
            }
            router.push(`/${ workspaceSlug }/trips/${ result.data.seqId }/details`);
        } catch {
            notify('Network error. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={ handleSubmit } noValidate>
            <Flex direction="column" gap="6">

                {/* Section 1: Cargo */ }
                <Box>
                    <SectionHeading>Cargo Information</SectionHeading>

                    <FieldRow label="Cargo name *">
                        <TextField.Root
                            value={ form.cargoName }
                            onChange={ (e) => set('cargoName', e.target.value) }
                            placeholder="e.g. Machine parts"
                        />
                        { errors.cargoName && <Text size="1" color="red">{ errors.cargoName }</Text> }
                    </FieldRow>

                    <FieldRow label="Cargo type">
                        <TextField.Root
                            value={ form.cargoType }
                            onChange={ (e) => set('cargoType', e.target.value) }
                            placeholder="e.g. Industrial equipment"
                        />
                    </FieldRow>

                    <Flex gap="4">
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Weight (kg)">
                                <TextField.Root
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.weightKg }
                                    onChange={ (e) => set('weightKg', e.target.value) }
                                />
                            </FieldRow>
                        </Box>
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Volume (m³)">
                                <TextField.Root
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.volumeM3 }
                                    onChange={ (e) => set('volumeM3', e.target.value) }
                                />
                            </FieldRow>
                        </Box>
                    </Flex>

                    <Flex direction="column" gap="2" mb="3">
                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={ form.thermal }
                                onCheckedChange={ (v) => set('thermal', Boolean(v)) }
                            />
                            <Text size="2">Temperature controlled (thermal)</Text>
                        </Flex>

                        { form.thermal && (
                            <Flex gap="4" ml="6">
                                <Box style={ { flex: 1 } }>
                                    <FieldRow label="Temp min (°C)">
                                        <TextField.Root
                                            type="number"
                                            step="0.1"
                                            value={ form.tempMin }
                                            onChange={ (e) => set('tempMin', e.target.value) }
                                        />
                                        { errors.tempMin && <Text size="1" color="red">{ errors.tempMin }</Text> }
                                    </FieldRow>
                                </Box>
                                <Box style={ { flex: 1 } }>
                                    <FieldRow label="Temp max (°C)">
                                        <TextField.Root
                                            type="number"
                                            step="0.1"
                                            value={ form.tempMax }
                                            onChange={ (e) => set('tempMax', e.target.value) }
                                        />
                                    </FieldRow>
                                </Box>
                            </Flex>
                        ) }

                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={ form.thermodiagram }
                                onCheckedChange={ (v) => set('thermodiagram', Boolean(v)) }
                            />
                            <Text size="2">Thermodiagram required</Text>
                        </Flex>

                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={ form.adr }
                                onCheckedChange={ (v) => set('adr', Boolean(v)) }
                            />
                            <Text size="2">ADR (hazardous goods)</Text>
                        </Flex>

                        { form.adr && (
                            <Box ml="6">
                                <FieldRow label="ADR class *">
                                    <TextField.Root
                                        value={ form.adrClass }
                                        onChange={ (e) => set('adrClass', e.target.value) }
                                        placeholder="e.g. 3, 8, 4.1"
                                    />
                                    { errors.adrClass && <Text size="1" color="red">{ errors.adrClass }</Text> }
                                </FieldRow>
                            </Box>
                        ) }

                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={ form.phytosanitary }
                                onCheckedChange={ (v) => set('phytosanitary', Boolean(v)) }
                            />
                            <Text size="2">Phytosanitary certificate required</Text>
                        </Flex>

                        { form.phytosanitary && (
                            <Box ml="6">
                                <FieldRow label="Phyto cost paid by *">
                                    <Select.Root
                                        value={ form.phytoCostBy }
                                        onValueChange={ (v) => set('phytoCostBy', v as 'CARRIER' | 'SENDER') }
                                    >
                                        <Select.Trigger placeholder="Select…" style={ { width: '100%' } }/>
                                        <Select.Content>
                                            <Select.Item value="CARRIER">Carrier</Select.Item>
                                            <Select.Item value="SENDER">Sender</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                    { errors.phytoCostBy && <Text size="1" color="red">{ errors.phytoCostBy }</Text> }
                                </FieldRow>
                            </Box>
                        ) }
                    </Flex>
                </Box>

                {/* Section 2: Client */ }
                <Box>
                    <SectionHeading>Client Information</SectionHeading>

                    <FieldRow label="Client name">
                        <TextField.Root
                            value={ form.clientName }
                            onChange={ (e) => set('clientName', e.target.value) }
                            placeholder="e.g. Acme Corp"
                        />
                    </FieldRow>

                    <FieldRow label="Contact person">
                        <TextField.Root
                            value={ form.contactPerson }
                            onChange={ (e) => set('contactPerson', e.target.value) }
                        />
                    </FieldRow>

                    <Flex gap="4">
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Contact phone">
                                <TextField.Root
                                    value={ form.contactPhone }
                                    onChange={ (e) => set('contactPhone', e.target.value) }
                                />
                            </FieldRow>
                        </Box>
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Contact email">
                                <TextField.Root
                                    type="email"
                                    value={ form.contactEmail }
                                    onChange={ (e) => set('contactEmail', e.target.value) }
                                />
                                { errors.contactEmail && <Text size="1" color="red">{ errors.contactEmail }</Text> }
                            </FieldRow>
                        </Box>
                    </Flex>

                    <Flex gap="4">
                        <Box style={ { flex: 2 } }>
                            <FieldRow label="Price">
                                <TextField.Root
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.price }
                                    onChange={ (e) => set('price', e.target.value) }
                                />
                            </FieldRow>
                        </Box>
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Currency">
                                <Select.Root
                                    value={ form.currency }
                                    onValueChange={ (v) => set('currency', v) }
                                >
                                    <Select.Trigger style={ { width: '100%' } }/>
                                    <Select.Content>
                                        <Select.Item value="EUR">EUR</Select.Item>
                                        <Select.Item value="USD">USD</Select.Item>
                                        <Select.Item value="MDL">MDL</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </FieldRow>
                        </Box>
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Payment (net days)">
                                <TextField.Root
                                    type="number"
                                    min="1"
                                    value={ form.paymentPeriod }
                                    onChange={ (e) => set('paymentPeriod', e.target.value) }
                                    placeholder="e.g. 30"
                                />
                            </FieldRow>
                        </Box>
                    </Flex>
                </Box>

                {/* Section 3: Route & Logistics */ }
                <Box>
                    <SectionHeading>Route &amp; Logistics</SectionHeading>

                    <FieldRow label="Loading address">
                        <TextField.Root
                            value={ form.loadingAddress }
                            onChange={ (e) => set('loadingAddress', e.target.value) }
                            placeholder="Street, city, country"
                        />
                    </FieldRow>

                    <FieldRow label="Loading customs">
                        <TextField.Root
                            value={ form.loadingCustoms }
                            onChange={ (e) => set('loadingCustoms', e.target.value) }
                        />
                    </FieldRow>

                    <FieldRow label="Unloading address">
                        <TextField.Root
                            value={ form.unloadingAddress }
                            onChange={ (e) => set('unloadingAddress', e.target.value) }
                            placeholder="Street, city, country"
                        />
                    </FieldRow>

                    <FieldRow label="Unloading customs">
                        <TextField.Root
                            value={ form.unloadingCustoms }
                            onChange={ (e) => set('unloadingCustoms', e.target.value) }
                        />
                    </FieldRow>

                    <Flex gap="4">
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Loading date from">
                                <TextField.Root
                                    type="date"
                                    value={ form.loadingDateFrom }
                                    onChange={ (e) => set('loadingDateFrom', e.target.value) }
                                />
                                { errors.loadingDateFrom &&
                                    <Text size="1" color="red">{ errors.loadingDateFrom }</Text> }
                            </FieldRow>
                        </Box>
                        <Box style={ { flex: 1 } }>
                            <FieldRow label="Loading date to">
                                <TextField.Root
                                    type="date"
                                    value={ form.loadingDateTo }
                                    onChange={ (e) => set('loadingDateTo', e.target.value) }
                                />
                                { errors.loadingDateTo && <Text size="1" color="red">{ errors.loadingDateTo }</Text> }
                            </FieldRow>
                        </Box>
                    </Flex>
                </Box>

                {/* Section 4: Comments */ }
                <Box>
                    <SectionHeading>Comments</SectionHeading>
                    <TextArea
                        value={ form.comments }
                        onChange={ (e) => set('comments', e.target.value) }
                        rows={ 4 }
                        placeholder="Additional notes…"
                    />
                </Box>

                <Flex justify="end" gap="3">
                    <Button
                        type="button"
                        variant="soft"
                        color="gray"
                        onClick={ () => router.back() }
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={ saving }>
                        { saving ? 'Creating…' : 'Create trip' }
                    </Button>
                </Flex>
            </Flex>
        </form>
    );
}

'use client';

import {
    Box,
    Checkbox,
    Flex,
    Select,
    Text,
    TextArea,
    TextField,
}                           from '@radix-ui/themes';
import type {
    PhytoCostBy,
    TripDto,
    UpdateTripInput
}                           from '@/lib/dto/trip.dto';
import { updateTripSchema } from '@/lib/dto/trip.dto';
import { DetailsForm }      from '@/components/detail-shell/DetailsForm';
import { DetailsFormRow }   from '@/components/detail-shell/DetailsFormRow';
import { DeleteButton }     from '@/components/ui/DeleteButton';
import { TripPipeline }     from '@/components/trips/TripPipeline';
import { Input }            from '@/components/ui/Input';

interface TripDetailsTabProps {
    trip: TripDto;
    workspaceSlug: string;
}

function tripToForm(trip: TripDto): UpdateTripInput {
    return {
        cargoName: trip.cargoName,
        cargoType: trip.cargoType,
        weightKg: trip.weightKg ? Number(trip.weightKg) : null,
        volumeM3: trip.volumeM3 ? Number(trip.volumeM3) : null,
        thermal: trip.thermal,
        tempMin: trip.tempMin ? Number(trip.tempMin) : null,
        tempMax: trip.tempMax ? Number(trip.tempMax) : null,
        thermodiagram: trip.thermodiagram,
        adr: trip.adr,
        adrClass: trip.adrClass,
        phytosanitary: trip.phytosanitary,
        phytoCostBy: trip.phytoCostBy,
        clientName: trip.clientName,
        contactPerson: trip.contactPerson,
        contactPhone: trip.contactPhone,
        contactEmail: trip.contactEmail,
        price: trip.price ? Number(trip.price) : null,
        currency: trip.currency,
        paymentPeriod: trip.paymentPeriod,
        loadingAddress: trip.loadingAddress,
        loadingCustoms: trip.loadingCustoms,
        unloadingAddress: trip.unloadingAddress,
        unloadingCustoms: trip.unloadingCustoms,
        loadingDateFrom: trip.loadingDateFrom,
        loadingDateTo: trip.loadingDateTo,
        comments: trip.comments,
    };
}

const isEditable = (trip: TripDto) => trip.status === 'CREATED';

export function TripDetailsTab({ trip: initialTrip, workspaceSlug }: TripDetailsTabProps): React.ReactElement {
    const editable = isEditable(initialTrip);

    return (
        <Flex direction="column" gap="5">
            <Box>
                <Text size="2" color="gray" weight="medium" mb="2" as="p">Status pipeline</Text>
                <TripPipeline status={ initialTrip.status }/>
            </Box>

            { editable ? (
                <DetailsForm
                    initial={ tripToForm(initialTrip) }
                    schema={ updateTripSchema }
                    endpoint={ `/api/${ workspaceSlug }/trips/${ initialTrip.seqId }` }
                    toForm={ tripToForm }
                    deleteSlot={ () => (
                        <DeleteButton
                            endpoint={ `/api/${ workspaceSlug }/trips/${ initialTrip.seqId }` }
                            redirectTo={ `/${ workspaceSlug }/trips` }
                            entityLabel="trip"
                            entityName={ initialTrip.cargoName }
                        />
                    ) }
                >
                    { ({ form, set }) => (
                        <>
                            <DetailsFormRow label="Cargo name" name="cargoName">
                                <Input
                                    value={ form.cargoName ?? '' }
                                    onChange={ (e) => set('cargoName', e.target.value) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Cargo type" name="cargoType">
                                <Input
                                    value={ form.cargoType ?? '' }
                                    onChange={ (e) => set('cargoType', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Weight (kg)" name="weightKg">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.weightKg != null ? String(form.weightKg) : '' }
                                    onChange={ (e) => set('weightKg', e.target.value ? Number(e.target.value) : null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Volume (m³)" name="volumeM3">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.volumeM3 != null ? String(form.volumeM3) : '' }
                                    onChange={ (e) => set('volumeM3', e.target.value ? Number(e.target.value) : null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Thermal" name="thermal">
                                <Flex align="center" gap="2" py="1">
                                    <Checkbox
                                        checked={ form.thermal ?? false }
                                        onCheckedChange={ (v) => set('thermal', Boolean(v)) }
                                    />
                                    <Text size="2">Temperature controlled</Text>
                                </Flex>
                            </DetailsFormRow>

                            { form.thermal && (
                                <>
                                    <DetailsFormRow label="Temp min (°C)" name="tempMin">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={ form.tempMin != null ? String(form.tempMin) : '' }
                                            onChange={ (e) => set('tempMin', e.target.value ? Number(e.target.value) : null) }
                                        />
                                    </DetailsFormRow>
                                    <DetailsFormRow label="Temp max (°C)" name="tempMax">
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={ form.tempMax != null ? String(form.tempMax) : '' }
                                            onChange={ (e) => set('tempMax', e.target.value ? Number(e.target.value) : null) }
                                        />
                                    </DetailsFormRow>
                                </>
                            ) }

                            <DetailsFormRow label="Thermodiagram" name="thermodiagram">
                                <Flex align="center" gap="2" py="1">
                                    <Checkbox
                                        checked={ form.thermodiagram ?? false }
                                        onCheckedChange={ (v) => set('thermodiagram', Boolean(v)) }
                                    />
                                    <Text size="2">Required</Text>
                                </Flex>
                            </DetailsFormRow>

                            <DetailsFormRow label="ADR" name="adr">
                                <Flex align="center" gap="2" py="1">
                                    <Checkbox
                                        checked={ form.adr ?? false }
                                        onCheckedChange={ (v) => set('adr', Boolean(v)) }
                                    />
                                    <Text size="2">Hazardous goods</Text>
                                </Flex>
                            </DetailsFormRow>

                            { form.adr && (
                                <DetailsFormRow label="ADR class" name="adrClass">
                                    <Input
                                        value={ form.adrClass ?? '' }
                                        onChange={ (e) => set('adrClass', e.target.value || null) }
                                    />
                                </DetailsFormRow>
                            ) }

                            <DetailsFormRow label="Phytosanitary" name="phytosanitary">
                                <Flex align="center" gap="2" py="1">
                                    <Checkbox
                                        checked={ form.phytosanitary ?? false }
                                        onCheckedChange={ (v) => set('phytosanitary', Boolean(v)) }
                                    />
                                    <Text size="2">Certificate required</Text>
                                </Flex>
                            </DetailsFormRow>

                            { form.phytosanitary && (
                                <DetailsFormRow label="Phyto cost by" name="phytoCostBy">
                                    <Select.Root
                                        value={ form.phytoCostBy ?? '' }
                                        onValueChange={ (v) => set('phytoCostBy', v as PhytoCostBy) }
                                    >
                                        <Select.Trigger style={ { width: '100%' } }/>
                                        <Select.Content>
                                            <Select.Item value="CARRIER">Carrier</Select.Item>
                                            <Select.Item value="SENDER">Sender</Select.Item>
                                        </Select.Content>
                                    </Select.Root>
                                </DetailsFormRow>
                            ) }

                            <DetailsFormRow label="Client name" name="clientName">
                                <Input
                                    value={ form.clientName ?? '' }
                                    onChange={ (e) => set('clientName', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Contact person" name="contactPerson">
                                <Input
                                    value={ form.contactPerson ?? '' }
                                    onChange={ (e) => set('contactPerson', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Contact phone" name="contactPhone">
                                <Input
                                    value={ form.contactPhone ?? '' }
                                    onChange={ (e) => set('contactPhone', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Contact email" name="contactEmail">
                                <Input
                                    type="email"
                                    value={ form.contactEmail ?? '' }
                                    onChange={ (e) => set('contactEmail', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Price" name="price">
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ form.price != null ? String(form.price) : '' }
                                    onChange={ (e) => set('price', e.target.value ? Number(e.target.value) : null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Currency" name="currency">
                                <Select.Root
                                    value={ form.currency ?? 'EUR' }
                                    onValueChange={ (v) => set('currency', v) }
                                >
                                    <Select.Trigger style={ { width: '100%' } }/>
                                    <Select.Content>
                                        <Select.Item value="EUR">EUR</Select.Item>
                                        <Select.Item value="USD">USD</Select.Item>
                                        <Select.Item value="MDL">MDL</Select.Item>
                                    </Select.Content>
                                </Select.Root>
                            </DetailsFormRow>

                            <DetailsFormRow label="Payment (net days)" name="paymentPeriod">
                                <Input
                                    type="number"
                                    min="1"
                                    value={ form.paymentPeriod != null ? String(form.paymentPeriod) : '' }
                                    onChange={ (e) => set('paymentPeriod', e.target.value ? Number(e.target.value) : null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Loading address" name="loadingAddress">
                                <Input
                                    value={ form.loadingAddress ?? '' }
                                    onChange={ (e) => set('loadingAddress', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Loading customs" name="loadingCustoms">
                                <Input
                                    value={ form.loadingCustoms ?? '' }
                                    onChange={ (e) => set('loadingCustoms', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Unloading address" name="unloadingAddress">
                                <Input
                                    value={ form.unloadingAddress ?? '' }
                                    onChange={ (e) => set('unloadingAddress', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Unloading customs" name="unloadingCustoms">
                                <Input
                                    value={ form.unloadingCustoms ?? '' }
                                    onChange={ (e) => set('unloadingCustoms', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Loading date from" name="loadingDateFrom">
                                <TextField.Root
                                    type="date"
                                    value={ form.loadingDateFrom ?? '' }
                                    onChange={ (e) => set('loadingDateFrom', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Loading date to" name="loadingDateTo">
                                <TextField.Root
                                    type="date"
                                    value={ form.loadingDateTo ?? '' }
                                    onChange={ (e) => set('loadingDateTo', e.target.value || null) }
                                />
                            </DetailsFormRow>

                            <DetailsFormRow label="Comments" name="comments" align="top">
                                <TextArea
                                    value={ form.comments ?? '' }
                                    onChange={ (e) => set('comments', e.target.value || null) }
                                    rows={ 4 }
                                />
                            </DetailsFormRow>
                        </>
                    ) }
                </DetailsForm>
            ) : (
                <Box p="4" style={ { background: 'var(--gray-2)', borderRadius: 'var(--radius-3)' } }>
                    <Text size="2" color="gray">
                        Trip is in <strong>{ initialTrip.status }</strong> status — fields are read-only.
                    </Text>
                </Box>
            ) }
        </Flex>
    );
}

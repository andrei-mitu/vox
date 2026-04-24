'use client';

import {
    Select,
    TextArea,
}                          from '@radix-ui/themes';
import type { CarrierDto } from '@/lib/dto/carrier.dto';
import {
    CARRIER_MODE_LABELS,
    type CarrierMode,
    type CreateCarrierInput,
    createCarrierSchema,
}                          from '@/lib/dto/carrier.dto';
import { DetailsForm }     from '@/components/detail-shell/DetailsForm';
import { DetailsFormRow }  from '@/components/detail-shell/DetailsFormRow';
import { DeleteButton }    from '@/components/ui/DeleteButton';
import { Input }           from '@/components/ui/Input';

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
    return (
        <DetailsForm
            initial={ carrierToForm(initialCarrier) }
            schema={ createCarrierSchema }
            endpoint={ `/api/${ workspaceSlug }/carriers/${ initialCarrier.seqId }` }
            toForm={ carrierToForm }
            deleteSlot={ (form) => (
                <DeleteButton
                    endpoint={ `/api/${ workspaceSlug }/carriers/${ initialCarrier.seqId }` }
                    redirectTo={ `/${ workspaceSlug }/carriers` }
                    entityLabel="carrier"
                    entityName={ form.name }
                />
            ) }
        >
            { ({ form, set }) => (
                <>
                    <DetailsFormRow label="Name" name="name">
                        <Input
                            value={ form.name }
                            onChange={ (e) => set('name', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Code" name="code">
                        <Input
                            value={ form.code }
                            onChange={ (e) => set('code', e.target.value.toUpperCase()) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Mode" name="mode">
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
                    </DetailsFormRow>

                    <DetailsFormRow label="Status" name="status">
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
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact name" name="contactName">
                        <Input
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="e.g. John Smith"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact email" name="contactEmail">
                        <Input
                            type="email"
                            value={ form.contactEmail ?? '' }
                            onChange={ (e) => set('contactEmail', e.target.value || null) }
                            placeholder="contact@carrier.com"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact phone" name="contactPhone">
                        <Input
                            value={ form.contactPhone ?? '' }
                            onChange={ (e) => set('contactPhone', e.target.value || null) }
                            placeholder="+1 555 000 0000"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Notes" name="notes" align="top">
                        <TextArea
                            value={ form.notes ?? '' }
                            onChange={ (e) => set('notes', e.target.value || null) }
                            rows={ 4 }
                        />
                    </DetailsFormRow>
                </>
            ) }
        </DetailsForm>
    );
}

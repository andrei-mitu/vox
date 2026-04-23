'use client';

import { TextArea }           from '@radix-ui/themes';
import type { ClientDto }     from '@/lib/dto/client.dto';
import {
    type CreateClientInput,
    createClientSchema,
}                             from '@/lib/dto/client.dto';
import { DetailsForm }        from '@/components/detail-shell/DetailsForm';
import { DetailsFormRow }     from '@/components/detail-shell/DetailsFormRow';
import { ClientDeleteButton } from '@/components/clients/ClientDeleteButton';
import { Input }              from '@/components/ui/Input';

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
    return (
        <DetailsForm
            initial={ clientToForm(initialClient) }
            schema={ createClientSchema }
            endpoint={ `/api/${ workspaceSlug }/clients/${ initialClient.id }` }
            toForm={ clientToForm }
            deleteSlot={ (form) => (
                <ClientDeleteButton
                    clientId={ initialClient.id }
                    clientName={ form.name }
                    workspaceSlug={ workspaceSlug }
                />
            ) }
        >
            { ({ form, set }) => (
                <>
                    <DetailsFormRow label="Company" name="name">
                        <Input
                            value={ form.name }
                            onChange={ (e) => set('name', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact name" name="contactName">
                        <Input
                            value={ form.contactName ?? '' }
                            onChange={ (e) => set('contactName', e.target.value || null) }
                            placeholder="e.g. Jane Doe"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact email" name="contactEmail">
                        <Input
                            type="email"
                            value={ form.contactEmail ?? '' }
                            onChange={ (e) => set('contactEmail', e.target.value || null) }
                            placeholder="contact@company.com"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Contact phone" name="contactPhone">
                        <Input
                            value={ form.contactPhone ?? '' }
                            onChange={ (e) => set('contactPhone', e.target.value || null) }
                            placeholder="+1 555 000 0000"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Billing address" name="billingAddress" align="top">
                        <TextArea
                            value={ form.billingAddress ?? '' }
                            onChange={ (e) => set('billingAddress', e.target.value || null) }
                            rows={ 3 }
                            placeholder="Street, City, Country"
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

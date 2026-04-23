'use client';

import { TextArea }       from '@radix-ui/themes';
import type { RouteDto }  from '@/lib/dto/route.dto';
import {
    type CreateRouteInput,
    createRouteSchema,
}                         from '@/lib/dto/route.dto';
import { DetailsForm }    from '@/components/detail-shell/DetailsForm';
import { DetailsFormRow } from '@/components/detail-shell/DetailsFormRow';
import { DeleteButton }   from '@/components/ui/DeleteButton';
import { Input }          from '@/components/ui/Input';

interface RouteDetailsTabProps {
    route: RouteDto;
    workspaceSlug: string;
}

function routeToForm(route: RouteDto): CreateRouteInput {
    return {
        originCity: route.originCity,
        originCountry: route.originCountry,
        destCity: route.destCity,
        destCountry: route.destCountry,
        distanceKm: route.distanceKm,
        transitDays: route.transitDays,
        notes: route.notes,
    };
}

export function RouteDetailsTab({
                                    route: initialRoute,
                                    workspaceSlug,
                                }: RouteDetailsTabProps): React.ReactElement {
    return (
        <DetailsForm
            initial={ routeToForm(initialRoute) }
            schema={ createRouteSchema }
            endpoint={ `/api/${ workspaceSlug }/routes/${ initialRoute.id }` }
            toForm={ routeToForm }
            deleteSlot={ (form) => (
                <DeleteButton
                    endpoint={ `/api/${ workspaceSlug }/routes/${ initialRoute.id }` }
                    redirectTo={ `/${ workspaceSlug }/routes` }
                    entityLabel="route"
                    entityName={ `${ form.originCity }, ${ form.originCountry } → ${ form.destCity }, ${ form.destCountry }` }
                />
            ) }
        >
            { ({ form, set }) => (
                <>
                    <DetailsFormRow label="Origin city" name="originCity">
                        <Input
                            value={ form.originCity }
                            onChange={ (e) => set('originCity', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Origin country" name="originCountry">
                        <Input
                            value={ form.originCountry }
                            onChange={ (e) => set('originCountry', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Destination city" name="destCity">
                        <Input
                            value={ form.destCity }
                            onChange={ (e) => set('destCity', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Destination country" name="destCountry">
                        <Input
                            value={ form.destCountry }
                            onChange={ (e) => set('destCountry', e.target.value) }
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Distance (km)" name="distanceKm">
                        <Input
                            type="number"
                            min="1"
                            value={ form.distanceKm ?? '' }
                            onChange={ (e) => set('distanceKm', e.target.value ? Number(e.target.value) : null) }
                            placeholder="e.g. 450"
                        />
                    </DetailsFormRow>

                    <DetailsFormRow label="Transit days" name="transitDays">
                        <Input
                            type="number"
                            min="1"
                            value={ form.transitDays ?? '' }
                            onChange={ (e) => set('transitDays', e.target.value ? Number(e.target.value) : null) }
                            placeholder="e.g. 2"
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

'use client';

import {
    useEffect,
    useState
}                    from 'react';
import {
    apiPatch,
    apiPost
}                    from '@/lib/client/api';
import { useNotify } from '@/lib/client/notifications';

interface UseDialogFormOptions<TForm extends object, TDto> {
    entity: TDto | undefined;
    defaultForm: () => TForm;
    entityToForm: (entity: TDto) => TForm;
    createEndpoint: string;
    updateEndpoint: string | undefined;
    onSuccess: (result: TDto) => void;
    onOpenChange: (open: boolean) => void;
}

interface UseDialogFormReturn<TForm extends object> {
    form: TForm;
    set: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
    submitting: boolean;
    isEditing: boolean;
    handleOpenChange: (next: boolean) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useDialogForm<TForm extends object, TDto>({
                                                              entity,
                                                              defaultForm,
                                                              entityToForm,
                                                              createEndpoint,
                                                              updateEndpoint,
                                                              onSuccess,
                                                              onOpenChange,
                                                          }: UseDialogFormOptions<TForm, TDto>): UseDialogFormReturn<TForm> {
    const notify = useNotify();
    const isEditing = Boolean(entity);

    const [form, setForm] = useState<TForm>(entity ? entityToForm(entity) : defaultForm());
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setForm(entity ? entityToForm(entity) : defaultForm());
    }, [entity, entityToForm, defaultForm]);

    function handleOpenChange(next: boolean): void {
        if ( !next ) {
            setForm(entity ? entityToForm(entity) : defaultForm());
        }
        onOpenChange(next);
    }

    function set<K extends keyof TForm>(key: K, value: TForm[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSubmitting(true);
        try {
            const result = isEditing
                ? await apiPatch<TDto>(updateEndpoint!, form)
                : await apiPost<TDto>(createEndpoint, form);

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

    return { form, set, submitting, isEditing, handleOpenChange, handleSubmit };
}

'use client';

import { useState }     from 'react';
import { useRouter }    from 'next/navigation';
import type { ZodType } from 'zod';

interface UseDetailsFormOptions<TForm, TDto> {
    initial: TForm;
    schema: ZodType<TForm>;
    endpoint: string;
    toForm: (dto: TDto) => TForm;
}

interface UseDetailsFormReturn<TForm> {
    form: TForm;
    set: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
    isDirty: boolean;
    saving: boolean;
    saveError: string | null;
    fieldErrors: Record<string, string>;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

function extractFieldErrors(error: {
    flatten: () => { fieldErrors: Record<string, string[] | undefined> }
}): Record<string, string> {
    const flat = error.flatten().fieldErrors;
    const result: Record<string, string> = {};
    for ( const [key, messages] of Object.entries(flat) ) {
        if ( messages?.[0] ) {
            result[key] = messages[0];
        }
    }
    return result;
}

export function useDetailsForm<TForm extends object, TDto>({
                                                               initial,
                                                               schema,
                                                               endpoint,
                                                               toForm,
                                                           }: UseDetailsFormOptions<TForm, TDto>): UseDetailsFormReturn<TForm> {
    const router = useRouter();
    const [form, setForm] = useState<TForm>(initial);
    const [savedForm, setSavedForm] = useState<TForm>(initial);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

    function set<K extends keyof TForm>(key: K, value: TForm[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setSaveError(null);

        const parsed = schema.safeParse(form);
        if ( !parsed.success ) {
            setFieldErrors(extractFieldErrors(parsed.error));
            return;
        }
        setFieldErrors({});
        setSaving(true);

        try {
            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.data),
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({})) as {
                    error?: string;
                    fieldErrors?: Record<string, string>
                };
                setSaveError(body.error ?? 'Something went wrong.');
                if ( body.fieldErrors ) {
                    setFieldErrors(body.fieldErrors);
                }
                return;
            }

            const saved = (await res.json()) as TDto;
            const savedAsForm = toForm(saved);
            setForm(savedAsForm);
            setSavedForm(savedAsForm);
            router.refresh();
        } catch {
            setSaveError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    return { form, set, isDirty, saving, saveError, fieldErrors, handleSubmit };
}

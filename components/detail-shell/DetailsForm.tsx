'use client';

import {
    createContext,
    useContext,
    useState,
}                       from 'react';
import { useRouter }    from 'next/navigation';
import {
    Button,
    Flex,
    Table,
}                       from '@radix-ui/themes';
import type { ZodType } from 'zod';
import { apiPatch }     from '@/lib/client/api';
import { useNotify }    from '@/lib/client/notifications';

// ---------------------------------------------------------------------------
// Field-error context (consumed by DetailsFormRow)
// ---------------------------------------------------------------------------

const FieldErrorContext = createContext<Record<string, string>>({});

export function useFieldErrors(): Record<string, string> {
    return useContext(FieldErrorContext);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractFieldErrors(
    error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): Record<string, string> {
    const flat = error.flatten().fieldErrors;
    const result: Record<string, string> = {};
    for ( const [key, messages] of Object.entries(flat) ) {
        if ( messages?.[0] ) {
            result[key] = messages[0];
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// DetailsForm
// ---------------------------------------------------------------------------

interface DetailsFormProps<TForm extends object, TDto> {
    initial: TForm;
    schema: ZodType<TForm>;
    endpoint: string;
    toForm: (dto: TDto) => TForm;
    deleteSlot?: (form: TForm) => React.ReactNode;
    children: (ctx: {
        form: TForm;
        set: <K extends keyof TForm>(key: K, value: TForm[K]) => void;
    }) => React.ReactNode;
}

export function DetailsForm<TForm extends object, TDto>({
                                                            initial,
                                                            schema,
                                                            endpoint,
                                                            toForm,
                                                            deleteSlot,
                                                            children,
                                                        }: DetailsFormProps<TForm, TDto>): React.ReactElement {
    const router = useRouter();
    const notify = useNotify();

    const [form, setForm] = useState<TForm>(initial);
    const [savedForm, setSavedForm] = useState<TForm>(initial);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

    function set<K extends keyof TForm>(key: K, value: TForm[K]): void {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();

        const parsed = schema.safeParse(form);
        if ( !parsed.success ) {
            setFieldErrors(extractFieldErrors(parsed.error));
            return;
        }
        setFieldErrors({});
        setSaving(true);

        try {
            const result = await apiPatch<TDto>(endpoint, parsed.data);
            if ( !result.ok ) {
                notify(result.error, 'error');
                if ( result.fieldErrors ) {
                    setFieldErrors(result.fieldErrors);
                }
                return;
            }
            const savedAsForm = toForm(result.data);
            setForm(savedAsForm);
            setSavedForm(savedAsForm);
            router.refresh();
            notify('Changes saved successfully');
        } catch {
            notify('Network error. Please try again.', 'error');
        } finally {
            setSaving(false);
        }
    }

    return (
        <FieldErrorContext.Provider value={ fieldErrors }>
            <form onSubmit={ handleSubmit } noValidate>
                <Flex direction="column" gap="4">
                    <Table.Root variant="surface">
                        <Table.Body>
                            { children({ form, set }) }
                        </Table.Body>
                    </Table.Root>

                    <Flex gap="3" justify="end">
                        <Button type="submit" disabled={ !isDirty || saving }>
                            { saving ? 'Saving…' : 'Save changes' }
                        </Button>
                        { deleteSlot?.(form) }
                    </Flex>
                </Flex>
            </form>
        </FieldErrorContext.Provider>
    );
}

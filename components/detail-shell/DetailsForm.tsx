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
    Text,
}                       from '@radix-ui/themes';
import type { ZodType } from 'zod';

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
    const [form, setForm] = useState<TForm>(initial);
    const [savedForm, setSavedForm] = useState<TForm>(initial);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
                    fieldErrors?: Record<string, string>;
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

    return (
        <FieldErrorContext.Provider value={ fieldErrors }>
            <form onSubmit={ handleSubmit } noValidate>
                <Flex direction="column" gap="4">
                    <Table.Root variant="surface">
                        <Table.Body>
                            { children({ form, set }) }
                        </Table.Body>
                    </Table.Root>

                    { saveError && (
                        <Text size="2" color="red">{ saveError }</Text>
                    ) }

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

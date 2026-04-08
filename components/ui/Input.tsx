'use client';

import {Text, TextField} from '@radix-ui/themes';
import {forwardRef, useId} from 'react';
import {cn} from '@/lib/utils';

export type InputProps = TextField.RootProps & {
    /** When set, renders the standard label + validation row above the field. */
    label?: React.ReactNode;
    /** Validation message; shown beside the label and sets error styling on the field. */
    error?: string;
    className?: string;
    /** Class on the outer wrapper when `label` or `error` is used. */
    rootClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            rootClassName,
            id: idProp,
            color,
            className,
            'aria-describedby': ariaDescribedByProp,
            'aria-invalid': ariaInvalidProp,
            ...fieldProps
        },
        ref
    ) => {
        const generatedId = useId();
        const inputId =
            idProp ?? (label != null || error != null ? generatedId : undefined);
        const mergedColor = color ?? (error ? 'red' : undefined);
        const validationMessageId =
            error && inputId ? `${inputId}-validation` : undefined;
        const ariaDescribedBy = [ariaDescribedByProp, validationMessageId]
            .filter((v): v is string => Boolean(v))
            .join(' ');
        const ariaInvalid = error ? true : ariaInvalidProp;

        const field = (
            <TextField.Root
                ref={ref}
                id={inputId}
                color={mergedColor}
                className={cn(className)}
                aria-invalid={ariaInvalid}
                {...fieldProps}
                aria-describedby={ariaDescribedBy || undefined}
            />
        );

        if (label == null && error == null) {
            return field;
        }

        const rowClass =
            label != null
                ? 'flex flex-row flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 min-w-0'
                : 'flex flex-row flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5 min-w-0';

        const rootClasses = cn('flex flex-col gap-1', rootClassName);

        return (
            <div className={rootClasses}>
                <div className={rowClass}>
                    {label != null ? (
                        <Text
                            as="label"
                            htmlFor={inputId}
                            size="2"
                            weight="medium"
                            className="text-(--text-secondary) shrink-0"
                        >
                            {label}
                        </Text>
                    ) : null}
                    {error ? (
                        <Text
                            id={validationMessageId}
                            color="red"
                            size="1"
                            role="alert"
                            className="text-right max-w-[min(100%,20rem)]"
                        >
                            {error}
                        </Text>
                    ) : null}
                </div>
                {field}
            </div>
        );
    }
);
Input.displayName = 'Input';

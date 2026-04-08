import {Button as RadixButton, ButtonProps} from '@radix-ui/themes';
import {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, ...props}, ref) => {
        return <RadixButton ref={ref} className={cn(className)} {...props} />;
    }
);
Button.displayName = 'Button';

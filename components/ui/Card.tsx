import {Card as RadixCard, CardProps} from '@radix-ui/themes';
import {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({className, ...props}, ref) => {
        return <RadixCard ref={ref} className={cn(className)} {...props} />;
    }
);
Card.displayName = 'Card';

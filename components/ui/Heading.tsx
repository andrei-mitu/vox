import {Heading as RadixHeading, HeadingProps} from '@radix-ui/themes';
import {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
    ({className, ...props}, ref) => {
        return <RadixHeading ref={ref} className={cn(className)} {...props} />;
    }
);
Heading.displayName = 'Heading';

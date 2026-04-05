import { Heading as RadixHeading, HeadingProps } from '@radix-ui/themes';
import { forwardRef } from 'react';

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    return <RadixHeading ref={ref} {...props} />;
  }
);
Heading.displayName = 'Heading';

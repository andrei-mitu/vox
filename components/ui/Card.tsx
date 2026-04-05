import { Card as RadixCard, CardProps } from '@radix-ui/themes';
import { forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    return <RadixCard ref={ref} {...props} />;
  }
);
Card.displayName = 'Card';

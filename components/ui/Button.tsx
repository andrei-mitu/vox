import { Button as RadixButton, ButtonProps } from '@radix-ui/themes';
import { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <RadixButton ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

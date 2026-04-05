'use client';

import { Theme } from '@radix-ui/themes';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <Theme accentColor="teal" grayColor="slate" radius="medium" appearance="inherit">
        {children}
      </Theme>
    </NextThemesProvider>
  );
}

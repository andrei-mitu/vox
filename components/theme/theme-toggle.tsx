'use client';

import {useTheme} from 'next-themes';
import {Moon, Sun} from 'lucide-react';
import {Button} from '@/components/ui/Button';

export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();

  // If the theme hasn't resolved yet (e.g., during SSR), render a disabled placeholder.
  if (!resolvedTheme) {
    return (
      <Button variant="soft" disabled type="button" aria-hidden>
        <Sun size={16} className="opacity-40" />
      </Button>
    );
  }

  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <Button
      variant="soft"
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}

/** Floating fixed-position variant — use in root layouts or standalone pages. */
export function ThemeToggle() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggleButton />
    </div>
  );
}

'use client';

import {
    useEffect,
    useState
}                   from 'react';
import {
    Moon,
    Sun
}                   from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';
import { Button }   from '@/components/ui/Button';

export function ThemeToggleButton() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if ( !mounted ) {
        return (
            <Button variant="soft" disabled type="button" aria-hidden>
                <Sun size={16} className="opacity-40" />
            </Button>
        );
    }

    return (
        <Button
            variant="soft"
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
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

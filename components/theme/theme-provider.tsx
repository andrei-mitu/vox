'use client';

import { Theme }                from '@radix-ui/themes';
import { useServerInsertedHTML } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// `:root` in globals.css is dark by default; `.light` overrides to light.
// Radix Themes activates dark mode via the `.dark` class on a parent element.
// So dark mode = `class="dark"` on <html>, light mode = `class="light"`.

export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
    resolvedTheme: ResolvedTheme | undefined; // undefined during SSR / before mount
    setTheme: (t: ResolvedTheme) => void;
}

const ThemeCtx = createContext<ThemeContextValue>({
    resolvedTheme: undefined,
    setTheme: () => {},
});

export function useTheme(): ThemeContextValue {
    return useContext(ThemeCtx);
}

// Runs before React hydrates — reads localStorage then falls back to system pref.
// Toggles both `.dark` (for Radix Themes) and `.light` (for our custom CSS tokens).
const FOUC_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.classList.toggle('light',t==='light')}catch(e){}})()`;

function applyTheme(t: ResolvedTheme): void {
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.documentElement.classList.toggle('light', t === 'light');
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | undefined>(undefined);

    // useServerInsertedHTML injects HTML during SSR outside the React hydration tree,
    // so React 19 never encounters the <script> on the client — no warning.
    useServerInsertedHTML(() => (
        // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
        <script dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
    ));

    useEffect(() => {
        const stored = localStorage.getItem('theme') as ResolvedTheme | null;
        const initial: ResolvedTheme =
            stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        setResolvedTheme(initial);
        applyTheme(initial);

        // Follow system preference changes when the user has no explicit preference stored.
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        function handleMediaChange(e: MediaQueryListEvent): void {
            if (localStorage.getItem('theme')) return; // explicit preference takes precedence
            const next: ResolvedTheme = e.matches ? 'dark' : 'light';
            setResolvedTheme(next);
            applyTheme(next);
        }
        mediaQuery.addEventListener('change', handleMediaChange);

        // Sync theme across tabs via the storage event.
        function handleStorage(e: StorageEvent): void {
            if (e.key !== 'theme') return;
            if (e.newValue === 'dark' || e.newValue === 'light') {
                setResolvedTheme(e.newValue);
                applyTheme(e.newValue);
            } else if (!e.newValue) {
                // Preference cleared in another tab — fall back to system.
                const sys: ResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light';
                setResolvedTheme(sys);
                applyTheme(sys);
            }
        }
        window.addEventListener('storage', handleStorage);

        return () => {
            mediaQuery.removeEventListener('change', handleMediaChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const setTheme = useCallback((t: ResolvedTheme): void => {
        setResolvedTheme(t);
        localStorage.setItem('theme', t);
        applyTheme(t);
    }, []);

    const contextValue = useMemo(
        () => ({ resolvedTheme, setTheme }),
        [resolvedTheme, setTheme],
    );

    return (
        <ThemeCtx.Provider value={contextValue}>
            <Theme accentColor="teal" grayColor="slate" radius="medium" appearance="inherit">
                {children}
            </Theme>
        </ThemeCtx.Provider>
    );
}

'use client';

import { Theme }                 from '@radix-ui/themes';
import { useServerInsertedHTML } from 'next/navigation';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
}                                from 'react';

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
    setTheme: () => {
    },
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
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme | undefined>(() => {
        if ( typeof window === 'undefined' ) {
            return undefined;
        }

        const stored = localStorage.getItem('theme') as ResolvedTheme | null;

        return stored ?? (
            window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
    });

    useServerInsertedHTML(() => (
        <script dangerouslySetInnerHTML={ { __html: FOUC_SCRIPT } }/>
    ));

    useEffect(() => {
        if ( !resolvedTheme ) {
            return;
        }
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        function handleMediaChange(e: MediaQueryListEvent): void {
            if ( localStorage.getItem('theme') ) {
                return;
            }

            const next: ResolvedTheme = e.matches ? 'dark' : 'light';
            setResolvedTheme(next);
        }

        function handleStorage(e: StorageEvent): void {
            if ( e.key !== 'theme' ) {
                return;
            }

            if ( e.newValue === 'dark' || e.newValue === 'light' ) {
                setResolvedTheme(e.newValue);
            } else if ( !e.newValue ) {
                const sys: ResolvedTheme =
                    window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light';

                setResolvedTheme(sys);
            }
        }

        mediaQuery.addEventListener('change', handleMediaChange);
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
        <ThemeCtx.Provider value={ contextValue }>
            <Theme accentColor="teal" grayColor="slate" radius="medium" appearance="inherit">
                { children }
            </Theme>
        </ThemeCtx.Provider>
    );
}

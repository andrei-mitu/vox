'use client';

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextValue {
    notifications: Notification[];
    exiting: Set<string>;
    notify: (message: string, type?: NotificationType) => void;
    dismiss: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTO_DISMISS_MS = 4000;
const EXIT_ANIM_MS = 220;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [exiting, setExiting] = useState<Set<string>>(new Set());
    const autoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const remove = useCallback((id: string) => {
        setExiting((prev) => {
            const s = new Set(prev);
            s.delete(id);
            return s;
        });
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    const dismiss = useCallback((id: string) => {
        clearTimeout(autoTimers.current.get(id));
        autoTimers.current.delete(id);

        if ( exiting.has(id) ) {
            return;
        }

        setExiting((prev) => new Set(prev).add(id));
        exitTimers.current.set(id, setTimeout(() => remove(id), EXIT_ANIM_MS));
    }, [exiting, remove]);

    const notify = useCallback((message: string, type: NotificationType = 'success') => {
        const id = `${ Date.now() }-${ Math.random() }`;
        setNotifications((prev) => [...prev, { id, message, type }]);
        autoTimers.current.set(id, setTimeout(() => dismiss(id), AUTO_DISMISS_MS));
    }, [dismiss]);

    return (
        <NotificationContext.Provider value={ { notifications, exiting, notify, dismiss } }>
            { children }
        </NotificationContext.Provider>
    );
}

export function useNotify(): (message: string, type?: NotificationType) => void {
    const ctx = useContext(NotificationContext);
    if ( !ctx ) {
        throw new Error('useNotify must be used inside NotificationProvider');
    }
    return ctx.notify;
}

export function useNotifications(): NotificationContextValue {
    const ctx = useContext(NotificationContext);
    if ( !ctx ) {
        throw new Error('useNotifications must be used inside NotificationProvider');
    }
    return ctx;
}

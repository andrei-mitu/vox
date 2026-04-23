'use client';

import { Text }                  from '@radix-ui/themes';
import {
    AlertCircle,
    CheckCircle,
    Info,
    X
}                                from 'lucide-react';
import type { NotificationType } from '@/lib/client/notifications';
import { useNotifications }      from '@/lib/client/notifications';

const ICON: Record<NotificationType, React.ReactNode> = {
    success: <CheckCircle size={ 15 }/>,
    error: <AlertCircle size={ 15 }/>,
    info: <Info size={ 15 }/>,
};

const COLOR: Record<NotificationType, string> = {
    success: 'var(--green-9)',
    error: 'var(--red-9)',
    info: 'var(--accent-9)',
};

const BG: Record<NotificationType, string> = {
    success: 'var(--green-2)',
    error: 'var(--red-2)',
    info: 'var(--accent-2)',
};

const BORDER: Record<NotificationType, string> = {
    success: 'var(--green-6)',
    error: 'var(--red-6)',
    info: 'var(--accent-6)',
};

export function NotificationStack(): React.ReactElement | null {
    const { notifications, exiting, dismiss } = useNotifications();

    if ( notifications.length === 0 ) {
        return null;
    }

    return (
        <>
            <style>{ `
                @keyframes notif-in {
                    from {
                        opacity:   0;
                        transform: translateX(calc(100% + 24px));
                    }
                    to {
                        opacity:   1;
                        transform: translateX(0);
                    }
                }
                @keyframes notif-out {
                    from {
                        opacity:   1;
                        transform: translateX(0);
                        max-height: 80px;
                        margin-bottom: 0;
                    }
                    to {
                        opacity:   0;
                        transform: translateX(calc(100% + 24px));
                        max-height: 0;
                        margin-bottom: -8px;
                    }
                }
            ` }</style>

            <div
                style={ {
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    pointerEvents: 'none',
                } }
            >
                { notifications.map((n) => {
                    const isExiting = exiting.has(n.id);
                    return (
                        <div
                            key={ n.id }
                            style={ {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                background: BG[n.type],
                                border: `1px solid ${ BORDER[n.type] }`,
                                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                minWidth: '260px',
                                maxWidth: '400px',
                                overflow: 'hidden',
                                pointerEvents: 'auto',
                                animation: isExiting
                                    ? 'notif-out 220ms cubic-bezier(0.4, 0, 1, 1) forwards'
                                    : 'notif-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
                                color: COLOR[n.type],
                            } }
                        >
                            { ICON[n.type] }

                            <Text
                                size="2"
                                style={ { flex: 1, color: 'var(--gray-12)' } }
                            >
                                { n.message }
                            </Text>

                            <button
                                onClick={ () => dismiss(n.id) }
                                style={ {
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    color: 'var(--gray-10)',
                                    flexShrink: 0,
                                } }
                                aria-label="Dismiss"
                            >
                                <X size={ 13 }/>
                            </button>
                        </div>
                    );
                }) }
            </div>
        </>
    );
}

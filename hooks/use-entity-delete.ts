'use client';

import { useState }  from 'react';
import { apiDelete } from '@/lib/client/api';
import { useNotify } from '@/lib/client/notifications';

interface UseEntityDeleteOptions<T> {
    endpoint: (item: T) => string;
    onDeleted: (item: T) => void;
}

interface UseEntityDeleteReturn<T> {
    deleteTarget: T | undefined;
    setDeleteTarget: (item: T | undefined) => void;
    deleting: boolean;
    handleDelete: () => Promise<void>;
}

export function useEntityDelete<T>({
                                       endpoint,
                                       onDeleted,
                                   }: UseEntityDeleteOptions<T>): UseEntityDeleteReturn<T> {
    const notify = useNotify();
    const [deleteTarget, setDeleteTarget] = useState<T | undefined>(undefined);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete(): Promise<void> {
        if ( !deleteTarget ) {
            return;
        }
        setDeleting(true);
        try {
            const result = await apiDelete(endpoint(deleteTarget));
            if ( !result.ok ) {
                notify(result.error, 'error');
                return;
            }
            onDeleted(deleteTarget);
            setDeleteTarget(undefined);
        } catch {
            notify('Network error. Please try again.', 'error');
        } finally {
            setDeleting(false);
        }
    }

    return { deleteTarget, setDeleteTarget, deleting, handleDelete };
}

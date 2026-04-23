'use client';

import { useState }  from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    Button,
    Flex,
}                    from '@radix-ui/themes';
import { Trash2 }    from 'lucide-react';
import { apiDelete } from '@/lib/client/api';
import { useNotify } from '@/lib/client/notifications';

interface DeleteButtonProps {
    endpoint: string;
    redirectTo: string;
    entityLabel: string;
    entityName: string;
}

export function DeleteButton({
                                 endpoint,
                                 redirectTo,
                                 entityLabel,
                                 entityName,
                             }: DeleteButtonProps): React.ReactElement {
    const router = useRouter();
    const notify = useNotify();
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete(): Promise<void> {
        setDeleting(true);
        try {
            const result = await apiDelete(endpoint);
            if ( !result.ok ) {
                notify(result.error, 'error');
                setOpen(false);
                return;
            }
            router.push(redirectTo);
        } catch {
            notify('Network error. Please try again.', 'error');
            setOpen(false);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <AlertDialog.Root open={ open } onOpenChange={ setOpen }>
            <AlertDialog.Trigger>
                <Button variant="soft" color="red">
                    <Trash2 size={ 14 }/>
                    Delete
                </Button>
            </AlertDialog.Trigger>

            <AlertDialog.Content maxWidth="400px">
                <AlertDialog.Title>Delete { entityLabel }?</AlertDialog.Title>
                <AlertDialog.Description>
                    <strong>{ entityName }</strong> will be permanently removed. This action
                    cannot be undone.
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </AlertDialog.Cancel>
                    <Button color="red" onClick={ handleDelete } disabled={ deleting }>
                        { deleting ? 'Deleting…' : 'Delete' }
                    </Button>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}

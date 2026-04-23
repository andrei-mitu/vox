'use client';

import { useState }  from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertDialog,
    Button,
    Flex,
    Text,
}                    from '@radix-ui/themes';
import { Trash2 }    from 'lucide-react';

interface CarrierDeleteButtonProps {
    carrierId: string;
    carrierName: string;
    workspaceSlug: string;
}

export function CarrierDeleteButton({
                                        carrierId,
                                        carrierName,
                                        workspaceSlug,
                                    }: CarrierDeleteButtonProps): React.ReactElement {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete(): Promise<void> {
        setError(null);
        setDeleting(true);

        try {
            const res = await fetch(`/api/${ workspaceSlug }/carriers/${ carrierId }`, {
                method: 'DELETE',
            });

            if ( !res.ok ) {
                const body = await res.json().catch(() => ({}));
                setError((body as { error?: string }).error ?? 'Failed to delete carrier.');
                return;
            }

            router.push(`/${ workspaceSlug }/carriers`);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <AlertDialog.Root
            open={ open }
            onOpenChange={ (next) => {
                if ( !next ) {
                    setError(null);
                }
                setOpen(next);
            } }
        >
            <AlertDialog.Trigger>
                <Button variant="soft" color="red">
                    <Trash2 size={ 14 }/>
                    Delete
                </Button>
            </AlertDialog.Trigger>

            <AlertDialog.Content maxWidth="400px">
                <AlertDialog.Title>Delete carrier?</AlertDialog.Title>
                <AlertDialog.Description>
                    <strong>{ carrierName }</strong> will be permanently removed. This action
                    cannot be undone.
                </AlertDialog.Description>

                { error && (
                    <Text size="2" color="red" mt="2" as="p">{ error }</Text>
                ) }

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

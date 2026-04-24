'use client';

import {
    AlertDialog,
    Button,
    Flex,
} from '@radix-ui/themes';

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: React.ReactNode;
    onConfirm: () => void;
    deleting: boolean;
}

export function DeleteConfirmDialog({
                                        open,
                                        onOpenChange,
                                        title,
                                        description,
                                        onConfirm,
                                        deleting,
                                    }: DeleteConfirmDialogProps): React.ReactElement {
    return (
        <AlertDialog.Root open={ open } onOpenChange={ onOpenChange }>
            <AlertDialog.Content maxWidth="400px">
                <AlertDialog.Title>{ title }</AlertDialog.Title>
                <AlertDialog.Description>{ description }</AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                        <Button variant="soft" color="gray">Cancel</Button>
                    </AlertDialog.Cancel>
                    <Button color="red" onClick={ onConfirm } disabled={ deleting }>
                        { deleting ? 'Deleting…' : 'Delete' }
                    </Button>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
}

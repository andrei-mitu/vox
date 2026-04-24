'use client';

import {
    AlertDialog,
    Button,
    DropdownMenu,
    Flex,
    Text
}                            from '@radix-ui/themes';
import { MoreHorizontal }    from 'lucide-react';
import { useRouter }         from 'next/navigation';
import { useState }          from 'react';
import type { AdminUserRow } from '@/lib/repositories/user.repository';

interface Props {
    user: AdminUserRow;
    currentAdminId: string;
}

export function AccountActions({ user, currentAdminId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSelf = user.id === currentAdminId;
    const isBanned = user.bannedUntil !== null && new Date(user.bannedUntil) > new Date();

    async function call(path: string, method: string, body?: object): Promise<boolean> {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(path, {
                method,
                headers: body ? { 'Content-Type': 'application/json' } : undefined,
                body: body ? JSON.stringify(body) : undefined,
            });
            if ( !res.ok ) {
                const data = await res.json() as { error?: string };
                setError(data.error ?? 'Something went wrong. Please try again.');
                return false;
            }
            router.refresh();
            return true;
        } catch {
            setError('Network error. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    }

    if ( isSelf ) {
        return null;
    }

    return (
        <>
            { error && !confirmDelete && (
                <Text size="1" color="red" role="alert" className="block">
                    { error }
                </Text>
            ) }

            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Button variant="ghost" size="1" disabled={ loading } aria-label="Account actions">
                        <MoreHorizontal size={ 14 }/>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content size="1" align="end">
                    {/* Role — disabled when user has no profile row */ }
                    { user.systemRole === null ? (
                        <DropdownMenu.Item disabled>
                            No profile (role unavailable)
                        </DropdownMenu.Item>
                    ) : user.systemRole === 'user' ? (
                        <DropdownMenu.Item
                            onClick={ () => call(`/api/admin/users/${ user.id }/role`, 'PATCH', { role: 'admin' }) }
                        >
                            Promote to Admin
                        </DropdownMenu.Item>
                    ) : (
                        <DropdownMenu.Item
                            onClick={ () => call(`/api/admin/users/${ user.id }/role`, 'PATCH', { role: 'user' }) }
                        >
                            Demote to User
                        </DropdownMenu.Item>
                    ) }

                    <DropdownMenu.Separator/>

                    {/* Ban / Unban */ }
                    { isBanned ? (
                        <DropdownMenu.Item onClick={ () => call(`/api/admin/users/${ user.id }/unban`, 'POST') }>
                            Unban
                        </DropdownMenu.Item>
                    ) : (
                        <DropdownMenu.Item
                            color="orange"
                            onClick={ () => call(`/api/admin/users/${ user.id }/ban`, 'POST') }
                        >
                            Ban
                        </DropdownMenu.Item>
                    ) }

                    <DropdownMenu.Separator/>

                    <DropdownMenu.Item color="red" onClick={ () => {
                        setError(null);
                        setConfirmDelete(true);
                    } }>
                        Delete account
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>

            {/* Delete confirm dialog */ }
            <AlertDialog.Root open={ confirmDelete } onOpenChange={ setConfirmDelete }>
                <AlertDialog.Content maxWidth="420px">
                    <AlertDialog.Title>Delete account?</AlertDialog.Title>
                    <AlertDialog.Description size="2" color="gray">
                        This will permanently delete <strong>{ user.email }</strong> and all their data. This action
                        cannot be undone.
                    </AlertDialog.Description>
                    { error && (
                        <Text size="1" color="red" role="alert" className="block mt-2">
                            { error }
                        </Text>
                    ) }
                    <Flex gap="3" justify="end" mt="4">
                        <AlertDialog.Cancel>
                            <Button variant="soft" color="gray" onClick={ () => setError(null) }>
                                Cancel
                            </Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action>
                            <Button
                                color="red"
                                loading={ loading }
                                onClick={ async () => {
                                    const ok = await call(`/api/admin/users/${ user.id }`, 'DELETE');
                                    if ( ok ) {
                                        setConfirmDelete(false);
                                    }
                                } }
                            >
                                Delete
                            </Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>
    );
}

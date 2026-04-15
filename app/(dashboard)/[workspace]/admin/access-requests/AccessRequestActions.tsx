"use client";

import {
    Button,
    Callout,
    Dialog,
    Flex,
    Text
}                    from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState }  from "react";

interface Props {
    id: string;
    workspace: string;
    email: string;
}

export function AccessRequestActions({ id, workspace, email }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [done, setDone] = useState<"approved" | "rejected" | null>(null);

    async function handleApprove() {
        setLoading("approve");
        setError("");
        try {
            const res = await fetch(
                `/api/${ workspace }/admin/access-requests/${ id }/approve`,
                {
                    method: "POST",
                },
            );
            const data = (await res.json()) as {
                tempPassword?: string;
                error?: string;
            };
            if ( !res.ok ) {
                setError(data.error ?? "Approval failed.");
                return;
            }
            setTempPassword(data.tempPassword ?? null);
            setDone("approved");
        } catch {
            setError("Unexpected error. Please try again.");
        } finally {
            setLoading(null);
        }
    }

    async function handleReject() {
        setLoading("reject");
        setError("");
        try {
            const res = await fetch(
                `/api/${ workspace }/admin/access-requests/${ id }/reject`,
                {
                    method: "POST",
                },
            );
            if ( !res.ok ) {
                const data = (await res.json()) as { error?: string };
                setError(data.error ?? "Rejection failed.");
                return;
            }
            setDone("rejected");
            router.refresh();
        } catch {
            setError("Unexpected error. Please try again.");
        } finally {
            setLoading(null);
        }
    }

    if ( done === "rejected" ) {
        return (
            <Text size="2" color="gray">
                Rejected
            </Text>
        );
    }

    return (
        <>
            { error && (
                <Text size="1" color="red" role="alert">
                    { error }
                </Text>
            ) }

            { done !== "approved" && (
                <Flex gap="2">
                    <Button
                        size="1"
                        color="green"
                        loading={ loading === "approve" }
                        disabled={ loading !== null }
                        onClick={ handleApprove }
                    >
                        Approve
                    </Button>
                    <Button
                        size="1"
                        color="red"
                        variant="soft"
                        loading={ loading === "reject" }
                        disabled={ loading !== null }
                        onClick={ handleReject }
                    >
                        Reject
                    </Button>
                </Flex>
            ) }

            {/* One-time password dialog — shown automatically after approval */ }
            <Dialog.Root open={ done === "approved" && tempPassword !== null }>
                <Dialog.Content maxWidth="420px">
                    <Dialog.Title>Account created</Dialog.Title>
                    <Dialog.Description size="2" color="gray" mb="4">
                        Share this one-time password with <strong>{ email }</strong>. It will
                        not be shown again.
                    </Dialog.Description>

                    <Callout.Root color="amber" mb="4">
                        <Callout.Text>
                            <Text weight="bold">Temporary password</Text>
                        </Callout.Text>
                        <Callout.Text>
                            <code
                                style={ {
                                    fontFamily: "monospace",
                                    fontSize: "1rem",
                                    letterSpacing: "0.05em",
                                } }
                            >
                                { tempPassword }
                            </code>
                        </Callout.Text>
                    </Callout.Root>

                    <Flex justify="end">
                        <Dialog.Close>
                            <Button
                                onClick={ () => {
                                    setTempPassword(null);
                                    router.refresh();
                                } }
                            >
                                Done
                            </Button>
                        </Dialog.Close>
                    </Flex>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );
}

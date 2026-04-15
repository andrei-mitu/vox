import {
    Box,
    Button,
    Flex,
    Heading,
    Text
}                         from "@radix-ui/themes";
import Link               from "next/link";
import { getSessionUser } from "@/lib/services/auth.service";

export default async function NoAccessPage() {
    const user = await getSessionUser();

    return (
        <Flex
            direction="column"
            align="center"
            gap="4"
            className="w-full max-w-sm text-center"
        >
            <Box>
                <Heading size="6" mb="2">
                    No workspace access
                </Heading>
                <Text color="gray" size="3">
                    You&apos;re not assigned to any workspace yet.
                </Text>
            </Box>
            <Text color="gray" size="2">
                Ask your team admin to share an invite link, or request a new workspace.
            </Text>
            { user ? (
                <form action="/api/auth/logout" method="POST">
                    <Button type="submit" variant="soft" color="gray">
                        Sign out
                    </Button>
                </form>
            ) : (
                <Button variant="soft" asChild>
                    <Link href="/login">Back to login</Link>
                </Button>
            ) }
        </Flex>
    );
}

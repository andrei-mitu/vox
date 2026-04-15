import {
    Box,
    Card,
    Flex,
    Heading,
    Text
}                          from "@radix-ui/themes";
import Link                from "next/link";
import { redirect }        from "next/navigation";
import { getSessionUser }  from "@/lib/services/auth.service";
import { getVisibleTeams } from "@/lib/services/team.service";

export default async function SelectWorkspacePage() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect("/login");
    }

    const teams = await getVisibleTeams(user.id, user.role);
    if ( teams.length === 0 ) {
        redirect("/no-access");
    }
    if ( teams.length === 1 ) {
        redirect(`/${ teams[0].slug }/dashboard`);
    }

    return (
        <Flex direction="column" gap="5" className="w-full max-w-sm">
            <Box>
                <Heading size="6" mb="1">
                    Select a workspace
                </Heading>
                <Text color="gray" size="2">
                    Choose where you want to continue.
                </Text>
            </Box>

            <Flex direction="column" gap="2">
                { teams.map((team) => (
                    <Link
                        key={ team.id }
                        href={ `/${ team.slug }/dashboard` }
                        className="block"
                    >
                        <Card asChild>
                            <div className="cursor-pointer hover:bg-[var(--gray-2)] transition-colors px-4 py-3">
                                <Text as="div" weight="medium">
                                    { team.name }
                                </Text>
                                <Text as="div" color="gray" size="2">
                                    { team.slug }
                                </Text>
                            </div>
                        </Card>
                    </Link>
                )) }
            </Flex>
        </Flex>
    );
}

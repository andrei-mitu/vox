import {
    Box,
    Heading
}                      from '@radix-ui/themes';
import { NewTripForm } from '@/components/trips/NewTripForm';

export default async function NewTripPage({
                                              params,
                                          }: {
    params: Promise<{ workspace: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug } = await params;

    return (
        <Box p="6" style={ { maxWidth: 800 } }>
            <Heading size="6" mb="6">New Trip</Heading>
            <NewTripForm workspaceSlug={ slug }/>
        </Box>
    );
}

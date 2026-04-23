import {
    Flex,
    Text,
} from '@radix-ui/themes';

export function ClientCarriersTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No carriers yet.</Text>
            <Text size="2" color="gray">Carriers used by this client will appear here.</Text>
        </Flex>
    );
}

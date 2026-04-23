import {
    Flex,
    Text,
} from '@radix-ui/themes';

export function RouteCarriersTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No carriers yet.</Text>
            <Text size="2" color="gray">Carriers that have serviced this route will appear here.</Text>
        </Flex>
    );
}

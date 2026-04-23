import {
    Flex,
    Text,
} from '@radix-ui/themes';

export function ClientShipmentsTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No shipments yet.</Text>
            <Text size="2" color="gray">Shipments for this client will appear here.</Text>
        </Flex>
    );
}

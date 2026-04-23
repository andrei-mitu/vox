import {
    Flex,
    Text
} from '@radix-ui/themes';

export function CarrierShipmentsTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No shipments yet.</Text>
            <Text size="2" color="gray">Shipments assigned to this carrier will appear here.</Text>
        </Flex>
    );
}

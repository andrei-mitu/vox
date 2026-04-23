import {
    Flex,
    Text
} from '@radix-ui/themes';

export function CarrierClientsTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No clients yet.</Text>
            <Text size="2" color="gray">Clients linked via shipments with this carrier will appear here.</Text>
        </Flex>
    );
}

import {
    Flex,
    Text
} from '@radix-ui/themes';

export function CarrierRoutesTab(): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">No routes yet.</Text>
            <Text size="2" color="gray">Routes serviced by this carrier will appear here.</Text>
        </Flex>
    );
}

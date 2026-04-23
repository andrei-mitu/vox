import {
    Flex,
    Text,
} from '@radix-ui/themes';

interface EmptyTabStateProps {
    title: string;
    description: string;
}

export function EmptyTabState({ title, description }: EmptyTabStateProps): React.ReactElement {
    return (
        <Flex direction="column" align="center" py="9" gap="2">
            <Text size="3" color="gray">{ title }</Text>
            <Text size="2" color="gray">{ description }</Text>
        </Flex>
    );
}

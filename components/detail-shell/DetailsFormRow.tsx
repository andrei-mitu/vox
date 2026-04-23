import {
    Flex,
    Table,
    Text,
}                         from '@radix-ui/themes';
import { useFieldErrors } from '@/components/detail-shell/DetailsForm';

interface DetailsFormRowProps {
    label: string;
    name?: string;
    align?: 'middle' | 'top';
    children: React.ReactNode;
}

export function DetailsFormRow({
                                   label,
                                   name,
                                   align = 'middle',
                                   children,
                               }: DetailsFormRowProps): React.ReactElement {
    const fieldErrors = useFieldErrors();
    const error = name ? (fieldErrors[name] ?? null) : null;

    return (
        <Table.Row>
            <Table.Cell
                style={ {
                    width: 200,
                    verticalAlign: align === 'top' ? 'top' : 'middle',
                    ...(align === 'top' ? { paddingTop: 14 } : {}),
                } }
            >
                <Text size="2" color="gray" weight="medium">{ label }</Text>
            </Table.Cell>
            <Table.Cell>
                <Flex direction="column" gap="1">
                    { children }
                    { error && (
                        <Text size="1" color="red">{ error }</Text>
                    ) }
                </Flex>
            </Table.Cell>
        </Table.Row>
    );
}

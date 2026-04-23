import {
    Table,
    Text
} from '@radix-ui/themes';

export interface DetailsRow {
    label: string;
    value: React.ReactNode;
}

interface DetailsTableProps {
    rows: DetailsRow[];
}

export function DetailsTable({ rows }: DetailsTableProps): React.ReactElement {
    return (
        <Table.Root variant="surface">
            <Table.Body>
                { rows.map((row) => (
                    <Table.Row key={ row.label }>
                        <Table.Cell style={ { width: 160 } }>
                            <Text size="2" color="gray" weight="medium">
                                { row.label }
                            </Text>
                        </Table.Cell>
                        <Table.Cell>
                            { row.value != null && row.value !== ''
                                ? typeof row.value === 'string' || typeof row.value === 'number'
                                    ? <Text size="2">{ row.value }</Text>
                                    : row.value
                                : <Text size="2" color="gray">—</Text>
                            }
                        </Table.Cell>
                    </Table.Row>
                )) }
            </Table.Body>
        </Table.Root>
    );
}

import {
    Heading,
    Table,
    Text
}                                     from "@radix-ui/themes";
import { redirect }                   from "next/navigation";
import { findAccessRequestsByStatus } from "@/lib/repositories/access-request.repository";
import { getSessionUser }             from "@/lib/services/auth.service";
import { AccessRequestActions }       from "./AccessRequestActions";

export default async function AccessRequestsPage({
                                                     params,
                                                 }: {
    params: Promise<{ workspace: string }>;
}) {
    const user = await getSessionUser();
    if ( !user || user.role !== "admin" ) {
        redirect("/no-access");
    }

    const { workspace } = await params;
    const requests = await findAccessRequestsByStatus("pending");

    return (
        <div className="p-8">
            <Heading size="6" mb="6">
                Access Requests
            </Heading>

            { requests.length === 0 ? (
                <Text size="3" color="gray">
                    No pending access requests.
                </Text>
            ) : (
                <Table.Root variant="surface">
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Company</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        { requests.map((req) => (
                            <Table.Row key={ req.id }>
                                <Table.Cell>{ req.fullName }</Table.Cell>
                                <Table.Cell>{ req.email }</Table.Cell>
                                <Table.Cell>{ req.companyName }</Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        { req.message ?? "—" }
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <Text size="2" color="gray">
                                        { new Date(req.createdAt).toLocaleDateString() }
                                    </Text>
                                </Table.Cell>
                                <Table.Cell>
                                    <AccessRequestActions
                                        id={ req.id }
                                        workspace={ workspace }
                                        email={ req.email }
                                    />
                                </Table.Cell>
                            </Table.Row>
                        )) }
                    </Table.Body>
                </Table.Root>
            ) }
        </div>
    );
}

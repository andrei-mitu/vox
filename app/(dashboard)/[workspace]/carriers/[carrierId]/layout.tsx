import {
    notFound,
    redirect
}                              from "next/navigation";
import Link                    from "next/link";
import {
    Badge,
    Box,
    Flex,
    Heading
}                              from "@radix-ui/themes";
import { ArrowLeft }           from "lucide-react";
import { DetailTabs }          from "@/components/detail-shell/DetailTabs";
import { CARRIER_MODE_LABELS } from "@/lib/dto/carrier.dto";
import { findTeamBySlug }      from "@/lib/repositories/team.repository";
import { getCarrier }          from "@/lib/services/carrier.service";

export default async function CarrierDetailLayout({
                                                      children,
                                                      params,
                                                  }: {
    children: React.ReactNode;
    params: Promise<{ workspace: string; carrierId: string }>;
}): Promise<React.ReactElement> {
    const { workspace: slug, carrierId } = await params;

    const team = await findTeamBySlug(slug);
    if ( !team ) {
        redirect("/no-access");
    }

    const carrier = await getCarrier(team.id, carrierId);
    if ( !carrier ) {
        notFound();
    }

    const base = `/${ slug }/carriers/${ carrierId }`;
    const tabs = [
        { label: "Details", href: `${ base }/details` },
        { label: "Shipments", href: `${ base }/shipments` },
        { label: "Clients", href: `${ base }/clients` },
        { label: "Routes", href: `${ base }/routes` },
    ];

    return (
        <Box>
            {/* Header */ }
            <Box px="6" pt="6" pb="0">
                {/* Back link */ }
                <Flex mb="4">
                    <Link
                        href={ `/${ slug }/carriers` }
                        className="flex items-center gap-1 text-sm text-[var(--gray-11)] hover:text-[var(--gray-12)] transition-colors"
                    >
                        <ArrowLeft size={ 14 }/>
                        Carriers
                    </Link>
                </Flex>

                {/* Title row */ }
                <Flex justify="between" align="start" mb="4">
                    <Box>
                        <Heading size="6" mb="2">{ carrier.name }</Heading>
                        <Flex gap="2" align="center">
                            <Badge color="blue" variant="soft">
                                { CARRIER_MODE_LABELS[carrier.mode] }
                            </Badge>
                            <Badge
                                color={ carrier.status === "active" ? "green" : "gray" }
                                variant="soft"
                            >
                                { carrier.status === "active" ? "Active" : "Inactive" }
                            </Badge>
                            <Badge variant="outline" color="gray">{ carrier.code }</Badge>
                        </Flex>
                    </Box>
                </Flex>

                {/* Tabs */ }
                <DetailTabs tabs={ tabs }/>
            </Box>

            {/* Tab content */ }
            <Box px="6" pt="5" pb="6">
                { children }
            </Box>
        </Box>
    );
}

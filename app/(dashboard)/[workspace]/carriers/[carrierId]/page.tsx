import { redirect } from "next/navigation";

export default async function CarrierIndexPage({
                                                   params,
                                               }: {
    params: Promise<{ workspace: string; carrierId: string }>;
}): Promise<never> {
    const { workspace, carrierId } = await params;
    redirect(`/${ workspace }/carriers/${ carrierId }/details`);
}

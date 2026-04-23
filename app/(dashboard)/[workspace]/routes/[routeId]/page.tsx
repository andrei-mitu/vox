import { redirect } from "next/navigation";

export default async function RouteIndexPage({
                                                 params,
                                             }: {
    params: Promise<{ workspace: string; routeId: string }>;
}): Promise<never> {
    const { workspace, routeId } = await params;
    redirect(`/${ workspace }/routes/${ routeId }/details`);
}

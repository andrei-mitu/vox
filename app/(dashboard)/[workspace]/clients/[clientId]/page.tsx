import { redirect } from 'next/navigation';

export default async function ClientIndexPage({
                                                  params,
                                              }: {
    params: Promise<{ workspace: string; clientId: string }>;
}): Promise<never> {
    const { workspace, clientId } = await params;
    redirect(`/${ workspace }/clients/${ clientId }/details`);
}

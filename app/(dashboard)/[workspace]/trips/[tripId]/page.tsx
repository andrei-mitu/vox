import { redirect } from 'next/navigation';

export default async function TripIndexPage({
                                                params,
                                            }: {
    params: Promise<{ workspace: string; tripId: string }>;
}): Promise<never> {
    const { workspace, tripId } = await params;
    redirect(`/${ workspace }/trips/${ tripId }/details`);
}

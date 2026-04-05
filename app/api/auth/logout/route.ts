import { cookies } from 'next/headers';
import { signOutAndRedirect } from '@/lib/auth/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  return signOutAndRedirect(request.url, cookieStore);
}

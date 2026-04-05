import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/auth/server';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getSessionUser(await cookies());

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="p-8 flex flex-col gap-4 items-start">
      <Heading size="6">Welcome, {user.email}</Heading>
      <form action="/api/auth/logout" method="post">
        <Button type="submit" color="red" variant="solid">
          Logout
        </Button>
      </form>
    </main>
  );
}

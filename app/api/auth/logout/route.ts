import {signOutAndRedirect} from '@/lib/services/auth.service';

export async function POST(request: Request) {
    return signOutAndRedirect(request.url);
}

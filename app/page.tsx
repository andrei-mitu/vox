import { redirect }                 from "next/navigation";
import { getSessionUser }           from "@/lib/services/auth.service";
import { resolvePostLoginRedirect } from "@/lib/services/workspace.service";

export default async function RootPage() {
    const user = await getSessionUser();
    if ( !user ) {
        redirect("/login");
    }
    redirect(await resolvePostLoginRedirect(user.id, user.role));
}

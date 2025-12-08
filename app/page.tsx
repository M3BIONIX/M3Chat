import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function Home() {
    const { user } = await withAuth({
        ensureSignedIn: true,
    });
    if (!user) {
        redirect("/auth");
    }

    // If user is authenticated, redirect to chat
    redirect("/chat");
}
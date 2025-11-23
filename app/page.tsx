import {withAuth} from "@workos-inc/authkit-nextjs";
import {router} from "next/client";

export default async function Home() {
    const { user } = await withAuth({
        ensureSignedIn: true,
    });
    if (!user) {
        await router.push("/auth");
    }
}
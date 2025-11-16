import {authkit} from "@workos-inc/authkit-nextjs";
import {NextRequest, NextResponse} from "next/server";

export default async function middleware(request: NextRequest) {
    // Perform logic before or after AuthKit
    // Auth object contains the session, response headers and an auhorization URL in the case that the session isn't valid
    const auth = await authkit(request, {
        debug: true,
    });

    // Control of what to do when there's no session on a protected route is left to the developer
    if (request.url.includes("/account") && !auth.session.user) {
        console.log("No session on protected path");
        return NextResponse.redirect("/login");
    }

    // Headers need to be included in every non-redirect response to ensure that `withAuth` works as expected
    return NextResponse.next({
        headers: auth.headers,
    });
}

// Match against the pages
export const config = { matcher: ["/", "/account/:path*", "/api/:path*"] };
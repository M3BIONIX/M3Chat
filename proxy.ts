import {authkit} from "@workos-inc/authkit-nextjs";
import {NextRequest, NextResponse} from "next/server";

export default async function middleware(request: NextRequest) {    
    // Auth object contains the session, response headers and an authorization URL in the case that the session isn't valid
    const auth = await authkit(request, {
        debug: true,
    });

    const pathname = request.nextUrl.pathname;
    
    // Public routes that don't require authentication
    const publicRoutes = ['/auth', '/welcome'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    // Static files and API routes should be excluded
    const isStaticFile = pathname.startsWith('/_next') || 
                         pathname.startsWith('/api') || 
                         pathname.includes('.') || // files with extensions
                         pathname.startsWith('/favicon.ico');
    
    // If it's not a public route and not a static file, require auth
    if (!isPublicRoute && !isStaticFile) {
        if (!auth.session || !auth.session.user) {
            console.log("No session on protected path:", pathname);
            return NextResponse.redirect(new URL("/auth", request.url));
        }
    }

    // Headers need to be included in every non-redirect response to ensure that `withAuth` works as expected
    return NextResponse.next({
        headers: auth.headers,
    });
}

// Match against all routes except static files and Next.js internals
export const config = { 
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ] 
};
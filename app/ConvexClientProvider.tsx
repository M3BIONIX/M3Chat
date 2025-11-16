"use client";

import { ConvexProviderWithAuth, ConvexReactClient} from "convex/react";
import {ReactNode, useCallback, useState} from "react";
import {AuthKitProvider, useAccessToken, useAuth} from "@workos-inc/authkit-nextjs/components";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
    <AuthKitProvider>
        <ConvexProviderWithAuth client={convex} useAuth={useWorkOsAuth}>{children}</ConvexProviderWithAuth>;
    </AuthKitProvider>
    )
}

function useWorkOsAuth() {
    const {user, loading: isLoading} = useAuth();
    const { accessToken, loading: tokenLoading, error: tokenError } = useAccessToken()
    const isAuthLoading: boolean = (isLoading ?? false) || (tokenLoading ?? false);
    const isAuthenticated = !!user && !!accessToken && !isAuthLoading;

    const [ stableAccessToken, setStableAccessToken ] = useState<string | null>(null);
    if (accessToken && !tokenError) {
        setStableAccessToken(accessToken)
    }

    const fetchAccessToken =  useCallback(async () => {
        if(stableAccessToken && !tokenError) return stableAccessToken;
        return null;
    }, [stableAccessToken, tokenError]);

    return {
        fetchAccessToken,
        isLoading: isAuthLoading,
        isAuthenticated,
    }

}

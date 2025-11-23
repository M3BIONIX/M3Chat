import {useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateUserSchema, LoginSchema, UserSchema} from "@/lib/schemas/AuthSchema";

export const userHookKey = ['userHook'];

export function useUserHook() {
    const queryClient = useQueryClient()
    const workOsClientId = process.env.WORKOS_CLIENT_ID;

    const user = useQuery({
        queryKey: userHookKey,
        queryFn: () => {
            return {} as UserSchema;
        },
        initialData: {} as UserSchema,
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: 15 * 60 * 60 * 1000,
    })

    async function createUser(userData: CreateUserSchema) {
        const response = await fetch('api/auth/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if(!response.ok) {
            throw new Error('Unable to create user');
        }

        const createdUser = await response.json() as UserSchema;

        queryClient.setQueryData<UserSchema>(userHookKey, () => {
            return createdUser as UserSchema;
        });
    }

    async function authenticateUserByEmail(userData: LoginSchema) {
        if(!workOsClientId) return null;
        const response = await fetch('api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if(!response.ok) {
            throw new Error('Unable to login user');
        }

        const user = await response.json() as UserSchema;

        queryClient.setQueryData<UserSchema>(userHookKey, (prev) => {
            if (!user) {
                return prev || ({} as UserSchema);
            }
            return {
                externalId: user.externalId || '',
                email: user.email || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                profilePicture: user.profilePicture || '',
                emailVerified: user.emailVerified || false,
            }
        })
    }

    async function authenticateWithGoogle() {
        if (!workOsClientId) {
            throw new Error('WorkOS Client ID not configured');
        }

        const redirectUri = `${window.location.origin}/auth/callback`;
        window.location.href = `https://api.workos.com/sso/authorize?client_id=${workOsClientId}&provider=google&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    }

    async function authenticateWithGithub() {
        if (!workOsClientId) {
            throw new Error('WorkOS Client ID not configured');
        }

        const redirectUri = `${window.location.origin}/auth/callback`;
        window.location.href = `https://api.workos.com/sso/authorize?client_id=${workOsClientId}&provider=github&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    }

    return {
        user,
        createUser,
        authenticateUserByEmail,
        authenticateWithGithub,
        authenticateWithGoogle
        
    }
}
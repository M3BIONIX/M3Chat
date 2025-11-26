import {useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateUserSchema, LoginSchema, UserSchema} from "@/lib/schemas/AuthSchema";

export const userHookKey = ['userHook'];

export function useUserHook() {
    const queryClient = useQueryClient()
    const workOsClientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;

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
        try {
            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.error || 'Unable to create user');
            }

            const createdUser = data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, () => {
                return createdUser as UserSchema;
            });

            await authenticateUserByEmail({
                email: userData.email,
                password: userData.password
            })
        } catch (error) {
            // Re-throw with proper message
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to create user. Please try again.');
        }
    }

    async function authenticateByCode(code: string) {
        try {
            const response = await fetch(`/api/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(code)
            })

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.error || 'Unable to authenticate');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to authenticate. Please try again.');
        }
    }

    async function authenticateUserByEmail(userData: LoginSchema) {
        if(!workOsClientId) {
            throw new Error('WorkOS Client ID not configured');
        }
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            // If verification is required, throw error with token
            if (data.requiresVerification && data.pendingAuthenticationToken) {
                const error: any = new Error('VERIFICATION_REQUIRED');
                error.pendingAuthenticationToken = data.pendingAuthenticationToken;
                error.email = data.email;
                throw error;
            }

            if(!response.ok) {
                throw new Error(data.error || 'Unable to login user');
            }

            const user = data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, (prev) => {
                return user;
            });

            return user;
        } catch (error) {
            // Re-throw if it's already an Error with message
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to login. Please try again.');
        }
    }

    // Add function to verify email with token and code (NO email/password)
    async function verifyEmailAndLogin(pendingAuthenticationToken: string, code: string) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    pendingAuthenticationToken, 
                    code 
                    // NO email or password here!
                }),
            });

            const data = await response.json();

            if(!response.ok) {
                throw new Error(data.error || 'Invalid verification code');
            }

            const user = data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, (prev) => {
                return user;
            });

            return user;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to verify code. Please try again.');
        }
    }

    async function sendVerificationCode(email: string) {
        try {
            const sendCode = await fetch(`/api/send-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({email}),
            })

            const data = await sendCode.json();

            if(!sendCode.ok) {
                throw new Error(data.error || 'Unable to send code');
            }

            return data;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to send verification code. Please try again.');
        }
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
        authenticateWithGoogle,
        authenticateByCode,
        sendVerificationCode,
        verifyEmailAndLogin, // Export this
    }
}
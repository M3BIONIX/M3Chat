import {useQuery, useQueryClient} from "@tanstack/react-query";
import {CreateUserSchema, LoginSchema, UserSchema} from "@/lib/schemas/AuthSchema";
import {VerificationRequiredError} from "@/lib/schemas/ErrorSchema";
import {validateResponse} from "@/lib/utils/apiValidation";
import * as z from 'zod';

export const userHookKey = ['userHook'];

export function useUserHook() {
    const queryClient = useQueryClient()
    const workOsClientId = process.env.NEXT_PUBLIC_WORKOS_CLIENT_ID;

    const user = useQuery({
        queryKey: userHookKey,
        queryFn: async () => {
            // Fetch current user from API
            const response = await fetch('/api/me', {
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = typeof errorData === 'object' && errorData !== null && 'error' in errorData
                    ? String(errorData.error)
                    : `Failed to fetch user: ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            
            // Validate response with schema
            const UserZodSchema = z.object({
                externalId: z.string(),
                email: z.string(),
                firstName: z.string().nullable().optional(),
                lastName: z.string().nullable().optional(),
                emailVerified: z.boolean(),
                profilePicture: z.optional(z.string().url().nullable()),
            });
            
            const validation = validateResponse(data, UserZodSchema);
            if (!validation.success) {
                throw new Error(validation.error);
            }

            return validation.data as UserSchema;
        },
        enabled: true,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 15 * 60 * 1000,
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
                const errorMessage = typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : 'Unable to create user';
                throw new Error(errorMessage);
            }

            // Validate response
            const UserZodSchema = z.object({
                externalId: z.string(),
                email: z.string(),
                firstName: z.string().nullable().optional(),
                lastName: z.string().nullable().optional(),
                emailVerified: z.boolean(),
                profilePicture: z.optional(z.string().url().nullable()),
            });
            
            const validation = validateResponse(data, UserZodSchema);
            if (!validation.success) {
                throw new Error(validation.error);
            }

            const createdUser = validation.data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, () => {
                return createdUser;
            });

            await authenticateUserByEmail({
                email: userData.email,
                password: userData.password
            })
        } catch (error) {
            // Re-throw if it's already an Error
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
                body: JSON.stringify({ code })
            })

            const data = await response.json();

            if(!response.ok) {
                const errorMessage = typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : 'Unable to authenticate';
                throw new Error(errorMessage);
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

            // If verification is required, throw VerificationRequiredError
            if (typeof data === 'object' && data !== null && 
                'requiresVerification' in data && 
                data.requiresVerification === true &&
                'pendingAuthenticationToken' in data &&
                typeof data.pendingAuthenticationToken === 'string') {
                throw new VerificationRequiredError(
                    data.pendingAuthenticationToken,
                    typeof data.email === 'string' ? data.email : undefined
                );
            }

            if(!response.ok) {
                const errorMessage = typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : 'Unable to login user';
                throw new Error(errorMessage);
            }

            // Validate response
            const UserZodSchema = z.object({
                externalId: z.string(),
                email: z.string(),
                firstName: z.string().nullable().optional(),
                lastName: z.string().nullable().optional(),
                emailVerified: z.boolean(),
                profilePicture: z.optional(z.string().url().nullable()),
            });
            
            const validation = validateResponse(data, UserZodSchema);
            if (!validation.success) {
                throw new Error(validation.error);
            }

            const user = validation.data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, (_prev: UserSchema | undefined) => {
                return user;
            });

            return user;
        } catch (error) {
            // Re-throw if it's already an Error (including VerificationRequiredError)
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
                const errorMessage = typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : 'Invalid verification code';
                throw new Error(errorMessage);
            }

            // Validate response
            const UserZodSchema = z.object({
                externalId: z.string(),
                email: z.string(),
                firstName: z.string().nullable().optional(),
                lastName: z.string().nullable().optional(),
                emailVerified: z.boolean(),
                profilePicture: z.optional(z.string().url().nullable()),
            });
            
            const validation = validateResponse(data, UserZodSchema);
            if (!validation.success) {
                throw new Error(validation.error);
            }

            const user = validation.data as UserSchema;

            queryClient.setQueryData<UserSchema>(userHookKey, (_prev: UserSchema | undefined) => {
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
                const errorMessage = typeof data === 'object' && data !== null && 'error' in data
                    ? String(data.error)
                    : 'Unable to send code';
                throw new Error(errorMessage);
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
        verifyEmailAndLogin,
    }
}

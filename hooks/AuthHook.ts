import { useQuery, useQueryClient} from "@tanstack/react-query";
import {AuthModalSchema} from "@/lib/schemas/AuthSchema";

export const authHookKey = ['authHook'];

export default function useAuthHook() {
    const authHook = useQueryClient();
    
    const authState = useQuery({
        queryKey: authHookKey,
        queryFn: () => {
            return {} as AuthModalSchema
        },
        initialData: {
            showSignup: false,
            showForgotPassword: false
        } as AuthModalSchema,
        staleTime: Infinity
    })
    
    function setShowForgotPassword(status: boolean) {
        authHook.setQueryData<AuthModalSchema>(authHookKey, (curr = {} as AuthModalSchema) => {
            return {
                ...curr,
                showForgotPassword: status
            }
        })
    }

    function setShowSignUpModal(status: boolean) {
        authHook.setQueryData<AuthModalSchema>(authHookKey, (curr = {} as AuthModalSchema) => {
            return {
                ...curr,
                showSignup: status
            }
        })
    }

    return {
        authState,
        setShowForgotPassword,
        setShowSignUpModal
    }
}
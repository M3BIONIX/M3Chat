import {useQuery, useQueryClient} from "@tanstack/react-query";
import {fileInputQueryKey} from "@/hooks/FileInputHooks";

export const currentChatQueryKey = "currentChat"

export default function useCurrentChatHook() {
    const queryClient = useQueryClient();

    const currentChatContext = useQuery({
        queryKey: fileInputQueryKey,

    })
}
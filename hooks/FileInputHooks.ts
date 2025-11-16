import {useQuery, useQueryClient} from "@tanstack/react-query";
import {AttachedFile} from "@/app/components/chat-input/Chat.interface";

export const fileInputQueryKey = ['fileInputData'];

export default function useFileInputHook() {
    const queryClient = useQueryClient();

    const { data: files = [] } = useQuery({
        queryKey: fileInputQueryKey,
        queryFn: () => [],
        initialData: [],
        staleTime: Infinity,
        gcTime: Infinity

    })

    const addFiles = (newFiles: AttachedFile[]) => {
        queryClient.setQueryData(fileInputQueryKey, (oldFiles: AttachedFile[] = [])=> {
            return [...oldFiles, newFiles];
        });
    }

    const removeFiles = (fileToRemove: AttachedFile) => {
        queryClient.setQueryData(fileInputQueryKey, (files: AttachedFile[]) =>{
            return files.filter((file: AttachedFile) => {
                return file.id === fileToRemove.id;
            })
        });
    }

    const clearFiles = () => {
        queryClient.setQueryData(fileInputQueryKey, [])
    }

    return {
        files,
        addFiles,
        removeFiles,
        clearFiles,
    }



}
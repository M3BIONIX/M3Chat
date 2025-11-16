import {useQuery, useQueryClient} from "@tanstack/react-query";
import {AttachedFile, AttachedFileArray} from "@/lib/schemas/FileSchema";
import {useConvex} from "convex/react";
import {uploadFiles} from "@/lib/fileUploadUtils";

export const fileInputQueryKey = ['fileInputData'];

export default function useFileInputHook() {
    const queryClient = useQueryClient();
    const convex = useConvex();

    const { data: files = [] as AttachedFile[] } = useQuery({
        queryKey: fileInputQueryKey,
        queryFn: () => [] as AttachedFile[],
        initialData: [] as AttachedFile[],
        staleTime: Infinity,
        gcTime: Infinity

    })

    const addFiles = async (newFile: File) => {
        try {
            const uploadedFile = await uploadFiles(newFile, convex);
            
            const parsed = AttachedFileArray.safeParse([uploadedFile]);
            if (!parsed.success) {
                console.error("File validation failed:", parsed.error);
                throw new Error("Invalid file data");
            }
            
            queryClient.setQueryData<AttachedFile[]>(fileInputQueryKey, (old = []) => {
                return [...old, uploadedFile];
            });
        }
        catch {
            throw new Error("Could not parse file input");
        }
    };

    const removeFiles = (fileId: string) => {
        queryClient.setQueryData<AttachedFile[]>(fileInputQueryKey, (old = []) => {
            return old.filter((file) => file.id !== fileId);
        });
    };

    const clearFiles = () => {
        queryClient.setQueryData<AttachedFile[]>(fileInputQueryKey, []);
    };

    return {
        files,
        addFiles,
        removeFiles,
        clearFiles,
    }



}
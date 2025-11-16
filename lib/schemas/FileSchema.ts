import * as z from 'zod';

const attachedFileSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number().positive().max(100*1024*1024),
    storageId: z.string(),
    url: z.string().optional(),
    uploadedAt: z.number().optional(),
})

export type AttachedFile = z.infer<typeof attachedFileSchema>;

export const AttachedFileArray = z.array(attachedFileSchema)
export type AttachedFileArray = z.infer<typeof AttachedFileArray>;
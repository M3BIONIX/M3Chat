import * as z from 'zod';

export const User = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    emailVerified: z.boolean(),
    profilePicture: z.string().nullable().optional(),
})

export type UserSchema = z.infer<typeof User>;

const createUser = z.object({
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string(),
})

export type CreateUserSchema = z.infer<typeof createUser>;

const loginSchema = z.object({
    email: z.string(),
    password: z.string(),
})

export type LoginSchema = z.infer<typeof loginSchema>;
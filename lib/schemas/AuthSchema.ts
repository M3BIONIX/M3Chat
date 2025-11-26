import * as z from 'zod';

const User = z.object({
    externalId: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailVerified: z.boolean(),
    profilePicture: z.optional(z.url()),
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
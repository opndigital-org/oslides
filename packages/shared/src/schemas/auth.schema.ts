import { z } from "zod";

export const signUpSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(128),
    displayName: z.string().trim().min(1).max(80),
});

export const signInSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
});

export const errorSchema = z.object({
    error: z.string(),
});

// public representation of an authenticated user
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    displayName: z.string().nullable(),
});

// responses

export const registerResponseSchema = z.object({
    user: userSchema.nullable(),
    requiresEmailConfirmation: z.boolean(),
});

export const loginResponseSchema = z.object({
    user: userSchema,
});

export const logoutResponseSchema = z.object({
    success: z.literal(true),
});

export const meResponseSchema = z.object({
    user: userSchema,
});

// inferred types
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PublicUser = z.infer<typeof userSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;

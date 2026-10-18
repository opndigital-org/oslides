
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { createSupabaseClient } from "../lib/supabase";
import { requireAuth, type AuthEnv } from "../middleware/auth";

const auth = new OpenAPIHono<AuthEnv>();

const signUpSchema = z.object({
    email: z.string().trim().email().max(254).openapi({
        example: "dev@finetype.org",
    }),
    password: z.string().min(8).max(128).openapi({
        example: "password123",
    }),
    displayName: z.string().trim().min(1).max(80).openapi({
        example: "dev",
    }),
});

const signInSchema = z.object({
    email: z.string().trim().email().max(254).openapi({
        example: "dev@finetype.org",
    }),
    password: z.string().min(1).max(128).openapi({
        example: "password123",
    }),
});

const errorSchema = z.object({
    error: z.string(),
});

const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    displayName: z.string().nullable(),
});

const sessionSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    token_type: z.string(),
    expires_in: z.number(),
    expires_at: z.number().optional(),
    user: z.unknown(),
}).passthrough();

const registerResponseSchema = z.object({
    user: z.unknown().nullable(),
    session: sessionSchema.nullable(),
    requiresEmailConfirmation: z.boolean(),
});

const loginResponseSchema = z.object({
    user: z.unknown(),
    session: sessionSchema,
});

const registerRoute = createRoute({
    method: "post",
    path: "/register",
    tags: ["Authentication"],
    summary: "Register a user",
    description: "Create an account using an email, password, and display name.",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: signUpSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Account created",
            content: {
                "application/json": {
                    schema: registerResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid input or registration failed",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

const loginRoute = createRoute({
    method: "post",
    path: "/login",
    tags: ["Authentication"],
    summary: "Log in",
    description: "Authenticate using email and password.",
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: signInSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Login successful",
            content: {
                "application/json": {
                    schema: loginResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        401: {
            description: "Invalid credentials",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

const logoutRoute = createRoute({
    method: "post",
    path: "/logout",
    tags: ["Authentication"],
    summary: "Log out",
    description: "Sign out the current authenticated session.",
    middleware: [requireAuth],
    security: [{ Bearer: [] }],
    responses: {
        200: {
            description: "Logout successful",
            content: {
                "application/json": {
                    schema: z.object({
                        success: z.literal(true),
                    }),
                },
            },
        },
        401: {
            description: "Authentication required or token invalid",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Logout failed",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

const meRoute = createRoute({
    method: "get",
    path: "/me",
    tags: ["Authentication"],
    summary: "Get current user",
    description: "Return basic information about the authenticated user.",
    middleware: [requireAuth],
    security: [{ Bearer: [] }],
    responses: {
        200: {
            description: "Current user",
            content: {
                "application/json": {
                    schema: z.object({
                        user: userSchema,
                    }),
                },
            },
        },
        401: {
            description: "Authentication required or token invalid",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

auth.openapi(registerRoute, async (c) => {
    const { email, password, displayName } = c.req.valid("json");
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
            },
        },
    });

    if (error) {
        return c.json({ error: error.message }, 400);
    }

    return c.json(
        {
            user: data.user,
            session: data.session,
            requiresEmailConfirmation: !data.session,
        },
        201,
    );
});

auth.openapi(loginRoute, async (c) => {
    const { email, password } = c.req.valid("json");
    const supabase = createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error || !data.session || !data.user) {
        return c.json({ error: "Invalid email or password." }, 401);
    }

    return c.json(
        {
            user: data.user,
            session: data.session,
        },
        200,
    );
});

auth.openapi(logoutRoute, async (c) => {
    const supabase = c.get("supabase");
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
        return c.json({ error: "Could not sign out." }, 500);
    }

    return c.json({ success: true }, 200);
});

auth.openapi(meRoute, async (c) => {
    const supabase = c.get("supabase");
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return c.json({ error: "Unauthenticated." }, 401);
    }

    return c.json(
        {
            user: {
                id: data.user.id,
                email: data.user.email ?? null,
                displayName: data.user.user_metadata?.display_name ?? null,
            },
        },
        200,
    );
});

export default auth;

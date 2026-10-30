
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

import type { AuthEnv } from "../env";

import {
    clearSessionCookie,
    createSessionId,
    encryptSecret,
    getAdminSupabase,
    hashSessionId,
    readSessionCookie,
    revokeSession,
    setSessionCookie,
    SESSION_ABSOLUTE_LIFETIME_MS,
} from "../lib/session";

import { createAuthClient } from "../lib/auth-client";
import { requireSession } from "../middleware/session-auth";

import {
    errorSchema,
    loginResponseSchema,
    logoutResponseSchema,
    meResponseSchema,
    registerResponseSchema,
    signInSchema,
    signUpSchema,
} from "@oslides/shared";

const auth = new OpenAPIHono<AuthEnv>();

function toPublicUser(user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
}) {
    const displayName = user.user_metadata?.display_name;

    return {
        id: user.id,
        email: user.email ?? null,
        displayName: typeof displayName === "string" ? displayName : null,
    };
}

async function createServerSession(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    env: AuthEnv["Bindings"],
) {
    const sessionId = createSessionId();
    const now = Date.now();
    const adminSupabase = getAdminSupabase(env);

    const { error } = await adminSupabase.from("app_sessions").insert({
        id_hash: hashSessionId(sessionId),
        user_id: userId,
        access_token_encrypted: encryptSecret(accessToken, env),
        refresh_token_encrypted: encryptSecret(refreshToken, env),
        access_token_expires_at: new Date(
            now + expiresIn * 1000,
        ).toISOString(),
        created_at: new Date(now).toISOString(),
        last_seen_at: new Date(now).toISOString(),
        absolute_expires_at: new Date(
            now + SESSION_ABSOLUTE_LIFETIME_MS,
        ).toISOString(),
    });

    if (error) {
        throw new Error("Unable to create a server session.");
    }

    return sessionId;
}

const registerRoute = createRoute({
    method: "post",
    path: "/register",
    tags: ["Authentication"],
    summary: "Register a user",
    request: {
        body: {
            required: true,
            content: {
                "application/json": { schema: signUpSchema },
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
                "application/json": { schema: errorSchema },
            },
        },
        500: {
            description: "Unable to start a session",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
    },
});

const loginRoute = createRoute({
    method: "post",
    path: "/login",
    tags: ["Authentication"],
    summary: "Log in",
    request: {
        body: {
            required: true,
            content: {
                "application/json": { schema: signInSchema },
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
                "application/json": { schema: errorSchema },
            },
        },
        401: {
            description: "Invalid credentials",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
        500: {
            description: "Unable to start a session",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
    },
});

const logoutRoute = createRoute({
    method: "post",
    path: "/logout",
    tags: ["Authentication"],
    summary: "Log out",
    middleware: [requireSession],
    security: [{ CookieAuth: [] }],
    responses: {
        200: {
            description: "Logout successful",
            content: {
                "application/json": { schema: logoutResponseSchema },
            },
        },
        401: {
            description: "Authentication required",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
        500: {
            description: "Logout failed",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
    },
});

const meRoute = createRoute({
    method: "get",
    path: "/me",
    tags: ["Authentication"],
    summary: "Get current user",
    middleware: [requireSession],
    security: [{ CookieAuth: [] }],
    responses: {
        200: {
            description: "Current user",
            content: {
                "application/json": {
                    schema: meResponseSchema,
                },
            },
        },
        401: {
            description: "Authentication required",
            content: {
                "application/json": { schema: errorSchema },
            },
        },
    },
});

auth.openapi(registerRoute, async (c) => {
    const { email, password, displayName } = c.req.valid("json");

    const { data, error } = await createAuthClient(c.env).auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
    });

    if (error || !data.user) {
        return c.json(
            { error: "Unable to create an account with those details." },
            400,
        );
    }

    if (!data.session) {
        return c.json(
            {
                user: toPublicUser(data.user),
                requiresEmailConfirmation: true,
            },
            201,
        );
    }

    try {
        const sessionId = await createServerSession(
            data.user.id,
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_in,
            c.env,
        );

        setSessionCookie(c, sessionId);

        return c.json(
            {
                user: toPublicUser(data.user),
                requiresEmailConfirmation: false,
            },
            201,
        );
    } catch {
        return c.json(
            { error: "Account created, please log in." },
            500,
        );
    }
});

auth.openapi(loginRoute, async (c) => {
    const { email, password } = c.req.valid("json");

    const { data, error } =
        await createAuthClient(c.env).auth.signInWithPassword({
            email,
            password,
        });

    if (error || !data.user || !data.session) {
        return c.json({ error: "Invalid email or password." }, 401);
    }

    try {
        const sessionId = await createServerSession(
            data.user.id,
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_in,
            c.env,
        );

        setSessionCookie(c, sessionId);

        return c.json({ user: toPublicUser(data.user) }, 200);
    } catch {
        return c.json(
            { error: "Unable to start a session. Please try again." },
            500,
        );
    }
});

auth.openapi(logoutRoute, async (c) => {
    const sessionId = readSessionCookie(c);

    if (!sessionId) {
        clearSessionCookie(c);
        return c.json({ error: "Authentication required." }, 401);
    }

    try {
        await revokeSession(sessionId, c.env);
        clearSessionCookie(c);

        return c.json({ success: true as const }, 200);
    } catch {
        return c.json(
            { error: "Could not sign out. Please try again." },
            500,
        );
    }
});

auth.openapi(meRoute, (c) => {
    return c.json({ user: toPublicUser(c.get("authUser")) }, 200);
});

export default auth;


import { createMiddleware } from "hono/factory";
import type { MiddlewareHandler } from "hono";
import { createSupabaseClient } from "../lib/supabase";

export type AuthVariables = {
    userId: string;
    supabase: ReturnType<typeof createSupabaseClient>;
};

export type AuthEnv = {
    Variables: AuthVariables;
};

export const requireAuth: MiddlewareHandler<AuthEnv> = createMiddleware<AuthEnv>(
    async (c, next) => {
        const authorization = c.req.header("Authorization");
        const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];

        if (!token) {
            return c.json(
                { error: "Authentication required." },
                401,
            );
        }

        const supabase = createSupabaseClient(token);
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return c.json(
                { error: "Invalid or expired access token." },
                401,
            );
        }

        c.set("userId", data.user.id);
        c.set("supabase", supabase);

        await next();
    },
);


import { createMiddleware } from "hono/factory";
import type { MiddlewareHandler } from "hono";

import type { AuthEnv } from "../env";
import type { StoredSession } from "../lib/session";

import {
    clearSessionCookie,
    decryptSecret,
    encryptSecret,
    findSession,
    getAdminSupabase,
    readSessionCookie,
    revokeSession,
} from "../lib/session";

import {
    createAuthClient,
    createUserClient,
} from "../lib/auth-client";

async function refreshSession(
    session: StoredSession,
    env: AuthEnv["Bindings"],
) {
    const refreshToken = decryptSecret(
        session.refresh_token_encrypted,
        env,
    );

    const { data, error } = await createAuthClient(env).auth.refreshSession({
        refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
        throw new Error("Session refresh failed.");
    }

    const accessToken = data.session.access_token;
    const nextRefreshToken = data.session.refresh_token;

    const expiresAt = new Date(
        data.session.expires_at
            ? data.session.expires_at * 1000
            : Date.now() + data.session.expires_in * 1000,
    ).toISOString();

    const adminSupabase = getAdminSupabase(env);

    const { data: updated, error: updateError } = await adminSupabase
        .from("app_sessions")
        .update({
            access_token_encrypted: encryptSecret(accessToken, env),
            refresh_token_encrypted: encryptSecret(nextRefreshToken, env),
            access_token_expires_at: expiresAt,
            last_seen_at: new Date().toISOString(),
        })
        .eq("id_hash", session.id_hash)
        .is("revoked_at", null)
        .select("id_hash")
        .maybeSingle();

    if (updateError || !updated) {
        throw new Error("Unable to update the refreshed session.");
    }

    return {
        accessToken,
        refreshToken: nextRefreshToken,
        expiresAt,
    };
}

export const requireSession: MiddlewareHandler<AuthEnv> =
    createMiddleware<AuthEnv>(async (c, next) => {
        const sessionId = readSessionCookie(c);

        if (!sessionId) {
            return c.json({ error: "Authentication required." }, 401);
        }

        try {
            const storedSession = await findSession(sessionId, c.env);

            if (!storedSession) {
                clearSessionCookie(c);

                return c.json(
                    { error: "Session expired or revoked." },
                    401,
                );
            }

            let accessToken = decryptSecret(
                storedSession.access_token_encrypted,
                c.env,
            );

            const expiresAt = new Date(
                storedSession.access_token_expires_at,
            ).getTime();

            if (expiresAt <= Date.now() + 60_000) {
                const refreshed = await refreshSession(
                    storedSession,
                    c.env,
                );

                accessToken = refreshed.accessToken;

                storedSession.access_token_encrypted =
                    encryptSecret(refreshed.accessToken, c.env);

                storedSession.refresh_token_encrypted =
                    encryptSecret(refreshed.refreshToken, c.env);

                storedSession.access_token_expires_at =
                    refreshed.expiresAt;
            }

            const { data, error } = await createAuthClient(c.env).auth.getUser(
                accessToken,
            );

            if (error || !data.user) {
                await revokeSession(sessionId, c.env);
                clearSessionCookie(c);

                return c.json({ error: "Invalid session." }, 401);
            }

            c.set("userId", data.user.id);

            c.set("authUser", {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata ?? {},
            });

            c.set("supabase", createUserClient(c.env, accessToken));
            c.set("sessionId", sessionId);
            c.set("storedSession", storedSession);

            await next();
        } catch {
            // Don't delete a session on a transient network or database error.
            return c.json(
                { error: "Unable to validate session. Please retry." },
                503,
            );
        }
    });

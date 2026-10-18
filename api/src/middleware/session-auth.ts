
import { createMiddleware } from "hono/factory";
import type { MiddlewareHandler } from "hono";

import { type StoredSession } from "../lib/session";
import {
    adminSupabase,
    clearSessionCookie,
    decryptSecret,
    encryptSecret,
    findSession,
    readSessionCookie,
    revokeSession,
} from "../lib/session";
import { createAuthClient, createUserClient } from "../lib/auth-client";

export type AuthEnv = {
    Variables: {
        userId: string;
        supabase: ReturnType<typeof createUserClient>;
        authUser: {
            id: string;
            email?: string;
            user_metadata: Record<string, unknown>;
        };
        sessionId: string;
        storedSession: StoredSession;
    };
};

const refreshes = new Map<string, Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}>>();

async function refreshSession(session: StoredSession) {
    const existing = refreshes.get(session.id_hash);

    if (existing) {
        return existing;
    }

    const task = (async () => {
        const refreshToken = decryptSecret(
            session.refresh_token_encrypted,
        );

        const { data, error } = await createAuthClient().auth.refreshSession({
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

        const { data: updated, error: updateError } = await adminSupabase
            .from("app_sessions")
            .update({
                access_token_encrypted: encryptSecret(accessToken),
                refresh_token_encrypted: encryptSecret(nextRefreshToken),
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
    })();

    refreshes.set(session.id_hash, task);

    try {
        return await task;
    } finally {
        refreshes.delete(session.id_hash);
    }
}

export const requireSession: MiddlewareHandler<AuthEnv> =
    createMiddleware<AuthEnv>(async (c, next) => {
        const sessionId = readSessionCookie(c);

        if (!sessionId) {
            return c.json({ error: "Authentication required." }, 401);
        }

        try {
            const storedSession = await findSession(sessionId);

            if (!storedSession) {
                clearSessionCookie(c);
                return c.json(
                    { error: "Session expired or revoked." },
                    401,
                );
            }

            let accessToken = decryptSecret(
                storedSession.access_token_encrypted,
            );

            const expiresAt = new Date(
                storedSession.access_token_expires_at,
            ).getTime();

            if (expiresAt <= Date.now() + 60_000) {
                const refreshed = await refreshSession(storedSession);
                accessToken = refreshed.accessToken;

                storedSession.access_token_encrypted =
                    encryptSecret(refreshed.accessToken);
                storedSession.refresh_token_encrypted =
                    encryptSecret(refreshed.refreshToken);
                storedSession.access_token_expires_at =
                    refreshed.expiresAt;
            }

            const { data, error } = await createAuthClient().auth.getUser(
                accessToken,
            );

            if (error || !data.user) {
                await revokeSession(sessionId);
                clearSessionCookie(c);

                return c.json({ error: "Invalid session." }, 401);
            }

            c.set("userId", data.user.id);
            c.set("authUser", {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata ?? {},
            });
            c.set("supabase", createUserClient(accessToken));
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

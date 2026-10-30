
import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
} from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createClient } from "@supabase/supabase-js";
import type { Bindings } from "../env";

export const COOKIE_NAME = "oslides_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_ABSOLUTE_LIFETIME_MS =
    SESSION_MAX_AGE_SECONDS * 1000;

export type StoredSession = {
    id_hash: string;
    user_id: string;
    access_token_encrypted: string;
    refresh_token_encrypted: string;
    access_token_expires_at: string;
    created_at: string;
    last_seen_at: string;
    absolute_expires_at: string;
    revoked_at: string | null;
};

export function getAdminSupabase(env: Bindings) {
    console.log("Admin Supabase config check:", {
        hasUrl: Boolean(env.SUPABASE_URL),
        url: env.SUPABASE_URL,
        hasServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
        serviceRoleKeyLength: env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0,
    });

    if (!env.SUPABASE_URL) {
        throw new Error("SUPABASE_URL is missing from Worker environment.");
    }

    if (!env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing from Worker environment.");
    }

    try {
        return createClient(
            env.SUPABASE_URL,
            env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false,
                },
            },
        );
    } catch (error) {
        console.error("Admin Supabase client initialization error:", error);
        throw error;
    }
}

function getEncryptionKey(env: Bindings): Buffer {
    const key = env.SESSION_ENCRYPTION_KEY;

    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
        throw new Error(
            "SESSION_ENCRYPTION_KEY must be 32 bytes encoded as hex.",
        );
    }

    return Buffer.from(key, "hex");
}

export function hashSessionId(sessionId: string) {
    return createHash("sha256").update(sessionId).digest("hex");
}

export function createSessionId() {
    return randomBytes(32).toString("base64url");
}

export function encryptSecret(value: string, env: Bindings) {
    const key = getEncryptionKey(env);
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    const ciphertext = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Keep the existing stored format: iv.tag.ciphertext
    return [
        iv.toString("base64url"),
        tag.toString("base64url"),
        ciphertext.toString("base64url"),
    ].join(".");
}

export function decryptSecret(value: string, env: Bindings) {
    const key = getEncryptionKey(env);
    const [ivText, tagText, ciphertextText] = value.split(".");

    if (!ivText || !tagText || !ciphertextText) {
        throw new Error("Invalid encrypted session secret.");
    }

    const decipher = createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(ivText, "base64url"),
    );

    decipher.setAuthTag(Buffer.from(tagText, "base64url"));

    return Buffer.concat([
        decipher.update(Buffer.from(ciphertextText, "base64url")),
        decipher.final(),
    ]).toString("utf8");
}

export function setSessionCookie<E extends { Bindings: Bindings }>(
    c: Context<E>,
    sessionId: string,
) {
    setCookie(c, COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: c.env.COOKIE_SECURE === "true",
        sameSite: "Lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export function clearSessionCookie<E extends { Bindings: Bindings }>(
    c: Context<E>,
) {
    deleteCookie(c, COOKIE_NAME, {
        httpOnly: true,
        secure: c.env.COOKIE_SECURE === "true",
        sameSite: "Lax",
        path: "/",
    });
}

export function readSessionCookie<E extends { Bindings: Bindings }>(
    c: Context<E>,
) {
    return getCookie(c, COOKIE_NAME);
}

export async function findSession(
    sessionId: string,
    env: Bindings,
) {
    const adminSupabase = getAdminSupabase(env);

    const { data, error } = await adminSupabase
        .from("app_sessions")
        .select("*")
        .eq("id_hash", hashSessionId(sessionId))
        .is("revoked_at", null)
        .gt("absolute_expires_at", new Date().toISOString())
        .maybeSingle();

    if (error) {
        throw new Error("Unable to retrieve the session.");
    }

    return data as StoredSession | null;
}

export async function revokeSession(
    sessionId: string,
    env: Bindings,
) {
    const adminSupabase = getAdminSupabase(env);

    const { error } = await adminSupabase
        .from("app_sessions")
        .delete()
        .eq("id_hash", hashSessionId(sessionId));

    if (error) {
        throw new Error("Unable to revoke the session.");
    }
}

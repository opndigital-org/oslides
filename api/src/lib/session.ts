
import {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
} from "node:crypto";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const encryptionKeyHex = process.env.SESSION_ENCRYPTION_KEY;

if (!supabaseUrl || !serviceRoleKey || !encryptionKeyHex) {
    throw new Error("Missing server-side session environment variables.");
}

if (!/^[0-9a-fA-F]{64}$/.test(encryptionKeyHex)) {
    throw new Error("SESSION_ENCRYPTION_KEY must be 32 bytes encoded as hex.");
}

const encryptionKey = Buffer.from(encryptionKeyHex, "hex");

export const COOKIE_NAME = "oslides_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
export const SESSION_ABSOLUTE_LIFETIME_MS =
    SESSION_MAX_AGE_SECONDS * 1000;

const secureCookie = process.env.COOKIE_SECURE === "true";

export const adminSupabase = createClient(
    supabaseUrl,
    serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    },
);

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

export function hashSessionId(sessionId: string) {
    return createHash("sha256")
        .update(sessionId)
        .digest("hex");
}

export function createSessionId() {
    return randomBytes(32).toString("base64url");
}

export function encryptSecret(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

    const ciphertext = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return [
        iv.toString("base64url"),
        tag.toString("base64url"),
        ciphertext.toString("base64url"),
    ].join(".");
}

export function decryptSecret(value: string) {
    const [ivText, tagText, ciphertextText] = value.split(".");

    if (!ivText || !tagText || !ciphertextText) {
        throw new Error("Invalid encrypted session secret.");
    }

    const decipher = createDecipheriv(
        "aes-256-gcm",
        encryptionKey,
        Buffer.from(ivText, "base64url"),
    );

    decipher.setAuthTag(Buffer.from(tagText, "base64url"));

    return Buffer.concat([
        decipher.update(Buffer.from(ciphertextText, "base64url")),
        decipher.final(),
    ]).toString("utf8");
}

export function setSessionCookie(c: Context, sessionId: string) {
    setCookie(c, COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "Lax",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });
}

export function clearSessionCookie(c: Context) {
    deleteCookie(c, COOKIE_NAME, {
        httpOnly: true,
        secure: secureCookie,
        sameSite: "Lax",
        path: "/",
    });
}

export function readSessionCookie(c: Context) {
    return getCookie(c, COOKIE_NAME);
}

export async function findSession(sessionId: string) {
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

export async function revokeSession(sessionId: string) {
    const { error } = await adminSupabase
        .from("app_sessions")
        .delete()
        .eq("id_hash", hashSessionId(sessionId));

    if (error) {
        throw new Error("Unable to revoke the session.");
    }
}

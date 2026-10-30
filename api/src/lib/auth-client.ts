
import { createClient } from "@supabase/supabase-js";
import type { Bindings } from "../env";

const authOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
};

export function createAuthClient(env: Bindings) {
    return createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        authOptions,
    );
}

export function createUserClient(
    env: Bindings,
    accessToken: string,
) {
    return createClient(
        env.SUPABASE_URL,
        env.SUPABASE_ANON_KEY,
        {
            ...authOptions,
            global: {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        },
    );
}
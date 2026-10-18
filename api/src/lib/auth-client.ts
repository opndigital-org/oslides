import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabaseKey = requireEnv("SUPABASE_ANON_KEY");

const authOptions = {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
    },
};

export function createAuthClient() {
    return createClient(supabaseUrl, supabaseKey, authOptions);
}

export function createUserClient(accessToken: string) {
    return createClient(supabaseUrl, supabaseKey, {
        ...authOptions,
        global: {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    });
}
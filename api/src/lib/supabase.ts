
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

export function createSupabaseClient(accessToken?: string) {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
        ...(accessToken
            ? {
                  global: {
                      headers: {
                          Authorization: `Bearer ${accessToken}`,
                      },
                  },
              }
            : {}),
    });
}

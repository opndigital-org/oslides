
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
}

export function createSupabaseClient(accessToken?: string) {
    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
        global: accessToken
            ? {
                  headers: {
                      Authorization: `Bearer ${accessToken}`,
                  },
              }
            : undefined,
    });
}

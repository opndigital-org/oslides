
export type Bindings = {
    APP_URL: string;
    API_URL: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    SESSION_ENCRYPTION_KEY: string;
    COOKIE_SECURE: string;
};

export type AuthEnv = {
    Bindings: Bindings;
    Variables: {
        userId: string;
        supabase: import("@supabase/supabase-js").SupabaseClient;
        authUser: {
            id: string;
            email?: string;
            user_metadata: Record<string, unknown>;
        };
        sessionId: string;
        storedSession: import("./lib/session").StoredSession;
    };
};

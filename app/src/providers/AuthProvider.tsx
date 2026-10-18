
import {
    createContext,
    useCallback,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { api } from "@/lib/api/client";

export type AuthUser = {
    id: string;
    email: string | null;
    displayName: string | null;
};

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (
        email: string,
        password: string,
        displayName: string,
    ) => Promise<{ requiresEmailConfirmation: boolean }>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "oslides_access_token";

function saveToken(token: string) {
    sessionStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
}

function getErrorMessage(error: unknown): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "error" in error &&
        typeof error.error === "string"
    ) {
        return error.error;
    }

    return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const restoreSession = useCallback(async () => {
        if (!sessionStorage.getItem(TOKEN_KEY)) {
            setLoading(false);
            return;
        }

        try {
            const { data, response } = await api.GET("/api/auth/me");

            if (!response.ok || !data) {
                clearToken();
                setUser(null);
                return;
            }

            setUser(data.user);
        } catch {
            clearToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void restoreSession();
    }, [restoreSession]);

    const login = useCallback(async (email: string, password: string) => {
        const { data, error, response } = await api.POST(
            "/api/auth/login",
            {
                body: { email, password },
            },
        );

        if (!response.ok || error || !data) {
            throw new Error(getErrorMessage(error));
        }

        saveToken(data.session.access_token);

        try {
            const { data: meData, response: meResponse } =
                await api.GET("/api/auth/me");

            if (!meResponse.ok || !meData) {
                clearToken();
                throw new Error("Unable to load your account.");
            }

            setUser(meData.user);
        } catch (error) {
            clearToken();
            setUser(null);
            throw error;
        }
    }, []);

    const register = useCallback(
        async (
            email: string,
            password: string,
            displayName: string,
        ) => {
            const { data, error, response } = await api.POST(
                "/api/auth/register",
                {
                    body: { email, password, displayName },
                },
            );

            if (!response.ok || error || !data) {
                throw new Error(getErrorMessage(error));
            }

            if (data.session?.access_token) {
                saveToken(data.session.access_token);

                try {
                    const { data: meData, response: meResponse } =
                        await api.GET("/api/auth/me");

                    if (!meResponse.ok || !meData) {
                        clearToken();
                        throw new Error("Account created, but unable to load your session.");
                    }

                    setUser(meData.user);
                } catch (error) {
                    clearToken();
                    setUser(null);
                    throw error;
                }
            }

            return {
                requiresEmailConfirmation: data.requiresEmailConfirmation,
            };
        },
        [],
    );

    const logout = useCallback(async () => {
        try {
            if (sessionStorage.getItem(TOKEN_KEY)) {
                const { response } = await api.POST("/api/auth/logout");

                if (!response.ok) {
                    throw new Error("The server could not complete logout.");
                }
            }
        } finally {
            clearToken();
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

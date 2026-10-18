
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
    refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
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

    const refreshUser = useCallback(async () => {
        try {
            const { data, response, error } = await api.GET("/api/auth/me");

            if (!response.ok || error || !data) {
                setUser(null);
                return;
            }

            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    const login = useCallback(async (email: string, password: string) => {
        const { data, error, response } = await api.POST("/api/auth/login", {
            body: { email, password },
        });

        if (!response.ok || error || !data) {
            throw new Error(getErrorMessage(error));
        }

        setUser(data.user);
    }, []);

    const register = useCallback(
        async (email: string, password: string, displayName: string) => {
            const { data, error, response } = await api.POST(
                "/api/auth/register",
                {
                    body: { email, password, displayName },
                },
            );

            if (!response.ok || error || !data) {
                throw new Error(getErrorMessage(error));
            }

            if (!data.requiresEmailConfirmation && data.user) {
                setUser(data.user);
            }

            return {
                requiresEmailConfirmation: data.requiresEmailConfirmation,
            };
        },
        [],
    );

    const logout = useCallback(async () => {
        const { error, response } = await api.POST("/api/auth/logout");

        if (!response.ok || error) {
            throw new Error(getErrorMessage(error));
        }

        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

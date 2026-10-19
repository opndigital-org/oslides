
import {
    createRootRoute,
    HeadContent,
    Outlet,
    useNavigate,
} from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { createPageHead } from "@/lib/seo";

export const Route = createRootRoute({
    head: () => createPageHead(),
    component: RootLayout,
});

function RootLayout() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await logout();
            await navigate({ to: "/login" });
        } catch (error) {
            console.error("Failed to log out:", error);
        }
    };

    return (
        <>
            <HeadContent />

            <div className="min-h-screen bg-[#0d1117] text-slate-100">
                <Navbar
                    isAuthenticated={Boolean(user)}
                    onSignOut={handleSignOut}
                />

                {loading ? (
                    <div className="flex min-h-[50vh] items-center justify-center">
                        <p className="text-slate-400">Loading...</p>
                    </div>
                ) : (
                    <Outlet />
                )}
            </div>
        </>
    );
}

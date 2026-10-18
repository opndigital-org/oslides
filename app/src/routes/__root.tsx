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
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <HeadContent />
            <div className="min-h-screen bg-[#0d1117] text-slate-100">
                <Navbar
                    isAuthenticated={Boolean(user)}
                    onSignOut={async () => {
                        await logout();
                        await navigate({ to: "/login" });
                    }}
                />

                <Outlet />
            </div>
        </>
    );
}

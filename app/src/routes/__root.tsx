
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router";

function RootLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
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
    );
}

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "oSlides" },
            {
                name: "description",
                content: "Markdown-native slides integrated with in slide live coding",
            },
            { name: "theme-color", content: "#05C0D9" },
            { property: "og:type", content: "website" },
            { property: "og:title", content: "oSlides" },
            {
                property: "og:description",
                content: "Markdown-native slides integrated with in slide live coding.",
            },
        ],
        links: [
            {
                rel: "icon",
                href: "/favicon.svg",
                type: "image/svg+xml",
            },
        ],
    }),
    component: RootLayout,
});

import { Navbar } from "@/components/Navbar";
import { createRootRoute, Outlet } from "@tanstack/react-router";

function RootLayout() {
    return (
        <div className="min-h-screen bg-[#0d1117] text-slate-100">
            <Navbar
                isAuthenticated={false}
                onOpenDecks={() => { }}
                onOpenSettings={() => { }}
                onSignIn={() => { }}
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
            { name: "theme-color", content: "#2563eb" },
            { property: "og:type", content: "website" },
            { property: "og:title", content: "oSlides" },
            {
                property: "og:description",
                content: "Markdown-native slides integrated with in slide live coding.",
            },
            // {
            //     property: "og:image",
            //     content: "https://oslides.finetype.org/og-image.png",
            // },
            // { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            {
                rel: "icon",
                href: "/favicon.svg",
                type: "image/svg+xml",
            },
            { rel: "icon", href: "/favicon.ico", sizes: "any" },
            { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        ],
    }),
    component: RootLayout,
});
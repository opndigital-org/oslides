import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { AuthProvider } from "@/providers/AuthProvider";
import { useAuth } from "@/hooks/useAuth";
import { router } from "@/router";
import "./index.css";

function AppRouter() {
    const auth = useAuth();

    return <RouterProvider router={router} context={{ auth }} />;
}

const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
    <StrictMode>
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    </StrictMode>,
);

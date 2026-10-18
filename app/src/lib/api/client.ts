
import createClient from "openapi-fetch";
import type { paths } from "@/lib/api/schema";

export const api = createClient<paths>({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8600",
    credentials: "include",
});

api.use({
    onRequest({ request }) {
        const method = request.method.toUpperCase();

        if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
            request.headers.set("X-CSRF-Protection", "1");
        }

        return request;
    },
});

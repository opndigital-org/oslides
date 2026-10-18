import createClient from "openapi-fetch";
import type { paths } from "@/lib/api/schema";

export const api = createClient<paths>({
    baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:8600",
});

api.use({
    async onRequest({ request }) {
        const token = sessionStorage.getItem("oslides_access_token");

        if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
        }

        return request;
    },
});
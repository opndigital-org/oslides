
import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import auth from "./routes/auth";
import decks from "./routes/decks";


const app = new OpenAPIHono();

const port = Number(process.env.PORT ?? 8600);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
    "/api/*",
    cors({
        origin: frontendUrl,
        credentials: true,
        allowMethods: [
            "GET",
            "POST",
            "PATCH",
            "PUT",
            "DELETE",
            "OPTIONS",
        ],
        allowHeaders: ["Content-Type", "X-CSRF-Protection"],
    }),
);

app.use("/api/*", async (c, next) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(c.req.method)) {
        const origin = c.req.header("Origin");

        if (origin !== frontendUrl) {
            return c.json({ error: "Untrusted request origin." }, 403);
        }

        // prevents cross-origin HTML forms from submit requests
        if (c.req.header("X-CSRF-Protection") !== "1") {
            return c.json({ error: "CSRF validation failed." }, 403);
        }
    }

    await next();
});

app.get("/health", (c) =>
    c.json({ status: "ok", service: "oslides-api" }),
);


app.route("/api/auth", auth);
app.route("/api/decks", decks);


app.openAPIRegistry.registerComponent("securitySchemes", "CookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "oslides_session",
});

app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: {
        title: "oSlides API",
        version: "0.1.0",
        description: "API for the oSlides presentation platform.",
    },
    servers: [
        {
            url: `http://localhost:${port}`,
            description: "Local development",
        },
    ],
});

app.get(
    "/docs",
    Scalar({
        url: "/openapi.json",
        pageTitle: "oSlides API",
    }),
);

serve({ fetch: app.fetch, port });

console.log(`oSlides API running at http://localhost:${port}`);

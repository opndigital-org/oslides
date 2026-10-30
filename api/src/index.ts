import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import auth from "./routes/auth";
import decks from "./routes/decks";

type Bindings = {
    APP_URL: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.use(
    "/api/*",
    cors({
        origin: (origin, c) => {
            return origin === c.env.APP_URL ? origin : "";
        },
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

        if (origin !== c.env.APP_URL) {
            return c.json({ error: "Untrusted request origin." }, 403);
        }

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
            url: "/",
            description: "Current API server",
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

export default app;
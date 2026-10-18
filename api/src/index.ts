import "dotenv/config";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";

import auth from "./routes/auth";
// import decks from "./routes/decks";
// import profiles from "./routes/profiles";

const app = new OpenAPIHono();

const port = Number(process.env.PORT ?? 8600);
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
    "/api/*",
    cors({
        origin: frontendUrl,
        allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Authorization", "Content-Type"],
    }),
);

app.get("/health", (c) => {
    return c.json({
        status: "ok",
        service: "oslides-api",
    });
});

app.route("/api/auth", auth);
// app.route("/api/decks", decks);
// app.route("/api/profiles", profiles);

app.openAPIRegistry.registerComponent(
    "securitySchemes",
    "Bearer",
    {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
    },
);

app.doc31("/openapi.json", {
    info: {
        title: "oSlide API",
        version: "0.1.0",
        description: "API for the oSlide presentation platform.",
    },
    openapi: "3.1.0",
    servers: [
        {
            url: `http://localhost:${port}`,
            description: "Local development server",
        },
    ],
});

app.get(
    "/docs",
    Scalar({
        url: "/openapi.json",
        pageTitle: "OSlide API Documentation",
    }),
);

serve({
    fetch: app.fetch,
    port,
});

console.log(`OSlide API running at http://localhost:${port}`);
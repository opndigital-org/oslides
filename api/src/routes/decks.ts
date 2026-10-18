import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import {
    createDeckResponseSchema,
    createDeckSchema,
    deleteDeckResponseSchema,
    errorSchema,
    getDeckResponseSchema,
    updateDeckResponseSchema,
    updateDeckSchema,
} from "@oslides/shared";

import { requireSession } from "../middleware/session-auth";

import type { AuthEnv } from "../middleware/session-auth";

const decks = new OpenAPIHono<AuthEnv>();

decks.use("*", requireSession);

const deckIdParamsSchema = z.object({
    id: z.string().uuid(),
});

const getDeckRoute = createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Decks"],
    summary: "Get a Deck by id",
    request: {
        params: z.object({
            id: z.string().uuid(),
        }),
    },
    responses: {
        200: {
            description: "Deck retrieved",
            content: {
                "application/json": {
                    schema: getDeckResponseSchema,
                },
            },
        },
        404: {
            description: "Deck not found",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Failed to retrieve deck",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

decks.openapi(getDeckRoute, async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.get("userId");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("decks")
        .select("id, title, markdown_content, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Failed to retrieve deck:", error);
        return c.json({ error: "Failed to retrieve deck" }, 500);
    }

    if (!data) {
        return c.json({ error: "Deck not found" }, 404);
    }

    return c.json({
        deck: {
            id: data.id,
            title: data.title,
            markdownContent: data.markdown_content,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        },
    }, 200);
});

const createDeckRoute = createRoute({
    method: "post",
    path: "/",
    tags: ["Decks"],
    summary: "Create a new Deck",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createDeckSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: "Deck created",
            content: {
                "application/json": {
                    schema: createDeckResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Failed to create deck",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

decks.openapi(createDeckRoute, async (c) => {
    const { title, markdown } = c.req.valid("json");
    const userId = c.get("userId");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("decks")
        .insert({
            user_id: userId,
            title,
            markdown_content: markdown,
        })
        .select("id, title, markdown_content, created_at, updated_at")
        .single();

    if (error) {
        console.error("Failed to create deck:", error);
        return c.json({ error: "Failed to create deck" }, 500);
    }

    return c.json({
        deck: {
            id: data.id,
            title: data.title,
            markdownContent: data.markdown_content,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        },
    }, 201);
});

const updateDeckRoute = createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Decks"],
    summary: "Update a Deck",
    request: {
        params: deckIdParamsSchema,
        body: {
            content: {
                "application/json": {
                    schema: updateDeckSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: "Deck updated",
            content: {
                "application/json": {
                    schema: updateDeckResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid request",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        404: {
            description: "Deck not found",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Failed to update deck",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

decks.openapi(updateDeckRoute, async (c) => {
    const { id } = c.req.valid("param");
    const input = c.req.valid("json");
    const userId = c.get("userId");
    const supabase = c.get("supabase");

    const updates: {
        title?: string;
        markdown_content?: string;
        updated_at: string;
    } = {
        updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) {
        updates.title = input.title;
    }

    if (input.markdown !== undefined) {
        updates.markdown_content = input.markdown;
    }

    const { data, error } = await supabase
        .from("decks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select("id, title, markdown_content, updated_at")
        .maybeSingle();

    if (error) {
        console.error("Failed to update deck:", error);
        return c.json({ error: "Failed to update deck" }, 500);
    }

    if (!data) {
        return c.json({ error: "Deck not found" }, 404);
    }

    return c.json(
        {
            deck: {
                id: data.id,
                title: data.title,
                markdownContent: data.markdown_content,
                updatedAt: data.updated_at,
            },
        },
        200,
    );
});

const deleteDeckRoute = createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Decks"],
    summary: "Delete a Deck",
    request: {
        params: deckIdParamsSchema,
    },
    responses: {
        200: {
            description: "Deck deleted",
            content: {
                "application/json": {
                    schema: deleteDeckResponseSchema,
                },
            },
        },
        400: {
            description: "Invalid deck ID",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        404: {
            description: "Deck not found",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
        500: {
            description: "Failed to delete deck",
            content: {
                "application/json": {
                    schema: errorSchema,
                },
            },
        },
    },
});

decks.openapi(deleteDeckRoute, async (c) => {
    const { id } = c.req.valid("param");
    const userId = c.get("userId");
    const supabase = c.get("supabase");

    const { data, error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

    if (error) {
        console.error("Failed to delete deck:", error);
        return c.json({ error: "Failed to delete deck" }, 500);
    }

    if (!data) {
        return c.json({ error: "Deck not found" }, 404);
    }

    return c.json(
        {
            message: "Deck deleted successfully",
            id: data.id,
        },
        200,
    );
});

export default decks;
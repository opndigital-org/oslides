import { z } from "zod";


export const getDeckResponseSchema = z.object({
    deck: z.object({
        id: z.string().uuid(),
        title: z.string(),
        markdownContent: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
});

export const createDeckSchema = z.object({
    title: z.string().trim().min(1).max(200).default("Untitled"),
    markdown: z.string().max(1_000_000).default(""),
});

export const createDeckResponseSchema = z.object({
    deck: z.object({
        id: z.string().uuid(),
        title: z.string(),
        markdownContent: z.string(),
        createdAt: z.string(),
        updatedAt: z.string(),
    }),
});

export const updateDeckSchema = z
    .object({
        title: z.string().trim().min(1).max(200).optional(),
        markdown: z.string().max(1_000_000).optional(),
    })
    .refine(
        (data) => data.title !== undefined || data.markdown !== undefined,
        { message: "Provide a title or Markdown content to update." },
    );

export const updateDeckResponseSchema = z.object({
    deck: z.object({
        id: z.string().uuid(),
        title: z.string(),
        markdownContent: z.string(),
        updatedAt: z.string(),
    }),
});

export const deleteDeckResponseSchema = z.object({
    message: z.string(),
    id: z.string().uuid(),
});


export type GetDeckResponse = z.infer<typeof getDeckResponseSchema>;

export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type CreateDeckResponse = z.infer<typeof createDeckResponseSchema>;

export type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
export type UpdateDeckResponse = z.infer<typeof updateDeckResponseSchema>;

export type DeleteDeckResponse = z.infer<typeof deleteDeckResponseSchema>;
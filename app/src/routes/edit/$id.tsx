import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { api } from "@/lib/api/client";
import { EditorPage } from "@/components/editor/EditorPage";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/edit/$id")({
    loader: async ({ params }) => {
        const { data, error } = await api.GET("/api/decks/{id}", {
            params: {
                path: {
                    id: params.id,
                },
            },
        });

        if (error || !data) {
            throw new Error("Could not load the presentation.");
        }

        return {
            deck: data.deck,
        };
    },

    head: ({ loaderData }) =>
        createPageHead({
            title: `${loaderData?.deck.title ?? "Edit Presentation"} | oSlides`,
            description: loaderData?.deck.title
                ? `Edit your slides: ${loaderData.deck.title}.`
                : "Edit your Markdown slides in oSlides.",
        }),

    component: EditPage,
});

function EditPage() {
    const { id } = Route.useParams();
    const { deck } = Route.useLoaderData();

    return (
        <>
            <HeadContent />
            <EditorPage
                mode="edit"
                id={id}
                initialDeck={{
                    title: deck.title,
                    markdownContent: deck.markdownContent,
                }}
            />
        </>
    );
}
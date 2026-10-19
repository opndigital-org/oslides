
import { createFileRoute, HeadContent } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor/EditorPage";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/new")({
    head: () =>
        createPageHead({
            title: "New Deck | oSlides",
            description: "Create a new Markdown-powered slide deck with oSlides.",
        }),
    component: NewPage,
});

function NewPage() {
    return (
        <>
            <HeadContent />
            <EditorPage mode="new" />
        </>
    )
}

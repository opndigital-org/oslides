
import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor/EditorPage";

export const Route = createFileRoute("/new")({
    component: NewPage,
});

function NewPage() {
    return <EditorPage mode="new" />;
}

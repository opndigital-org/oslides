
import { createFileRoute } from "@tanstack/react-router";
import { EditorPage } from "@/components/editor/EditorPage";

export const Route = createFileRoute("/edit/$id")({
    component: EditPage,
});

function EditPage() {
    const { id } = Route.useParams();

    return <EditorPage mode="edit" id={id} />;
}

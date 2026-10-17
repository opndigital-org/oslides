import { CodeCard } from "@/components/presentation/CodeCard";
import { LiveCodeEditor } from "@/components/editor/LiveCodeEditor";
import type { MarkdownNode } from "./types";

type Props = {
    node: MarkdownNode;
};

function getMetaValue(meta: string, name: string): string | undefined {
    const match = meta.match(
        new RegExp(`\\b${name}=(?:"([^"]+)"|'([^']+)'|(\\S+))`),
    );

    return match?.[1] ?? match?.[2] ?? match?.[3];
}

export function MarkdownCodeBlock({ node }: Props) {
    const meta = node.meta ?? "";
    const code = node.value ?? "";
    const language = node.lang || "plaintext";
    const isLive = /\blive\b/.test(meta);

    if (isLive && node.lang === "python") {
        return (
            <LiveCodeEditor
                code={code}
                id={getMetaValue(meta, "id")}
                filename={getMetaValue(meta, "filename") ?? "main.py"}
            />
        );
    }

    return (
        <div className="my-5 min-w-0">
            <CodeCard
                code={code}
                language={language}
                title={node.lang || "Code example"}
            />
        </div>
    );
}
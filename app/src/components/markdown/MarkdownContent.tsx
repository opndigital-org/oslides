import type { SlideData } from "@/lib/markdown/parsePresentation";

import { MarkdownNodeRenderer } from "@/components/markdown/MarkdownNodeRenderer";
import type { MarkdownNode } from "@/components/markdown/types";

type Props = {
    nodes: SlideData["nodes"];
};

export function MarkdownContent({ nodes }: Props) {
    const markdownNodes = nodes as unknown as MarkdownNode[];

    if (!Array.isArray(markdownNodes) || markdownNodes.length === 0) {
        return null;
    }

    return (
        <div className="w-full min-w-0 text-base leading-relaxed text-slate-200">
            {markdownNodes.map((node, index) => (
                <MarkdownNodeRenderer
                    key={`md-${index}`}
                    node={node}
                    keyPrefix={`md-${index}`}
                />
            ))}
        </div>
    );
}
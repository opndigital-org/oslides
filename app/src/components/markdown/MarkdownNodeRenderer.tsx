import { Fragment, type ReactNode } from "react";

import type { MarkdownNode } from "@/components/markdown/types";

import { MarkdownHeading } from "@/components/markdown/MarkdownHeading";
import { MarkdownCodeBlock } from "@/components/markdown/MarkdownCodeBlock";
import { MarkdownImage } from "@/components/markdown/MarkdownImage";
import { MarkdownLink } from "@/components/markdown/MarkdownLink";
import { MarkdownList, MarkdownListItem } from "@/components/markdown/MarkdownList";
import { MarkdownSpacing } from "@/components/markdown/MarkdownSpacing";
import { MarkdownTable, MarkdownTableCell, MarkdownTableHeader, MarkdownTableRow } from "@/components/markdown/MarkdownTable";

type Props = {
    node: MarkdownNode;
    keyPrefix: string;
};

function renderChildren(
    nodes: MarkdownNode[] | undefined,
    keyPrefix: string,
): ReactNode[] {
    return (nodes ?? []).map((child, index) => {
        const childKey = `${keyPrefix}-${index}`;

        return (
            <Fragment key={childKey}>
                <MarkdownNodeRenderer
                    node={child}
                    keyPrefix={childKey}
                />
            </Fragment>
        );
    });
}

export function MarkdownNodeRenderer({ node, keyPrefix }: Props) {
    const children = renderChildren(node.children, keyPrefix);

    switch (node.type) {
        case "text":
            return node.value ?? "";

        case "paragraph":
            return (
                <p className="mb-4 max-w-none text-2xl leading-relaxed text-slate-200 last:mb-0">
                    {children}
                </p>
            );

        case "heading":
            return (
                <MarkdownHeading depth={node.depth}>
                    {children}
                </MarkdownHeading>
            );

        case "strong":
            return (
                <strong className="font-semibold text-white">
                    {children}
                </strong>
            );

        case "emphasis":
            return (
                <em className="italic text-slate-200">
                    {children}
                </em>
            );

        case "delete":
            return (
                <del className="text-slate-400 line-through">
                    {children}
                </del>
            );

        case "inlineCode":
            return (
                <code className="rounded-md border border-slate-700/70 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.9em] text-sky-300">
                    {node.value ?? ""}
                </code>
            );

        case "code":
            return <MarkdownCodeBlock node={node} />;

        case "link":
            return (
                <MarkdownLink href={node.url} title={node.title}>
                    {children}
                </MarkdownLink>
            );

        case "image":
            return (
                <MarkdownImage
                    src={node.url}
                    alt={node.alt}
                    title={node.title}
                />
            );

        case "break":
            return <br />;

        case "blockquote":
            return (
                <blockquote className="my-5 border-l-2 border-sky-500/70 pl-4 text-slate-300 [&>p]:mb-2 [&>p:last-child]:mb-0">
                    {children}
                </blockquote>
            );

        case "list":
            return (
                <MarkdownList
                    ordered={node.ordered === true}
                    start={node.start}
                >
                    {children}
                </MarkdownList>
            );

        case "listItem":
            return (
                <MarkdownListItem checked={node.checked}>
                    {children}
                </MarkdownListItem>
            );

        case "thematicBreak":
            return <hr className="my-6 border-slate-700" />;

        case "containerDirective":
            if (node.name === "space") {
                return (
                    <MarkdownSpacing
                        size={node.attributes?.size}
                    />
                );
            }

            return null;

        case "table":
            return <MarkdownTable>{children}</MarkdownTable>;

        case "tableRow":
            return <MarkdownTableRow>{children}</MarkdownTableRow>;

        case "tableCell":
            return <MarkdownTableCell>{children}</MarkdownTableCell>;

        case "tableHeader":
            return <MarkdownTableHeader>{children}</MarkdownTableHeader>;

        case "html":
            // Never inject raw HTML from Markdown into the page.
            return null;

        case "root":
            return <>{children}</>;

        default:
            // Preserve child text for supported extensions and unknown wrapper nodes.
            return children.length > 0 ? <span>{children}</span> : null;
    }
}
import type { ReactNode } from "react";

type Props = {
    href?: string;
    title?: string | null;
    children: ReactNode;
};

export function MarkdownLink({ href, title, children }: Props) {
    // Allow web links and common relative links, but not executable URLs.
    const safeHref =
        href && /^(https?:|mailto:|\/|#|\.\.?\/)/i.test(href)
            ? href
            : undefined;

    const isExternal = /^https?:/i.test(safeHref ?? "");

    return (
        <a
            href={safeHref}
            title={title ?? undefined}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="text-sky-400 underline decoration-sky-400/40 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-300"
        >
            {children}
        </a>
    );
}
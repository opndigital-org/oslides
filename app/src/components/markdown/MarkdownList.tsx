import type { ReactNode } from "react";

type ListProps = {
    ordered?: boolean;
    start?: number | null;
    children: ReactNode;
};

type ListItemProps = {
    checked?: boolean | null;
    children: ReactNode;
};

export function MarkdownList({
    ordered = false,
    start,
    children,
}: ListProps) {
    const className = ordered
        ? "mb-4 list-decimal space-y-2 pl-7 text-2xl text-slate-200 marker:text-slate-500"
        : "mb-4 list-disc space-y-2 pl-7 text-2xl text-slate-200 marker:text-slate-500";

    if (ordered) {
        return (
            <ol start={start ?? undefined} className={className}>
                {children}
            </ol>
        );
    }

    return <ul className={className}>{children}</ul>;
}

export function MarkdownListItem({ checked, children }: ListItemProps) {
    return (
        <li className="pl-1 leading-relaxed">
            {checked !== undefined && checked !== null && (
                <span
                    className="mr-2 text-slate-400"
                    aria-label={checked ? "Completed" : "Not completed"}
                >
                    {checked ? "☑" : "☐"}
                </span>
            )}
            {children}
        </li>
    );
}
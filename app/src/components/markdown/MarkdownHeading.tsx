import type { ReactNode } from "react";

type Props = {
    depth?: number;
    children: ReactNode;
};

const headingClasses: Record<number, string> = {
    1: "mb-4 text-5xl font-bold leading-tight tracking-tight text-white",
    2: "mb-2 mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-100",
    3: "mb-2 mt-5 text-3xl font-bold leading-snug tracking-tight text-slate-100",
    4: "mb-2 mt-4 text-2xl font-bold text-slate-100",
    5: "mb-2 mt-3 text-xl font-bold text-slate-200",
    6: "mb-2 mt-3 text-lg font-bold text-slate-300",
};

export function MarkdownHeading({ depth = 1, children }: Props) {
    const level = Math.min(Math.max(depth, 1), 6);
    const className = headingClasses[level];

    switch (level) {
        case 1:
            return <h1 className={className}>{children}</h1>;
        case 2:
            return <h2 className={className}>{children}</h2>;
        case 3:
            return <h3 className={className}>{children}</h3>;
        case 4:
            return <h4 className={className}>{children}</h4>;
        case 5:
            return <h5 className={className}>{children}</h5>;
        default:
            return <h6 className={className}>{children}</h6>;
    }
}
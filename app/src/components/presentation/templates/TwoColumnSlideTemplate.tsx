import type { ReactNode } from "react";

type Props = {
    title?: string;
    children: ReactNode;
    leftColumn?: ReactNode;
    rightColumn?: ReactNode;
};

export function TwoColumnSlideTemplate({
    title,
    children,
    leftColumn,
    rightColumn,
}: Props) {
    return (
        <section className="flex min-h-full w-full flex-col gap-8 p-6 sm:p-12">
            {title && (
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    {title}
                </h1>
            )}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 md:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
                    {leftColumn ?? children}
                </div>

                <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/50 p-5 sm:p-8">
                    {rightColumn}
                </div>
            </div>
        </section>
    );
}
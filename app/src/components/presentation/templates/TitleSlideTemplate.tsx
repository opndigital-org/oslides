import type { ReactNode } from "react";

type Props = {
    title?: string;
    subtitle?: ReactNode;
};

export function TitleSlideTemplate({ title, subtitle }: Props) {
    return (
        <section className="flex min-h-full w-full flex-col items-center justify-center text-center py-16 px-20">
            {title && (
                <h1 className="max-w-5xl text-7xl font-bold tracking-tight text-white">
                    {title}
                </h1>
            )}

            {subtitle && (
                <div className="mt-6 max-w-4xl text-5xl text-slate-400">
                    {subtitle}
                </div>
            )}
        </section>
    );
}
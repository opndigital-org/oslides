import type { ReactNode } from "react";

type Props = {
    title?: string;
    subtitle?: ReactNode;
};

export function TitleSlideTemplate({ title, subtitle }: Props) {
    return (
        <section className="flex min-h-full w-full flex-col items-center justify-center px-6 py-16 text-center sm:px-20">
            {title && (
                <h1 className="max-w-5xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
                    {title}
                </h1>
            )}

            {subtitle && (
                <div className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-400 sm:text-2xl">
                    {subtitle}
                </div>
            )}
        </section>
    );
}
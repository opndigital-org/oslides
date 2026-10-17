import type { ReactNode } from "react";

type Props = {
    title?: string;
    children: ReactNode;
};

export function ContentSlideTemplate({ title, children }: Props) {
    return (
        <section className="flex min-h-full w-full flex-col px-6 py-8 sm:px-12 sm:py-10">
            {title && (
                <h1 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                    {title}
                </h1>
            )}

            <div className="min-h-0 flex-1 text-lg leading-relaxed text-slate-300">
                {children}
            </div>
        </section>
    );
}
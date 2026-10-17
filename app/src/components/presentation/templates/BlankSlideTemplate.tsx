import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

export function BlankSlideTemplate({ children }: Props) {
    return (
        <section className="min-h-full w-full p-6 sm:p-12">
            {children}
        </section>
    );
}
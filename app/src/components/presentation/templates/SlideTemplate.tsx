import type { ReactNode } from "react";
import type { SlideTemplate } from "@/lib/markdown/templates";

import { TitleSlideTemplate } from "@/components/presentation/templates/TitleSlideTemplate";
import { ContentSlideTemplate } from "@/components/presentation/templates/ContentSlideTemplate";
import { BlankSlideTemplate } from "@/components/presentation/templates/BlankSlideTemplate";
import { TwoColumnSlideTemplate } from "@/components/presentation/templates/TwoColumnSlideTemplate";

type Props = {
    template: SlideTemplate;
    children: ReactNode;
    title?: string;
    subtitle?: ReactNode;
    leftColumn?: ReactNode;
    rightColumn?: ReactNode;
};

export function SlideTemplateLayout({
    template,
    children,
    title,
    subtitle,
    leftColumn,
    rightColumn,
}: Props) {
    switch (template) {
        case "title":
            return (
                <TitleSlideTemplate
                    title={title}
                    subtitle={subtitle}
                />
            );

        case "blank":
            return <BlankSlideTemplate>{children}</BlankSlideTemplate>;

        case "two-columns":
            return (
                <TwoColumnSlideTemplate
                    title={title}
                    leftColumn={leftColumn}
                    rightColumn={rightColumn}
                >
                    {children}
                </TwoColumnSlideTemplate>
            );

        case "content":
        default:
            return (
                <ContentSlideTemplate title={title}>
                    {children}
                </ContentSlideTemplate>
            );
    }
}
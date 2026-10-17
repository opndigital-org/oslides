import type { ReactNode } from "react";
import type { SlideData } from "@/lib/markdown/parsePresentation";

import { useRef } from "react";
import { MarkdownContent } from "@/components/markdown/MarkdownContent";
import { PresentationHeader } from "@/components/presentation/PresentationHeader";
import { SolutionReveal } from "@/components/presentation/SolutionReveal";
import { SlideTemplateLayout } from "@/components/presentation/templates/SlideTemplate";
import { usePresentationControls } from "@/hooks/usePresentationControls";


type Props = {
    slide: SlideData;
    slideNumber: number;
    totalSlides: number;
    presentationTitle: string;
    onPrevious: () => void;
    onNext: () => void;
    canGoPrevious: boolean;
    canGoNext: boolean;
};

export function SlideRenderer({
    slide,
    slideNumber,
    totalSlides,
    presentationTitle,
    onPrevious,
    onNext,
    canGoPrevious,
    canGoNext,
}: Props) {
    const fullscreenRef = useRef<HTMLElement>(null);

    const { isFullscreen, toggleFullscreen } = usePresentationControls({
        onPrevious,
        onNext,
        fullscreenRef
    });

    const solution = slide.solutions[0];

    const subtitle: ReactNode | undefined =
        slide.subtitleNodes !== undefined ? (
            <MarkdownContent nodes={slide.subtitleNodes} />
        ) : undefined;

    return (
        <main
            ref={fullscreenRef}
            className="flex h-dvh w-full flex-col overflow-hidden bg-[#0d1117] text-[#e6edf3] [&:fullscreen]:h-dvh [&:fullscreen]:w-screen"
        >
            <PresentationHeader
                presentationTitle={presentationTitle}
                slideNumber={slideNumber}
                totalSlides={totalSlides}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isFullscreen={isFullscreen}
                onPrevious={onPrevious}
                onNext={onNext}
                onToggleFullscreen={toggleFullscreen}
            />

            <article className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-wrap:anywhere]">
                <SlideTemplateLayout
                    template={slide.template ?? "content"}
                    title={slide.title}
                    subtitle={subtitle}
                >
                    <MarkdownContent nodes={slide.nodes} />
                </SlideTemplateLayout>

                {solution && (
                    <SolutionReveal
                        key={slide.id}
                        solution={solution}
                    />
                )}
            </article>
        </main>
    );
}
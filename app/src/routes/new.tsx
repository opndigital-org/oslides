
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { SlideRenderer } from "@/components/presentation/SlideRenderer";
import { parsePresentation } from "@/lib/markdown/parsePresentation";

function EditorPage() {
    const [markdown, setMarkdown] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showEditor, setShowEditor] = useState(true);

    const presentation = useMemo(
        () => parsePresentation(markdown),
        [markdown],
    );

    const slides = presentation.slides;

    const safeCurrentSlide = Math.min(
        currentSlide,
        Math.max(0, slides.length - 1),
    );

    const slide = slides[safeCurrentSlide];

    const title = String(
        presentation.metadata.title ?? "Untitled",
    );

    function goToSlide(index: number) {
        setCurrentSlide(
            Math.max(0, Math.min(index, slides.length - 1)),
        );
    }

    return (
        <main className="flex h-dvh w-screen flex-col overflow-hidden bg-[#0d1117] text-[#e6edf3]">
            <div
                className={`grid min-h-0 flex-1 ${
                    showEditor
                        ? "grid-cols-1 lg:grid-cols-[35%_65%]"
                        : "grid-cols-1"
                }`}
            >
                {showEditor && (
                    <MarkdownEditor
                        markdown={markdown}
                        onChange={(value) => setMarkdown(value)}
                        onClear={() => {
                            setMarkdown("");
                            setCurrentSlide(0);
                        }}
                    />
                )}

                <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                    {slide ? (
                        <SlideRenderer
                            slide={slide}
                            slideNumber={safeCurrentSlide + 1}
                            totalSlides={slides.length}
                            presentationTitle={title}
                            onPrevious={() =>
                                goToSlide(safeCurrentSlide - 1)
                            }
                            onNext={() =>
                                goToSlide(safeCurrentSlide + 1)
                            }
                            canGoPrevious={safeCurrentSlide > 0}
                            canGoNext={safeCurrentSlide < slides.length - 1}
                        />
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-8 text-center">
                            <div>
                                <h2 className="font-semibold text-white">
                                    Your presentation starts here
                                </h2>
                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">
                                    Write some Markdown in the editor to
                                    create your first slide. Separate
                                    slides with a horizontal rule.
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

export const Route = createFileRoute("/new")({
    component: EditorPage,
});

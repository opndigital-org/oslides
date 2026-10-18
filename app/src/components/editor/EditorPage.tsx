import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MarkdownEditor } from "@/components/editor/MarkdownEditor";
import { SlideRenderer } from "@/components/presentation/SlideRenderer";
import { parsePresentation } from "@/lib/markdown/parsePresentation";
import { api } from "@/lib/api/client";

type EditorPageProps = {
    mode: "new" | "edit";
    id?: string;
    initialDeck?: {
        title: string;
        markdownContent: string;
    };
};

export function EditorPage({
    mode,
    id,
    initialDeck,
}: EditorPageProps) {
    const navigate = useNavigate();

    const [markdown, setMarkdown] = useState(
        () => initialDeck?.markdownContent ?? "",
    );
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showEditor, setShowEditor] = useState(true);
    const [loading, setLoading] = useState(mode === "edit" && !initialDeck);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        presentation.metadata.title ?? initialDeck?.title ?? "Untitled",
    );

    useEffect(() => {
        if (initialDeck) {
            setMarkdown(initialDeck.markdownContent);
            setCurrentSlide(0);
            setLoading(false);
        }
    }, [initialDeck]);

    async function handleSave() {
        if (saving) {
            return;
        }

        setSaving(true);
        setErrorMessage(null);

        try {
            if (mode === "new") {
                const { data, error } = await api.POST("/api/decks", {
                    body: {
                        title,
                        markdown,
                    },
                });

                if (error || !data) {
                    setErrorMessage("Could not create the presentation.");
                    return;
                }

                await navigate({
                    to: "/edit/$id",
                    params: { id: data.deck.id },
                });
            } else {
                if (!id) {
                    setErrorMessage("A presentation ID is required.");
                    return;
                }

                const { error } = await api.PATCH("/api/decks/{id}", {
                    params: {
                        path: { id },
                    },
                    body: {
                        title,
                        markdown,
                    },
                });

                if (error) {
                    setErrorMessage("Could not save your changes.");
                }
            }
        } catch (error) {
            console.error("Failed to save presentation:", error);
            setErrorMessage("Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    }

    function goToSlide(index: number) {
        setCurrentSlide(
            Math.max(0, Math.min(index, slides.length - 1)),
        );
    }

    if (loading) {
        return (
            <main className="flex h-dvh items-center justify-center bg-[#0d1117] text-[#e6edf3]">
                Loading presentation...
            </main>
        );
    }

    return (
        <main className="flex h-dvh w-screen flex-col overflow-hidden bg-[#0d1117] text-[#e6edf3]">
            {errorMessage && (
                <div
                    role="alert"
                    className="shrink-0 border-b border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200"
                >
                    {errorMessage}
                </div>
            )}

            <div
                className={`grid min-h-0 flex-1 ${showEditor
                        ? "grid-cols-1 lg:grid-cols-[35%_65%]"
                        : "grid-cols-1"
                    }`}
            >
                {showEditor && (
                    <MarkdownEditor
                        markdown={markdown}
                        onChange={(value) => {
                            setMarkdown(value);
                        }}
                        handleSave={handleSave}
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
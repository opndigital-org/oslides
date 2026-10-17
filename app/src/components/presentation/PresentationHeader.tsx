import { Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    presentationTitle: string;
    slideNumber: number;
    totalSlides: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
    isFullscreen: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onToggleFullscreen: () => void;
};

export function PresentationHeader({
    presentationTitle,
    slideNumber,
    totalSlides,
    canGoPrevious,
    canGoNext,
    isFullscreen,
    onPrevious,
    onNext,
    onToggleFullscreen,
}: Props) {
    return (
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/80 px-4 py-2 sm:px-6 lg:px-8">
            <span
                className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-[#8b949e] sm:text-sm"
                title={presentationTitle}
            >
                {presentationTitle}
            </span>

            <span
                className="shrink-0 font-mono text-xs tabular-nums text-[#8b949e]"
                aria-label={`Slide ${slideNumber} of ${totalSlides}`}
            >
                {String(slideNumber).padStart(2, "0")} /{" "}
                {String(totalSlides).padStart(2, "0")}
            </span>

            <nav
                aria-label="Presentation controls"
                className="flex shrink-0 items-center gap-1.5 sm:gap-2"
            >
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onPrevious();
                    }}
                    disabled={!canGoPrevious}
                    aria-label="Previous slide"
                    title="Previous slide"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronLeft size={14} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onNext();
                    }}
                    disabled={!canGoNext}
                    aria-label="Next slide"
                    title="Next slide"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
                >
                    <ChevronRight size={14} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleFullscreen();
                    }}
                    aria-label={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                    title={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-300 transition hover:bg-slate-800"
                >
                    {isFullscreen ? (
                        <Minimize size={14} aria-hidden="true" />
                    ) : (
                        <Maximize size={14} aria-hidden="true" />
                    )}
                </button>
            </nav>
        </header>
    );
}
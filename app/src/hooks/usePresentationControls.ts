import {
    useCallback,
    useEffect,
    useState,
    type RefObject,
} from "react";

type Props = {
    onPrevious: () => void;
    onNext: () => void;
    fullscreenRef: RefObject<HTMLElement | null>;
};

export function usePresentationControls({
    onPrevious,
    onNext,
    fullscreenRef,
}: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                event.shiftKey ||
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                (event.target instanceof HTMLElement &&
                    (event.target.isContentEditable ||
                        event.target.closest(".cm-editor") !== null))
            ) {
                return;
            }

            if (
                event.key === "ArrowRight" ||
                event.key === " "
            ) {
                event.preventDefault();
                onNext();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                onPrevious();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onNext, onPrevious]);

    useEffect(() => {
        function handleFullscreenChange() {
            setIsFullscreen(
                document.fullscreenElement === fullscreenRef.current
            );
        }

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, [fullscreenRef]);

    const toggleFullscreen = useCallback(async () => {
        const element = fullscreenRef.current;

        if (!element) return;

        try {
            if (document.fullscreenElement === element) {
                await document.exitFullscreen();
            } else if (!document.fullscreenElement) {
                await element.requestFullscreen();
            }
        } catch (error) {
            console.error("Unable to toggle slide fullscreen:", error);
        }
    }, [fullscreenRef]);

    return {
        isFullscreen,
        toggleFullscreen,
    };
}
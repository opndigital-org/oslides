type Props = {
    size?: string | null;
};

const spacingClasses: Record<string, string> = {
    small: "h-4",
    medium: "h-8",
    large: "h-16",
};

export function MarkdownSpacing({ size }: Props) {
    return (
        <div
            aria-hidden="true"
            className={spacingClasses[size ?? "medium"] ?? "h-8"}
        />
    );
}
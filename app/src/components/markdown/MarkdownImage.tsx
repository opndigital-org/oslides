type Props = {
    src?: string;
    alt?: string;
    title?: string | null;
};

export function MarkdownImage({ src, alt = "", title }: Props) {
    return (
        <figure className="my-5">
            <img
                src={src ?? ""}
                alt={alt}
                title={title ?? undefined}
                loading="lazy"
                className="mx-auto max-h-[60vh] w-auto max-w-full rounded-lg border border-slate-700/70 object-contain"
            />

            {alt && (
                <figcaption className="mt-2 text-center text-sm text-slate-400">
                    {alt}
                </figcaption>
            )}
        </figure>
    );
}
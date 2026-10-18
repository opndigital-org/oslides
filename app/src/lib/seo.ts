const defaultTitle = "oSlides";
const defaultDescription =
    "Markdown-native slides integrated with in-slide live code blocks.";

export function createPageHead({
    title = defaultTitle,
    description = defaultDescription,
}: {
    title?: string;
    description?: string;
} = {}) {
    return {
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title },
            {
                name: "description",
                content: description,
            },
            { name: "theme-color", content: "#05C0D9" },
            { property: "og:type", content: "website" },
            { property: "og:title", content: title },
            {
                property: "og:description",
                content: description,
            },
        ],
        links: [
            {
                rel: "icon",
                href: "/favicon.svg",
                type: "image/svg+xml",
            },
        ],
    };
}

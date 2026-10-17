export type MarkdownNode = {
    type: string;
    value?: string;
    children?: MarkdownNode[];
    depth?: number;
    url?: string;
    title?: string | null;
    alt?: string;
    lang?: string | null;
    ordered?: boolean;
    start?: number | null;
    checked?: boolean | null;
    identifier?: string;
    name?: string;
    attributes?: Record<string, string | null>;
    meta?: string | null;
};

export type RenderContext = {
    keyPrefix: string;
};
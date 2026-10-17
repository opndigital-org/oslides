
export const SLIDE_TEMPLATES = [
    "title",
    "content",
    "blank",
    "two-columns",
] as const;

export type SlideTemplate = (typeof SLIDE_TEMPLATES)[number];

export const DEFAULT_SLIDE_TEMPLATE: SlideTemplate = "content";

export function isSlideTemplate(value: string): value is SlideTemplate {
    return SLIDE_TEMPLATES.some((template) => template === value);
}


export function extractTitleAndSubtitle(markdown: string): {
  title?: string;
  subtitle: string;
} {
  const content = markdown.trim();

  const headingMatch = content.match(/^#\s+(.+?)\s*(?:\r?\n|$)/);

  if (!headingMatch) {
    return {
      subtitle: content,
    };
  }

  return {
    title: headingMatch[1].trim(),
    subtitle: content.slice(headingMatch[0].length).trim(),
  };
}


export function extractSlideTemplate(markdown: string): {
    template: SlideTemplate;
    content: string;
} {
    const match = markdown.match(
        /^\s*<!--\s*template:\s*([a-z-]+)\s*-->\s*(?:\r?\n)?/i,
    );

    if (!match) {
        return {
            template: DEFAULT_SLIDE_TEMPLATE,
            content: markdown,
        };
    }

    const requestedTemplate = match[1].toLowerCase();

    const template = isSlideTemplate(requestedTemplate)
        ? requestedTemplate
        : DEFAULT_SLIDE_TEMPLATE;

    return {
        template,
        content: markdown.slice(match[0].length),
    };
}



export function splitTwoColumns(markdown: string): {
    left: string;
    right: string;
} {
    const marker =
        /<!--\s*column:\s*(left|right)\s*-->/gi;

    const sections: { side: string; content: string }[] = [];
    let currentSide = "";
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = marker.exec(markdown)) !== null) {
        if (currentSide) {
            sections.push({
                side: currentSide,
                content: markdown.slice(lastIndex, match.index).trim(),
            });
        } else if (markdown.slice(0, match.index).trim()) {
            sections.push({
                side: "left",
                content: markdown.slice(0, match.index).trim(),
            });
        }

        currentSide = match[1].toLowerCase();
        lastIndex = marker.lastIndex;
    }

    if (currentSide) {
        sections.push({
            side: currentSide,
            content: markdown.slice(lastIndex).trim(),
        });
    } else {
        return { left: markdown.trim(), right: "" };
    }

    return {
        left: sections
            .filter((section) => section.side === "left")
            .map((section) => section.content)
            .join("\n\n"),
        right: sections
            .filter((section) => section.side === "right")
            .map((section) => section.content)
            .join("\n\n"),
    };
}

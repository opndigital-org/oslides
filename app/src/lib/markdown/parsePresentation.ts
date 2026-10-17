
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter, ["yaml"])
  .use(remarkDirective);

export type CodeBlockData = {
  language: string;
  code: string;
  live: boolean;
  id?: string;
  filename?: string;
};

export type SlideTemplate =
  | "title"
  | "content"
  | "blank"
  | "two-columns";

export type SlideData = {
  id: string;
  nodes: any[];
  solutions: string[];
  template?: SlideTemplate;
  title?: string;
  subtitleNodes?: any[];
};

export type PresentationData = {
  metadata: Record<string, unknown>;
  slides: SlideData[];
};

function getText(node: any): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? "";
  }

  if (!node.children) {
    return node.value ?? "";
  }

  return node.children.map(getText).join("");
}

function parseCodeMeta(meta?: string | null) {
  const value = meta ?? "";

  return {
    live: /\blive\b/.test(value),
    id: value.match(/\bid="([^"]+)"/)?.[1],
    filename: value.match(/\bfilename="([^"]+)"/)?.[1],
  };
}

function extractTemplate(nodes: any[]): {
  template: SlideTemplate;
  nodes: any[];
} {
  const firstNode = nodes[0];

  if (firstNode?.type === "html") {
    const match = firstNode.value.match(
      /^\s*<!--\s*template:\s*([a-z-]+)\s*-->\s*$/i
    );

    if (match) {
      const requested = match[1].toLowerCase();

      const validTemplates: SlideTemplate[] = [
        "title",
        "content",
        "blank",
        "two-columns",
      ];

      const template = validTemplates.includes(
        requested as SlideTemplate
      )
        ? (requested as SlideTemplate)
        : "content";

      return {
        template,
        nodes: nodes.slice(1),
      };
    }
  }

  return {
    template: "content",
    nodes,
  };
}

function extractTitleAndSubtitle(nodes: any[]): {
  title?: string;
  subtitleNodes: any[];
  remainingNodes: any[];
} {
  const headingIndex = nodes.findIndex(
    (node) => node.type === "heading" && node.depth === 1
  );

  if (headingIndex === -1) {
    return {
      subtitleNodes: nodes,
      remainingNodes: [],
    };
  }

  const heading = nodes[headingIndex];

  return {
    title: getText(heading).trim(),
    subtitleNodes: nodes.slice(headingIndex + 1),
    remainingNodes: [],
  };
}

export function parsePresentation(
  source: string
): PresentationData {
  const tree = processor.parse(source) as any;
  const children = [...tree.children];

  let metadata: Record<string, unknown> = {};

  // Extract YAML frontmatter before processing slides.
  const frontmatterIndex = children.findIndex(
    (node: any) => node.type === "yaml"
  );

  if (frontmatterIndex !== -1) {
    const frontmatter = children[frontmatterIndex];

    metadata = parseYaml(frontmatter.value) ?? {};
    children.splice(frontmatterIndex, 1);
  }

  // Split only on top-level Markdown horizontal rules.
  const groups: any[][] = [[]];

  for (const node of children) {
    if (node.type === "thematicBreak") {
      groups.push([]);
    } else {
      groups[groups.length - 1].push(node);
    }
  }

  const slides: SlideData[] = groups
    .filter((nodes) => nodes.length > 0)
    .map((originalNodes, index) => {
      const solutions: string[] = [];
      let eyebrow: string | undefined;

      // Read the template before processing slide content.
      const extractedTemplate = extractTemplate(originalNodes);
      const template = extractedTemplate.template;

      let workingNodes = extractedTemplate.nodes;

      // Extract title and subtitle for title slides.
      let title: string | undefined;
      let subtitleNodes: any[] | undefined;

      if (template === "title") {
        const extracted = extractTitleAndSubtitle(workingNodes);

        title = extracted.title;
        subtitleNodes = extracted.subtitleNodes;
        workingNodes = extracted.remainingNodes;
      }

      const nodes: any[] = [];

      for (const node of workingNodes) {
        // Extract: <!-- eyebrow: PYTHON FUNDAMENTALS -->
        if (node.type === "html") {
          const match = node.value.match(
            /<!--\s*eyebrow:\s*(.*?)\s*-->/
          );

          if (match) {
            eyebrow = match[1].trim();
            continue;
          }
        }

        // Extract solution content instead of showing it
        // as ordinary slide text.
        if (
          node.type === "containerDirective" &&
          node.name === "solution"
        ) {
          solutions.push(getText(node).trim());
          continue;
        }

        nodes.push(node);
      }

      // Identify fenced code metadata without changing
      // the original AST.
      visit(nodes, "code", (node: any) => {
        node.presentationCode = {
          ...parseCodeMeta(node.meta),
          language: node.lang ?? "text",
          code: node.value,
        } satisfies CodeBlockData;
      });

      // Also process code blocks in the title subtitle.
      if (subtitleNodes) {
        visit(subtitleNodes, "code", (node: any) => {
          node.presentationCode = {
            ...parseCodeMeta(node.meta),
            language: node.lang ?? "text",
            code: node.value,
          } satisfies CodeBlockData;
        });
      }

      return {
        id: `slide-${index + 1}`,
        eyebrow,
        nodes,
        solutions,
        template,
        title,
        subtitleNodes,
      };
    });

  return { metadata, slides };
}

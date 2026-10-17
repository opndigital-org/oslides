
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import hljs from "highlight.js";

import "highlight.js/styles/github-dark.css";

type Props = {
  code: string;
  language?: string;
  title?: string;
};

export function CodeCard({
  code,
  language = "python",
  title = "Solution",
}: Props) {
  const [copied, setCopied] = useState(false);

  const highlightedCode = (() => {
    const normalizedLanguage = hljs.getLanguage(language)
      ? language
      : "plaintext";

    return hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    }).value;
  })();

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Unable to copy code to clipboard:", error);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-700/80 bg-[#0d1117] shadow-lg shadow-black/10">
      {/* Code panel header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-700/80 bg-[#161b22] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="size-2 shrink-0 rounded-full bg-emerald-400"
            aria-hidden="true"
          />

          <span className="truncate text-sm font-medium text-slate-200">
            {title}
          </span>

          <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-0.5 font-mono text-xs text-slate-400">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          {copied ? (
            <>
              <Check size={14} aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </header>

      {/* Syntax-highlighted code */}
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <pre className="m-0 min-w-0 bg-transparent px-4 py-4 text-[13px] leading-6 sm:px-5 sm:text-sm">
          <code
            className={`hljs language-${language} block font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </section>
  );
}

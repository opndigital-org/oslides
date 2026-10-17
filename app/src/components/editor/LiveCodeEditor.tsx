import { useState, useEffect } from "react";

import type { PyodideInterface } from "pyodide";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { loadPyodide, version as pyodideVersion } from "pyodide";

type Props = {
    code: string;
    id?: string;
    filename?: string;
};

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;
const FONT_SIZE_STEP = 2;
const DEFAULT_FONT_SIZE = 24;

let pyodidePromise: Promise<PyodideInterface> | undefined;

function getPyodide() {
    if (!pyodidePromise) {
        pyodidePromise = loadPyodide({
            indexURL: `https://cdn.jsdelivr.net/pyodide/v${pyodideVersion}/full/`,
        }).catch((error) => {
            pyodidePromise = undefined;
            throw error;
        });
    }

    return pyodidePromise;
}

export function LiveCodeEditor({
    code: initialCode,
    id,
    filename = "main.py",
}: Props) {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {
                event.preventDefault();
                event.stopPropagation();

                if (!running) {
                    void runCode();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [running, code]);


    function decreaseFontSize() {
        setFontSize((size) =>
            Math.max(MIN_FONT_SIZE, size - FONT_SIZE_STEP)
        );
    }

    function increaseFontSize() {
        setFontSize((size) =>
            Math.min(MAX_FONT_SIZE, size + FONT_SIZE_STEP)
        );
    }

    async function runCode() {
        setRunning(true);
        setOutput("Starting Python…");

        try {
            const pyodide = await getPyodide();

            pyodide.globals.set("oslide_user_code", code);

            try {
                const result = await pyodide.runPythonAsync(`
import contextlib
import io
import traceback

_oslide_output = io.StringIO()

try:
    with contextlib.redirect_stdout(_oslide_output):
        exec(oslide_user_code, {})
except Exception:
    traceback.print_exc(file=_oslide_output)

_oslide_output.getvalue()
                `);

                setOutput(
                    String(result) ||
                    "Code executed successfully (no output)."
                );
                result.destroy?.();
            } finally {
                pyodide.globals.delete("oslide_user_code");
            }
        } catch (error) {
            setOutput(
                error instanceof Error
                    ? error.message
                    : "Unable to run Python code."
            );
        } finally {
            setRunning(false);
        }
    }

    const editorTheme = EditorView.theme({
        "&": {
            fontSize: `${fontSize}px`,
        },
        ".cm-content": {
            fontSize: `${fontSize}px`,
            lineHeight: "1.6",
        },
        ".cm-gutters": {
            fontSize: `${Math.max(12, fontSize - 4)}px`,
        },
    });

    return (
        <section
            data-live-code-id={id}
            className="my-5 min-w-0 overflow-hidden rounded-xl border border-slate-700 bg-[#0d1117]"
        >
            {/* Toolbar */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-[#161b22] px-4 py-2">
                <span
                    className="min-w-0 truncate font-mono text-xs text-slate-300"
                    title={filename}
                >
                    {filename}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Font size controls */}
                    <div
                        className="flex items-center gap-1 rounded-md border border-slate-700 bg-[#0d1117] p-1"
                        role="group"
                        aria-label="Editor font size"
                    >
                        <button
                            type="button"
                            onClick={decreaseFontSize}
                            disabled={fontSize <= MIN_FONT_SIZE}
                            aria-label="Decrease font size"
                            title="Decrease font size"
                            className="rounded px-2 py-1 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        >
                            A−
                        </button>

                        <span
                            className="min-w-12 text-center font-mono text-xs tabular-nums text-slate-400"
                            aria-live="polite"
                            aria-label={`Font size ${fontSize} pixels`}
                        >
                            {fontSize}px
                        </span>

                        <button
                            type="button"
                            onClick={increaseFontSize}
                            disabled={fontSize >= MAX_FONT_SIZE}
                            aria-label="Increase font size"
                            title="Increase font size"
                            className="rounded px-2 py-1 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        >
                            A+
                        </button>
                    </div>

                    {/* Save Script */}
                    <button
                        type="button"
                        onClick={() => {}}
                        className="inline-flex items-center rounded-md border border-slate-700 bg-[#0d1117] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                    >
                        Save Script
                    </button>

                    {/* Clear Output */}
                    <button
                        type="button"
                        onClick={() => setOutput("")}
                        disabled={running || !output}
                        className="inline-flex items-center rounded-md border border-slate-700 bg-[#0d1117] px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                    >
                        Clear Output
                    </button>

                    {/* Run code */}
                    <button
                        type="button"
                        onClick={runCode}
                        disabled={running}
                        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-700 bg-[#0d1117] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                    >
                        {running ? "Running…" : "Run"}
                    </button>
                </div>
            </header>

            {/* Editable code */}
            <div className="min-w-0 overflow-x-auto [&_.cm-editor]:min-h-36 [&_.cm-editor]:bg-[#0d1117] [&_.cm-content]:py-3 [&_.cm-gutters]:border-r-slate-800 [&_.cm-gutters]:bg-[#0d1117]">
                <CodeMirror
                    value={code}
                    onChange={setCode}
                    extensions={[python(), editorTheme]}
                    theme={oneDark}
                    basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        indentOnInput: true,
                        tabSize: 4,
                    }}
                    editable={!running}
                    aria-label={`Editable Python script: ${filename}`}
                />
            </div>

            {/* Output */}
            <div className="border-t border-slate-700">
                <div className="bg-[#161b22] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Output
                </div>

                <pre
                    aria-live="polite"
                    className="max-h-64 min-h-12 overflow-auto whitespace-pre-wrap break-words bg-[#0d1117] px-4 py-3 font-mono text-lg leading-relaxed text-slate-200"
                >
                    {output || "Run your code to see the output here."}
                </pre>
            </div>
        </section>
    );
}

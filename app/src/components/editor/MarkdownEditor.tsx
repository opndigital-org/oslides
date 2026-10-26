import CodeMirror from "@uiw/react-codemirror";
import { markdown as markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";

type MarkdownEditorProps = {
    markdown: string;
    onChange: (markdown: string) => void;
    handleSave: () => void;
};

export function MarkdownEditor({
    markdown,
    onChange,
    handleSave,
}: MarkdownEditorProps) {
    return (
        <section className="flex max-h-[calc(100dvh-100px)] min-h-0 min-w-0 flex-col overflow-hidden border-r border-slate-800 bg-[#0d1117]">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0d1117] px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#05C0D9]" />

                    <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Markdown source
                    </h2>
                </div>

                <button
                    type="button"
                    className="rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-mono uppercase text-slate-300 transition hover:bg-slate-800"
                    onClick={handleSave}
                >
                    Save
                </button>
            </header>

            <div className="min-h-0 min-w-0 flex-1 bg-[#0d1117]">
                <CodeMirror
                    value={markdown}
                    onChange={onChange}
                    height="100%"
                    theme={oneDark}
                    extensions={[
                        markdownLanguage(),
                        EditorView.lineWrapping,
                        EditorView.theme({
                            "&": {
                                height: "100%",
                            },
                            ".cm-scroller": {
                                overflow: "auto",
                                fontFamily: "inherit",
                            },
                        }),
                    ]}
                    basicSetup={{
                        lineNumbers: true,
                        foldGutter: true,
                        highlightActiveLine: true,
                        highlightActiveLineGutter: true,
                        bracketMatching: true,
                        autocompletion: true,
                        closeBrackets: true,
                        searchKeymap: true,
                        tabSize: 2,
                    }}
                    indentWithTab
                    editable
                    placeholder={"---\ntitle: My presentation\n---\n\n<!-- template: title -->\n# First slide\n\nStart writing Markdown..."}
                    className="h-full text-sm"
                />
            </div>
        </section>
    );
}
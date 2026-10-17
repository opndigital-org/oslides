
import CodeMirror from "@uiw/react-codemirror";
import { markdown as markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";

type MarkdownEditorProps = {
    markdown: string;
    onChange: (markdown: string) => void;
    onClear?: () => void;
};

export function MarkdownEditor({
    markdown,
    onChange,
}: MarkdownEditorProps) {
    return (
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-slate-800 bg-[#0d1117]">
            <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#161b22] px-4 py-4">
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />

                    <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300">
                        Markdown source
                    </h2>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-auto bg-[#0d1117]">
                <CodeMirror
                    value={markdown}
                    onChange={onChange}
                    height="100%"
                    minHeight="100%"
                    theme={oneDark}
                     extensions={[
                        markdownLanguage(),
                        EditorView.lineWrapping,
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
                    style={{
                        height: "100%",
                        backgroundColor: "#0d1117",
                    }}
                />
            </div>
        </section>
    );
}

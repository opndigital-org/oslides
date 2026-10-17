import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { CodeCard } from "@/components/presentation/CodeCard";

type Props = {
    solution: string;
};

export function SolutionReveal({ solution }: Props) {
    const [revealed, setRevealed] = useState(false);

    return (
        <section className="mx-4 mt-6 border-t border-slate-800 pb-8 pt-5 sm:mx-6 lg:mx-10 xl:mx-14">
            <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-expanded={revealed}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-blue-400 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            >
                {revealed ? (
                    <>
                        <EyeOff size={16} aria-hidden="true" />
                        Hide solution
                    </>
                ) : (
                    <>
                        <Eye size={16} aria-hidden="true" />
                        Reveal solution
                    </>
                )}
            </button>

            {revealed && (
                <div className="mt-4">
                    <CodeCard code={solution} language="python" />
                </div>
            )}
        </section>
    );
}
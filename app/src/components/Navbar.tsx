
import { FolderOpen, Settings } from "lucide-react";

type Props = {
    isAuthenticated: boolean;
    onSignOut: () => void;
};

export function Navbar({
    isAuthenticated,
    onSignOut,
}: Props) {
    return (
        <header className="z-20 flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0d1117] py-1 px-4 sm:px-6">
            <div className="flex gap-2 items-center">
                <img src="/favicon.svg" width={"50px"} />
                <p className="text-base font-semibold tracking-tight text-white">
                    oSlides
                </p>
            </div>

            <nav
                aria-label="Main navigation"
                className="flex items-center gap-2 py-2"
            >
                {isAuthenticated ? (
                    <>
                        <a
                            href="/decks"
                            className="flex items-center gap-2 rounded-lg py-2 px-4 font-mono uppercase text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                            <FolderOpen size={16} aria-hidden="true" />
                            Decks
                        </a>

                        <a
                            href="/settings"
                            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            <Settings size={18} aria-hidden="true" />
                        </a>

                        <button
                            onClick={onSignOut}
                            className="flex items-center gap-2 rounded-lg border border-slate-700 py-2 px-4 font-mono uppercase text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <a
                        href="/login"
                        className="flex items-center gap-2 rounded-lg border border-slate-700 py-2 px-4 font-mono uppercase text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                        Sign in
                    </a>
                )}
            </nav>
        </header>
    );
}


import { FolderOpen, Settings } from "lucide-react";

type Props = {
    isAuthenticated: boolean;
    onOpenDecks: () => void;
    onOpenSettings: () => void;
    onSignIn: () => void;
};

export function Navbar({
    isAuthenticated,
    onOpenDecks,
    onOpenSettings,
    onSignIn,
}: Props) {
    return (
        <header className="z-20 flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0d1117] py-1 px-4 sm:px-6">

            <p className="text-base font-semibold tracking-tight text-white">
                oSlides
            </p>

            <nav
                aria-label="Main navigation"
                className="flex items-center gap-2 py-2"
            >
                {isAuthenticated ? (
                    <>
                        <button
                            type="button"
                            onClick={onOpenDecks}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white font-mono uppercase"
                        >
                            <FolderOpen size={16} aria-hidden="true" />
                            Decks
                        </button>

                        <button
                            type="button"
                            onClick={onOpenSettings}
                            aria-label="Settings"
                            title="Settings"
                            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            <Settings size={18} aria-hidden="true" />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={onSignIn}
                        className="flex items-center gap-2 rounded-lg border border-slate-700 py-2 px-4 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white font-mono uppercase"
                    >
                        Sign in
                    </button>
                )}
            </nav>
        </header>
    );
}

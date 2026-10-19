import { Link } from "@tanstack/react-router"
import { FolderOpen, Hammer } from "lucide-react"

export const WorkInProgress = () => {
    return (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-slate-800 text-2xl text-[#05C0D9]">
                <Hammer />
            </div>

            <h2 className="text-lg font-semibold text-white">
                Nothing to see here
            </h2>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
                This page is a work in progress, we have more to come.
            </p>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
                So watch this space.
            </p>

            <div className="flex gap-4">
                <Link
                    to="/decks"
                    className="mt-5 px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-slate-800 border border-slate-700 text-sm uppercase font-mono font-semibold text-slate-300 hover:text-white transition"
                >
                    <FolderOpen size={16} aria-hidden="true" />
                    Decks
                </Link>

                <Link
                    to="/new"
                    className="mt-5 px-4 py-2 rounded-lg bg-[#05C0D9] hover:bg-cyan-300 text-sm uppercase font-mono font-semibold text-[#0d1117] transition"
                >
                    Create your first deck
                </Link>
            </div>
        </div>
    )
}
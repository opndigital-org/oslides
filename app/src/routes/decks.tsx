import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { LayersPlus, Plus } from "lucide-react";
import { createPageHead } from "@/lib/seo";
import { api } from "@/lib/api/client";

export const Route = createFileRoute("/decks")({
    head: () =>
        createPageHead({
            title: "All Decks | oSlides",
            description:
                "Manage your slide decks and create new Markdown-powered presentations with oSlides.",
        }),
    loader: async () => {
        const { data, error } = await api.GET("/api/decks");

        if (error || !data) {
            throw new Error("Could not load your decks.");
        }

        return data;
    },
    component: DecksPage,
});

function DecksPage() {
    const router = useRouter();
    const { decks } = Route.useLoaderData();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function toggleSelection(id: string) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id],
        );
    }

    function toggleSelectAll() {
        setSelectedIds((current) =>
            current.length === decks.length
                ? []
                : decks.map((deck) => deck.id),
        );
    }

    async function handleDeleteSelected() {
        if (
            selectedIds.length === 0 ||
            deleting ||
            !window.confirm(
                `Delete ${selectedIds.length} selected deck${selectedIds.length === 1 ? "" : "s"
                }? This cannot be undone.`,
            )
        ) {
            return;
        }

        setDeleting(true);
        setErrorMessage(null);

        try {
            const results = await Promise.all(
                selectedIds.map((id) =>
                    api.DELETE("/api/decks/{id}", {
                        params: {
                            path: { id },
                        },
                    }),
                ),
            );

            const failedCount = results.filter(
                (result) => result.error,
            ).length;

            setSelectedIds([]);

            if (failedCount > 0) {
                setErrorMessage(
                    `${failedCount} deck${failedCount === 1 ? "" : "s"
                    } could not be deleted.`,
                );
            }

            await router.invalidate();
        } catch (error) {
            console.error("Failed to delete decks:", error);
            setErrorMessage("Something went wrong while deleting decks.");
            await router.invalidate();
        } finally {
            setDeleting(false);
        }
    }

    return (
        <main className="mx-auto min-h-[calc(100dvh-4rem)] w-full max-w-7xl px-6 py-10">
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        My decks
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Create, organise, and edit your slide decks.
                    </p>
                </div>

                <Link
                    to="/new"
                    className="flex items-center gap-2 rounded-lg border border-slate-700 py-2 px-4 font-mono uppercase text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition"
                >
                    <Plus size={16} aria-hidden="true" />
                    Create Deck
                </Link>
            </header>

            {errorMessage && (
                <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-200"
                >
                    {errorMessage}
                </div>
            )}

            {decks.length > 0 ? (
                <>
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-400">
                            {decks.length}{" "}
                            {decks.length === 1 ? "deck" : "decks"}
                        </p>

                        <div className="flex items-center gap-4">
                            {selectedIds.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDeleteSelected}
                                    disabled={deleting}
                                    className="rounded-lg border border-red-900 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {deleting
                                        ? "Deleting..."
                                        : `Delete selected (${selectedIds.length})`}
                                </button>
                            )}

                            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={
                                        decks.length > 0 &&
                                        selectedIds.length === decks.length
                                    }
                                    onChange={toggleSelectAll}
                                    className="size-4 accent-[#05C0D9]"
                                />
                                Select all
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {decks.map((deck) => {
                            const selected = selectedIds.includes(deck.id);

                            return (
                                <article
                                    key={deck.id}
                                    className={`group relative overflow-hidden rounded-xl border bg-[#161b22] transition ${selected
                                            ? "border-[#05C0D9] ring-1 ring-[#05C0D9]"
                                            : "border-slate-800 hover:border-slate-600"
                                        }`}
                                >
                                    <div className="flex h-32 items-center justify-center border-b border-slate-800 bg-[#0d1117] p-4">
                                        <span className="text-3xl font-bold text-slate-700">
                                            {deck.title
                                                .trim()
                                                .charAt(0)
                                                .toUpperCase() || "D"}
                                        </span>

                                        <label className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-md border border-slate-700 bg-[#161b22]/90">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() =>
                                                    toggleSelection(deck.id)
                                                }
                                                aria-label={`Select ${deck.title}`}
                                                className="size-4 accent-[#05C0D9]"
                                            />
                                        </label>
                                    </div>

                                    <div className="p-4">
                                        <Link
                                            to="/edit/$id"
                                            params={{ id: deck.id }}
                                            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#05C0D9]"
                                        >
                                            <h2 className="truncate font-semibold text-white transition group-hover:text-[#05C0D9]">
                                                {deck.title || "Untitled"}
                                            </h2>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Updated{" "}
                                                {new Date(
                                                    deck.updatedAt,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    },
                                                )}
                                            </p>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-6 py-12 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-slate-800 text-2xl text-[#05C0D9]">
                        <LayersPlus />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                        No decks yet
                    </h2>

                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                        Create your first slide deck in seconds.
                    </p>

                    <Link
                        to="/new"
                        className="mt-5 rounded-lg bg-[#05C0D9] px-4 py-2.5 text-sm uppercase font-mono font-semibold text-[#0d1117] transition hover:bg-cyan-300"
                    >
                        Create your first deck
                    </Link>
                </div>
            )}
        </main>
    );
}

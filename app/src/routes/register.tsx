
import { useState } from "react";
import type React from "react";
import { createFileRoute, HeadContent, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/register")({
    head: () =>
        createPageHead({
            title: "Register | oSlides",
            description:
                "Register an account to oSlides to create and manage and present Markdown-native slides integrated with in-slide live code blocks.",
        }),
    component: RegisterRoute,
});

function RegisterRoute() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(
        event: Parameters<
            NonNullable<React.ComponentProps<"form">["onSubmit"]>
        >[0],
    ) {
        event.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            const result = await register(
                email.trim(),
                password,
                displayName.trim(),
            );

            if (result.requiresEmailConfirmation) {
                setMessage(
                    "Account created. Check your email to confirm your account before logging in.",
                );
                return;
            }

            await navigate({ to: "/new" });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create your account. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <HeadContent />
            <main className="flex min-h-[calc(100dvh-60px)] items-center justify-center bg-[#0d1117] px-4 py-12 text-[#e6edf3]">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold">Create your account</h1>

                    <p className="mt-2 text-slate-400">
                        Get started with oSlide.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label
                                htmlFor="displayName"
                                className="mb-2 block text-sm font-medium"
                            >
                                Display name
                            </label>

                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                autoComplete="nickname"
                                required
                                minLength={1}
                                maxLength={80}
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                className="w-full rounded-md border border-slate-700 bg-[#161b22] px-3 py-2.5 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                maxLength={254}
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-[#161b22] px-3 py-2.5 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={128}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-[#161b22] px-3 py-2.5 outline-none focus:border-blue-500"
                            />

                            <p className="mt-1 text-xs text-slate-500">
                                Use at least 8 characters.
                            </p>
                        </div>

                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium"
                            >
                                Confirm password
                            </label>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={8}
                                maxLength={128}
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                className="w-full rounded-md border border-slate-700 bg-[#161b22] px-3 py-2.5 outline-none focus:border-blue-500"
                            />
                        </div>

                        {error && (
                            <p role="alert" className="text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        {message && (
                            <p role="status" className="text-sm text-green-400">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-md bg-[#05C0D9] px-4 py-3 font-medium text-black hover:bg-[#05C0D9]/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-white underline underline-offset-4"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
}

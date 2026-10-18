import { useState } from "react";
import { createFileRoute, HeadContent, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { createPageHead } from "@/lib/seo";


export const Route = createFileRoute("/login")({
  head: () =>
    createPageHead({
      title: "Log In | oSlides",
      description:
        "Log in to oSlides to access and manage your slides.",
    }),
  component: LoginRoute,
});

function LoginRoute() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(
    event: Parameters<
      NonNullable<React.ComponentProps<"form">["onSubmit"]>
    >[0],
  ) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      await navigate({ to: "/new" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <HeadContent />
      <main className="flex min-h-[calc(100dvh-60px) items-center justify-center bg-[#0d1117] px-4 py-12 text-[#e6edf3]">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-400">
            Log in to continue to oSlide.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>
              <input
                id="email"
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
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-[#161b22] px-3 py-2.5 outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-[#05C0D9] px-4 py-3 font-medium text-black hover:bg-[#05C0D9]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-white underline underline-offset-4"
            >
              Create one
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

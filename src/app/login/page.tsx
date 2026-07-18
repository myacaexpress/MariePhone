"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) {
      router.replace("/");
    } else {
      setError("Wrong password");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950">
      <form
        onSubmit={submit}
        className="w-full max-w-xs rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-900"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-sky-400 to-blue-600 text-3xl">
            💬
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Tribe Harbor Phone
          </h1>
          <p className="text-sm text-neutral-500">Trifecta Benefits</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
        />
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}

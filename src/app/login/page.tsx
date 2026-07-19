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
    <main
      className="flex min-h-screen items-center justify-center"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% -10%, rgba(10,122,255,0.12), transparent 60%), var(--bg-main)",
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-[320px] rounded-[26px] p-9 text-center shadow-xl backdrop-blur-2xl"
        style={{
          background: "var(--bg-sidebar)",
          border: "1px solid var(--hairline)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[17px] shadow-lg"
          style={{
            background: "linear-gradient(180deg, #5ac8fa 0%, #0a7aff 100%)",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
            <path d="M12 3C6.8 3 2.6 6.6 2.6 11c0 2.5 1.3 4.7 3.4 6.2-.1 1-.6 2.1-1.5 3 1.8-.1 3.3-.7 4.4-1.5 1 .3 2 .4 3.1.4 5.2 0 9.4-3.6 9.4-8S17.2 3 12 3Z" />
          </svg>
        </div>
        <h1 className="text-[19px] font-semibold tracking-tight">
          Tribe Harbor Phone
        </h1>
        <p className="mb-7 text-[13px] text-[color:var(--text-secondary)]">
          Trifecta Benefits
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="mb-3 w-full rounded-[10px] bg-[color:var(--field)] px-3.5 py-2.5 text-center text-[15px] outline-none ring-[#0a7aff]/60 transition-shadow focus:ring-2 placeholder:text-[color:var(--text-secondary)]"
        />
        {error && <p className="mb-3 text-[13px] text-[#ff3b30]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-[10px] bg-[#0a7aff] py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </main>
  );
}

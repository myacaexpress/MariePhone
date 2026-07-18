"use client";

import { useState } from "react";

export default function NewMessageModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (sid: string) => void;
}) {
  const [numbers, setNumbers] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const addresses = numbers
      .split(/[,\n;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (addresses.length === 0) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addresses,
        friendlyName: name.trim() || undefined,
      }),
    });
    setBusy(false);
    if (res.ok) {
      const { sid } = await res.json();
      onCreated(sid);
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "Could not start the conversation");
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={create}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <h2 className="mb-4 text-lg font-semibold">New Message</h2>
        <label className="mb-1 block text-sm text-neutral-500">
          To (one or more numbers — separate with commas for a group text)
        </label>
        <textarea
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
          rows={2}
          autoFocus
          placeholder="(555) 123-4567, (555) 987-6543"
          className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
        <label className="mb-1 block text-sm text-neutral-500">
          Name (optional)
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Team"
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-800"
        />
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !numbers.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {busy ? "Creating…" : "Start"}
          </button>
        </div>
      </form>
    </div>
  );
}

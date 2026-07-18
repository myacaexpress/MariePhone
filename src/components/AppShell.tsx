"use client";

import { useMemo, useState } from "react";
import DialerModal from "./DialerModal";
import ConversationView from "./ConversationView";
import NewMessageModal from "./NewMessageModal";
import ThreadList from "./ThreadList";
import { useTwilio } from "./TwilioProvider";
import VoiceOverlay from "./VoiceOverlay";

export default function AppShell() {
  const { status, errorMessage, conversations } = useTwilio();
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [showDialer, setShowDialer] = useState(false);
  const [showCompose, setShowCompose] = useState(false);

  const selected = useMemo(
    () => conversations.find((c) => c.sid === selectedSid) ?? null,
    [conversations, selectedSid],
  );

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-lg font-semibold">Can’t connect</h1>
          <p className="text-sm text-neutral-500">{errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden">
      <VoiceOverlay />

      <aside className="flex w-80 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">Messages</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setShowDialer(true)}
              title="Make a call"
              aria-label="Make a call"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              📞
            </button>
            <button
              onClick={() => setShowCompose(true)}
              title="New message"
              aria-label="New message"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              ✏️
            </button>
          </div>
        </div>
        <ThreadList selectedSid={selectedSid} onSelect={setSelectedSid} />
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="border-t border-neutral-200 px-4 py-2 text-left text-xs text-neutral-400 hover:text-neutral-600 dark:border-neutral-800"
        >
          Sign out
        </button>
      </aside>

      {selected ? (
        <ConversationView key={selected.sid} conversation={selected} />
      ) : (
        <div className="flex flex-1 items-center justify-center text-neutral-400">
          {status === "loading"
            ? "Connecting…"
            : "Select a conversation or start a new one"}
        </div>
      )}

      {showDialer && <DialerModal onClose={() => setShowDialer(false)} />}
      {showCompose && (
        <NewMessageModal
          onClose={() => setShowCompose(false)}
          onCreated={(sid) => {
            setShowCompose(false);
            setSelectedSid(sid);
          }}
        />
      )}
    </main>
  );
}

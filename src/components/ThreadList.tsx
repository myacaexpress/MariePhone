"use client";

import { useEffect, useState } from "react";
import type { Conversation } from "@twilio/conversations";
import { formatPhone, formatTime } from "@/lib/format";
import { useTwilio } from "./TwilioProvider";

export function conversationTitle(conversation: Conversation): string {
  const name = conversation.friendlyName;
  if (name) {
    // friendlyName is often a comma-joined list of E.164 numbers.
    return name
      .split(",")
      .map((part) => formatPhone(part.trim()))
      .join(", ");
  }
  return "Conversation";
}

function ThreadRow({
  conversation,
  selected,
  onSelect,
}: {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
}) {
  const { messagesVersion } = useTwilio();
  const [preview, setPreview] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [page, count] = await Promise.all([
          conversation.getMessages(1),
          conversation.getUnreadMessagesCount(),
        ]);
        if (cancelled) return;
        const last = page.items[page.items.length - 1];
        setPreview(last?.body ?? (last ? "Attachment" : "No messages yet"));
        setUnread(count ?? 0);
      } catch {
        // leave defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversation, messagesVersion]);

  const when =
    conversation.lastMessage?.dateCreated ?? conversation.dateCreated;

  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3 text-left transition dark:border-neutral-800 ${
        selected
          ? "bg-blue-600 text-white"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      <div
        className={`h-2 w-2 shrink-0 rounded-full ${
          unread > 0 && !selected ? "bg-blue-500" : "bg-transparent"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">
            {conversationTitle(conversation)}
          </span>
          <span
            className={`shrink-0 text-xs ${
              selected ? "text-blue-100" : "text-neutral-400"
            }`}
          >
            {formatTime(when)}
          </span>
        </div>
        <p
          className={`truncate text-sm ${
            selected ? "text-blue-100" : "text-neutral-500"
          }`}
        >
          {preview}
        </p>
      </div>
    </button>
  );
}

export default function ThreadList({
  selectedSid,
  onSelect,
}: {
  selectedSid: string | null;
  onSelect: (sid: string) => void;
}) {
  const { conversations, status } = useTwilio();

  if (status === "loading") {
    return (
      <p className="p-4 text-sm text-neutral-400">Loading conversations…</p>
    );
  }
  if (conversations.length === 0) {
    return (
      <p className="p-4 text-sm text-neutral-400">
        No conversations yet. Start one with the compose button.
      </p>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((c) => (
        <ThreadRow
          key={c.sid}
          conversation={c}
          selected={c.sid === selectedSid}
          onSelect={() => onSelect(c.sid)}
        />
      ))}
    </div>
  );
}

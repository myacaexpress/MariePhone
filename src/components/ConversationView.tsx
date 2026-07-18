"use client";

import { useEffect, useRef, useState } from "react";
import type { Conversation, Message } from "@twilio/conversations";
import { formatPhone } from "@/lib/format";
import { conversationTitle } from "./ThreadList";
import { useTwilio } from "./TwilioProvider";

function authorLabel(author: string | null, identity: string): string {
  if (!author || author === identity) return "Me";
  return formatPhone(author);
}

export default function ConversationView({
  conversation,
}: {
  conversation: Conversation;
}) {
  const { identity, messagesVersion } = useTwilio();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await conversation.getMessages(50);
        if (!cancelled) setMessages(page.items);
        await conversation.setAllMessagesRead();
      } catch {
        // keep whatever we have
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [conversation, messagesVersion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [messages.length, conversation.sid]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await conversation.sendMessage(text);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  // Group thread = more than one non-me participant (label senders).
  const [isGroup, setIsGroup] = useState(false);
  useEffect(() => {
    conversation
      .getParticipants()
      .then((ps) => setIsGroup(ps.length > 2))
      .catch(() => setIsGroup(false));
  }, [conversation]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <header className="flex items-center border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
        <h2 className="truncate font-semibold">
          {conversationTitle(conversation)}
        </h2>
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto px-5 py-4">
        {messages.map((message, i) => {
          const mine = (message.author ?? "") === identity;
          const prev = messages[i - 1];
          const newSender = !prev || prev.author !== message.author;
          return (
            <div
              key={message.sid}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              {isGroup && !mine && newSender && (
                <span className="mb-0.5 ml-3 mt-2 text-xs text-neutral-400">
                  {authorLabel(message.author, identity)}
                </span>
              )}
              <div
                className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-[15px] ${
                  mine
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                }`}
              >
                {message.body ?? "Attachment"}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <footer className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Text Message"
            className="max-h-32 flex-1 resize-none rounded-2xl border border-neutral-300 px-4 py-2 text-[15px] outline-none focus:border-blue-500 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:opacity-40"
          >
            ↑
          </button>
        </form>
      </footer>
    </div>
  );
}

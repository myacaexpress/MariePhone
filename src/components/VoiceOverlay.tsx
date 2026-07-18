"use client";

import { useEffect, useState } from "react";
import { formatPhone } from "@/lib/format";
import { useTwilio } from "./TwilioProvider";

function CallTimer({ startedAt }: { startedAt: number }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const update = () =>
      setSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span className="tabular-nums text-neutral-300">
      {mm}:{ss}
    </span>
  );
}

/** Incoming-call banner and active-call bar, shown above everything. */
export default function VoiceOverlay() {
  const { voice, muted, acceptIncoming, rejectIncoming, hangup, toggleMute } =
    useTwilio();

  if (voice.kind === "idle") return null;

  if (voice.kind === "incoming") {
    return (
      <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-neutral-900 px-6 py-4 text-white shadow-2xl">
        <div>
          <p className="text-sm text-neutral-400">Incoming call</p>
          <p className="font-semibold">{formatPhone(voice.from)}</p>
        </div>
        <button
          onClick={rejectIncoming}
          className="rounded-full bg-red-600 px-4 py-2 font-medium hover:bg-red-500"
        >
          Decline
        </button>
        <button
          onClick={acceptIncoming}
          className="rounded-full bg-green-600 px-4 py-2 font-medium hover:bg-green-500"
        >
          Accept
        </button>
      </div>
    );
  }

  const peer = voice.kind === "connecting" ? voice.to : voice.peer;
  return (
    <div className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-neutral-900 px-6 py-3 text-white shadow-2xl">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span className="font-semibold">{formatPhone(peer)}</span>
        {voice.kind === "active" ? (
          <CallTimer startedAt={voice.startedAt} />
        ) : (
          <span className="text-neutral-400">Calling…</span>
        )}
      </div>
      {voice.kind === "active" && (
        <button
          onClick={toggleMute}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            muted
              ? "bg-white text-neutral-900"
              : "bg-neutral-700 hover:bg-neutral-600"
          }`}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      )}
      <button
        onClick={hangup}
        className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-medium hover:bg-red-500"
      >
        End
      </button>
    </div>
  );
}

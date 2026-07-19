"use client";

import { useEffect, useState } from "react";
import { formatPhone } from "@/lib/format";
import Avatar from "./Avatar";
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
    <span className="tabular-nums text-[13px] text-white/60">
      {mm}:{ss}
    </span>
  );
}

function PhoneGlyph({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={down ? { transform: "rotate(135deg)" } : undefined}
    >
      <path d="M6.6 3.2c.6-.6 1.6-.6 2.2.1l1.9 2.3c.5.6.5 1.5 0 2.1l-1 1.2c-.2.3-.3.7-.1 1 .8 1.6 2.9 3.7 4.5 4.5.3.2.7.1 1-.1l1.2-1c.6-.5 1.5-.5 2.1 0l2.3 1.9c.7.6.7 1.6.1 2.2l-1.2 1.3c-.6.6-1.5.9-2.3.7-3.2-.8-6.2-2.5-8.6-4.9S4.7 9.1 3.9 5.9c-.2-.8 0-1.7.7-2.3l2-.4Z" />
    </svg>
  );
}

/** iOS-style incoming-call banner and active-call pill. */
export default function VoiceOverlay() {
  const { voice, muted, acceptIncoming, rejectIncoming, hangup, toggleMute } =
    useTwilio();

  if (voice.kind === "idle") return null;

  const shellClass =
    "fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-[22px] shadow-2xl backdrop-blur-2xl";
  const shellStyle = {
    background: "rgba(28, 28, 30, 0.88)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  if (voice.kind === "incoming") {
    return (
      <div className={`${shellClass} flex items-center gap-5 py-3 pl-4 pr-3`} style={shellStyle}>
        <div className="flex items-center gap-3">
          <Avatar size={40} />
          <div>
            <p className="text-[11px] leading-tight text-white/55">
              Trifecta Benefits line
            </p>
            <p className="text-[15px] font-semibold leading-tight text-white">
              {formatPhone(voice.from)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={rejectIncoming}
            aria-label="Decline"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff3b30] text-white transition-opacity hover:opacity-85"
          >
            <PhoneGlyph down />
          </button>
          <button
            onClick={acceptIncoming}
            aria-label="Accept"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#30d158] text-white transition-opacity hover:opacity-85"
          >
            <PhoneGlyph />
          </button>
        </div>
      </div>
    );
  }

  const peer = voice.kind === "connecting" ? voice.to : voice.peer;
  return (
    <div className={`${shellClass} flex items-center gap-4 px-4 py-2.5`} style={shellStyle}>
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#30d158]" />
        <span className="text-[14px] font-semibold text-white">
          {formatPhone(peer)}
        </span>
        {voice.kind === "active" ? (
          <CallTimer startedAt={voice.startedAt} />
        ) : (
          <span className="text-[13px] text-white/60">calling…</span>
        )}
      </div>
      {voice.kind === "active" && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
            muted ? "bg-white text-black" : "bg-white/15 text-white hover:bg-white/25"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15a3.4 3.4 0 0 0 3.4-3.4V5.4a3.4 3.4 0 1 0-6.8 0v6.2A3.4 3.4 0 0 0 12 15Z" />
            <path d="M18.6 11.6a.9.9 0 1 0-1.8 0 4.8 4.8 0 0 1-9.6 0 .9.9 0 1 0-1.8 0 6.6 6.6 0 0 0 5.7 6.5v2h-2a.9.9 0 1 0 0 1.9h5.8a.9.9 0 1 0 0-1.9h-2v-2a6.6 6.6 0 0 0 5.7-6.5Z" />
            {muted && (
              <path d="M4 3 21 20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            )}
          </svg>
        </button>
      )}
      <button
        onClick={hangup}
        aria-label="End call"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff3b30] text-white transition-opacity hover:opacity-85"
      >
        <PhoneGlyph down />
      </button>
    </div>
  );
}

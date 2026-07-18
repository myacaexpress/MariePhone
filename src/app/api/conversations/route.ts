import { NextResponse } from "next/server";
import { CLIENT_IDENTITY, env } from "@/lib/env";
import { restClient } from "@/lib/twilio-server";

function normalizeE164(raw: string): string | null {
  const cleaned = raw.replace(/[\s()-.]/g, "");
  if (/^\+[0-9]{8,15}$/.test(cleaned)) return cleaned;
  // Assume US 10-digit numbers.
  if (/^[0-9]{10}$/.test(cleaned)) return `+1${cleaned}`;
  if (/^1[0-9]{10}$/.test(cleaned)) return `+${cleaned}`;
  return null;
}

/**
 * Create a new thread (auth enforced by middleware).
 * Body: { addresses: string[], friendlyName?: string }
 *
 * 1:1 threads bind the peer with proxyAddress = business number.
 * Group threads (2+ peers) use projectedAddress so everyone lands in one
 * native group MMS thread on their phones.
 */
export async function POST(request: Request) {
  let addresses: string[] = [];
  let friendlyName: string | undefined;
  try {
    const body = await request.json();
    if (Array.isArray(body.addresses)) {
      addresses = body.addresses.filter((a: unknown) => typeof a === "string");
    }
    if (typeof body.friendlyName === "string" && body.friendlyName.trim()) {
      friendlyName = body.friendlyName.trim();
    }
  } catch {
    // handled below
  }

  const normalized: string[] = [];
  for (const raw of addresses) {
    const e164 = normalizeE164(raw);
    if (!e164) {
      return NextResponse.json(
        { error: `Invalid phone number: ${raw}` },
        { status: 400 },
      );
    }
    normalized.push(e164);
  }
  if (normalized.length === 0) {
    return NextResponse.json(
      { error: "At least one phone number is required" },
      { status: 400 },
    );
  }

  const client = restClient();
  const service = client.conversations.v1.services(
    env.twilioConversationsServiceSid,
  );

  const conversation = await service.conversations.create({
    friendlyName: friendlyName ?? normalized.join(", "),
  });

  try {
    const isGroup = normalized.length > 1;
    for (const address of normalized) {
      await service
        .conversations(conversation.sid)
        .participants.create(
          isGroup
            ? {
                "messagingBinding.address": address,
                "messagingBinding.projectedAddress": env.twilioPhoneNumber,
              }
            : {
                "messagingBinding.address": address,
                "messagingBinding.proxyAddress": env.twilioPhoneNumber,
              },
        );
    }
    await service
      .conversations(conversation.sid)
      .participants.create({ identity: CLIENT_IDENTITY });
  } catch (error) {
    // Clean up the half-built conversation so retries start fresh
    // (e.g. the peer number is already bound to another 1:1 thread).
    await service.conversations(conversation.sid).remove();
    const message =
      error instanceof Error ? error.message : "Failed to add participants";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ sid: conversation.sid });
}

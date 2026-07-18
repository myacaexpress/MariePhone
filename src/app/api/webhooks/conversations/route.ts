import { NextResponse } from "next/server";
import { CLIENT_IDENTITY, env } from "@/lib/env";
import {
  formParams,
  restClient,
  validateTwilioSignature,
} from "@/lib/twilio-server";

/**
 * Conversations service post-event webhook.
 *
 * When an inbound SMS/MMS auto-creates a conversation (including group texts
 * Marie is added to), the new conversation has only the SMS participants.
 * This hook joins Marie's chat identity so the thread appears in her app.
 */
export async function POST(request: Request) {
  const params = await formParams(request);
  if (!validateTwilioSignature(request, params)) {
    return new Response("invalid signature", { status: 403 });
  }

  if (params.EventType === "onConversationAdded" && params.ConversationSid) {
    const client = restClient();
    try {
      await client.conversations.v1
        .services(env.twilioConversationsServiceSid)
        .conversations(params.ConversationSid)
        .participants.create({ identity: CLIENT_IDENTITY });
    } catch (error) {
      // 50433: participant already exists — fine, nothing to do.
      const code = (error as { code?: number }).code;
      if (code !== 50433) throw error;
    }
  }

  return NextResponse.json({ ok: true });
}

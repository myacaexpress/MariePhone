import twilio from "twilio";
import { env } from "@/lib/env";
import { formParams, validateTwilioSignature } from "@/lib/twilio-server";

/**
 * Voice URL of the TwiML App. Twilio calls this when Marie's browser places
 * an outbound call; we bridge it to the dialed PSTN number with the business
 * number as caller ID.
 */
export async function POST(request: Request) {
  const params = await formParams(request);
  if (!validateTwilioSignature(request, params)) {
    return new Response("invalid signature", { status: 403 });
  }

  const twiml = new twilio.twiml.VoiceResponse();
  const to = params.To ?? "";

  if (/^\+?[0-9]{7,15}$/.test(to.replace(/[\s()-]/g, ""))) {
    const dial = twiml.dial({ callerId: env.twilioPhoneNumber, answerOnBridge: true });
    dial.number(to.replace(/[\s()-]/g, ""));
  } else {
    twiml.say("Invalid number.");
  }

  return new Response(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}

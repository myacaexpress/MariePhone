import { NextResponse } from "next/server";
import { CLIENT_IDENTITY, env } from "@/lib/env";
import { mintAccessToken } from "@/lib/twilio-server";

/** Auth is enforced by middleware; this only runs for a logged-in session. */
export async function GET() {
  return NextResponse.json({
    token: mintAccessToken(),
    identity: CLIENT_IDENTITY,
    businessNumber: env.twilioPhoneNumber,
  });
}

import twilio from "twilio";
import { jwt } from "twilio";
import { CLIENT_IDENTITY, env } from "./env";

/** REST client authenticated with the API key (not the auth token). */
export function restClient() {
  return twilio(env.twilioApiKeySid, env.twilioApiKeySecret, {
    accountSid: env.twilioAccountSid,
  });
}

/**
 * Mint an access token for Marie's browser: Voice (softphone) +
 * Conversations (messaging).
 */
export function mintAccessToken(): string {
  const token = new jwt.AccessToken(
    env.twilioAccountSid,
    env.twilioApiKeySid,
    env.twilioApiKeySecret,
    { identity: CLIENT_IDENTITY, ttl: 3600 },
  );
  token.addGrant(
    new jwt.AccessToken.VoiceGrant({
      outgoingApplicationSid: env.twilioTwimlAppSid,
      incomingAllow: true,
    }),
  );
  token.addGrant(
    new jwt.AccessToken.ChatGrant({
      serviceSid: env.twilioConversationsServiceSid,
    }),
  );
  return token.toJwt();
}

/**
 * Validate that a form-encoded POST genuinely came from Twilio.
 * Behind a proxy (Cloud Run), set APP_BASE_URL so the validated URL matches
 * what Twilio signed.
 */
export function validateTwilioSignature(
  request: Request,
  params: Record<string, string>,
): boolean {
  const signature = request.headers.get("x-twilio-signature");
  if (!signature) return false;
  const requestUrl = new URL(request.url);
  const url = env.appBaseUrl
    ? `${env.appBaseUrl.replace(/\/$/, "")}${requestUrl.pathname}${requestUrl.search}`
    : request.url;
  return twilio.validateRequest(env.twilioAuthToken, signature, url, params);
}

/** Parse a form-encoded webhook body into a plain object. */
export async function formParams(
  request: Request,
): Promise<Record<string, string>> {
  const body = await request.text();
  const params: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(body)) {
    params[key] = value;
  }
  return params;
}

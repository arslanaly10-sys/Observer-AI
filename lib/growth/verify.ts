/** Webhook signature checks for Meta, Twilio and Resend (Svix). All use constant-time comparison. */
import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Meta (WhatsApp Cloud API + Lead Ads): header `X-Hub-Signature-256: sha256=<hex>` over the raw body. */
export function verifyMeta(rawBody: string, header: string | null, appSecret: string | undefined) {
  if (!appSecret || !header?.startsWith("sha256=")) return false;
  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  return safeEqual(expected, header);
}

/** Twilio: `X-Twilio-Signature` = base64(HMAC-SHA1(authToken, url + sorted key/value pairs)). */
export function verifyTwilio(url: string, params: Record<string, string>, header: string | null, authToken: string | undefined) {
  if (!authToken || !header) return false;
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const expected = createHmac("sha1", authToken).update(data, "utf8").digest("base64");
  return safeEqual(expected, header);
}

/** Resend webhooks are signed with Svix: `svix-id`, `svix-timestamp`, `svix-signature: v1,<b64> v1,<b64>`. */
export function verifySvix(rawBody: string, headers: { id: string | null; timestamp: string | null; signature: string | null }, secret: string | undefined, now = Date.now()) {
  if (!secret || !headers.id || !headers.timestamp || !headers.signature) return false;
  const ts = Number(headers.timestamp);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > 300) return false; // 5-minute replay window
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${headers.id}.${headers.timestamp}.${rawBody}`, "utf8").digest("base64");
  return headers.signature.split(" ").some((part) => {
    const [ver, sig] = part.split(",");
    return ver === "v1" && !!sig && safeEqual(expected, sig);
  });
}

/** Short-lived signed tokens for URLs we hand to Twilio (e.g. the TTS audio link). */
export function signToken(payload: string, secret: string, ttlSeconds = 600, now = Date.now()) {
  const exp = Math.floor(now / 1000) + ttlSeconds;
  const sig = createHmac("sha256", secret).update(`${payload}.${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}
export function checkToken(payload: string, token: string | null, secret: string, now = Date.now()) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < now / 1000) return false;
  const expected = createHmac("sha256", secret).update(`${payload}.${exp}`).digest("base64url");
  return safeEqual(expected, sig);
}

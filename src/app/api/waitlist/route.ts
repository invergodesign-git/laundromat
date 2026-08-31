/**
 * Out-of-area enquiries.
 *
 * Someone whose address is beyond the delivery radius cannot be booked, but
 * turning them away with nothing loses a customer the business will want
 * later. Their details are captured here instead, and kept separate from real
 * orders so a pickup that needs driving to is never buried among leads.
 *
 * The distance is measured on the server, exactly as it is for a booking —
 * partly so the record is accurate, and partly so this endpoint cannot be
 * used to post arbitrary "addresses" that were never geocoded.
 */

import { BUSINESS } from "@/lib/business";
import { getEmailProvider, getOrderInbox, EmailError } from "@/lib/email";
import { getGeoProvider } from "@/lib/geo";
import { callerKey, RateLimiter } from "@/lib/geo/cache";
import {
  renderWaitlistCustomerEmail,
  renderWaitlistEmail,
} from "@/lib/orders/render";
import { validateWaitlistRequest } from "@/lib/orders/schema";
import type { WaitlistEntry } from "@/lib/orders/types";

const limiter = new RateLimiter(8, 60 * 60 * 1000);
const MAX_BODY_BYTES = 8 * 1024;

function error(status: number, message: string, fields?: Record<string, string>) {
  return Response.json({ error: message, fields }, { status });
}

export async function POST(request: Request) {
  if (!limiter.allow(callerKey(request))) {
    return error(429, "Too many submissions. Give us a call instead.");
  }

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return error(413, "That request was too large.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error(400, "We could not read that request.");
  }

  const validation = validateWaitlistRequest(body);
  if (!validation.ok || !validation.value) {
    return error(422, "Some details need another look.", validation.errors);
  }
  const submitted = validation.value;

  const geo = getGeoProvider();
  if (!geo) {
    return error(
      503,
      `We could not save that just now. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  let distanceMiles: number;
  try {
    distanceMiles = await geo.drivingDistanceMiles(
      { lat: submitted.address.lat, lon: submitted.address.lon },
      request.signal
    );
  } catch (caught) {
    console.error("[waitlist] distance lookup failed", caught);
    return error(
      503,
      `We could not save that just now. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  const entry: WaitlistEntry = {
    ...submitted,
    receivedAt: new Date().toISOString(),
    distanceMiles,
  };

  const email = getEmailProvider();
  const inbox = getOrderInbox();

  if (!email || !inbox) {
    console.error("[waitlist] email unconfigured — enquiry could not be saved");
    return error(
      503,
      `We could not save that just now. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  const notice = renderWaitlistEmail(entry);
  try {
    await email.send({
      to: inbox,
      subject: notice.subject,
      text: notice.text,
      html: notice.html,
      replyTo: entry.contact.email,
    });
  } catch (caught) {
    const message =
      caught instanceof EmailError ? caught.message : "Could not be sent.";
    console.error("[waitlist] failed to deliver enquiry", message);
    return error(
      502,
      `We could not save that just now. Please call ${BUSINESS.phoneDisplay}.`
    );
  }

  // Courtesy only — the business already has the lead.
  const confirmation = renderWaitlistCustomerEmail(entry);
  try {
    await email.send({
      to: entry.contact.email,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      replyTo: inbox,
    });
  } catch (caught) {
    console.error("[waitlist] confirmation email failed", caught);
  }

  return Response.json({ distanceMiles });
}

/**
 * Turns an order into the two emails it produces: a ticket for the business
 * and a confirmation for the customer.
 *
 * The business ticket is written to be worked from — everything needed to
 * drive out and collect is in it, in the order it gets used, so nobody has to
 * phone the customer back for a detail we already asked for.
 */

import {
  BUSINESS,
  CANCELLATION_POLICY,
  getPickupWindow,
} from "@/lib/business";
import { ADD_ONS, getTier, MIN_ORDER_LBS } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import type { Order, WaitlistEntry } from "./types";

function fullName(contact: { firstName: string; lastName: string }): string {
  return `${contact.firstName} ${contact.lastName}`.trim();
}

/**
 * Formats `YYYY-MM-DD` for a person. Parsed and rendered in UTC so the date
 * on the ticket is the date the customer chose, never a day either side of it.
 */
function formatPickupDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function describePickup(order: Order): string {
  const window = getPickupWindow(order.pickup.windowId);
  const day = formatPickupDate(order.pickup.date);
  return window ? `${day}, ${window.label}` : day;
}

function describeAddOns(order: Order): string {
  if (order.service.addOnIds.length === 0) return "None";
  return ADD_ONS.filter((addOn) => order.service.addOnIds.includes(addOn.id))
    .map((addOn) => `${addOn.label} (${addOn.rateLabel})`)
    .join(", ");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renders `label: value` rows, skipping anything empty. */
function rows(pairs: [string, string][]): string {
  return pairs
    .filter(([, value]) => value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Business ticket
// ---------------------------------------------------------------------------

export function renderBusinessEmail(order: Order): {
  subject: string;
  text: string;
  html: string;
} {
  const tier = getTier(order.service.tierId);
  const address = [order.address.label, order.address.context]
    .filter(Boolean)
    .join(", ");

  const subject = `${order.reference} — ${describePickup(order)} — ${
    order.address.label
  }`;

  const text = [
    `NEW PICKUP — ${order.reference}`,
    "",
    "COLLECT",
    rows([
      ["When", describePickup(order)],
      ["Where", address],
      ["Access notes", order.address.notes],
      ["Distance", `${order.distanceMiles} miles from the home office`],
    ]),
    "",
    "CUSTOMER",
    rows([
      ["Name", fullName(order.contact)],
      ["Phone", order.contact.phone],
      ["Email", order.contact.email],
    ]),
    "",
    "SERVICE",
    rows([
      ["Turnaround", `${tier.label} — ${formatCurrency(tier.ratePerLb)}/lb`],
      ["Add-ons", describeAddOns(order)],
      ["Weight (customer estimate)", `${order.service.estimatedWeightLbs} lbs`],
      ["Special instructions", order.instructions],
    ]),
    "",
    "ESTIMATE (not charged — weigh at pickup)",
    rows([
      [
        "Laundry",
        `${formatCurrency(order.laundryTotal)}${
          order.minimumApplied
            ? ` (billed at the ${MIN_ORDER_LBS} lb minimum)`
            : ""
        }`,
      ],
      ["Delivery", formatCurrency(order.deliveryFee)],
      ["Total", formatCurrency(order.total)],
    ]),
    "",
    `Received ${new Date(order.receivedAt).toLocaleString("en-US")}`,
  ].join("\n");

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;color:#1a1a1a">
  <p style="font:600 12px/1 monospace;letter-spacing:.1em;text-transform:uppercase;color:#666;margin:0 0 4px">New pickup</p>
  <h1 style="font-size:28px;margin:0 0 24px">${escapeHtml(order.reference)}</h1>

  <h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;border-bottom:1px solid #e5e5e5;padding-bottom:6px">Collect</h2>
  <p style="font-size:18px;font-weight:600;margin:12px 0 4px">${escapeHtml(
    describePickup(order)
  )}</p>
  <p style="font-size:16px;margin:0 0 4px">${escapeHtml(address)}</p>
  ${
    order.address.notes
      ? `<p style="font-size:15px;color:#444;margin:0 0 4px"><strong>Access:</strong> ${escapeHtml(
          order.address.notes
        )}</p>`
      : ""
  }
  <p style="font-size:14px;color:#666;margin:0">${order.distanceMiles} miles from the home office</p>

  <h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;border-bottom:1px solid #e5e5e5;padding-bottom:6px;margin-top:28px">Customer</h2>
  <p style="font-size:16px;margin:12px 0 0">${escapeHtml(
    fullName(order.contact)
  )}</p>
  <p style="font-size:16px;margin:4px 0 0"><a href="tel:${escapeHtml(
    order.contact.phone
  )}">${escapeHtml(order.contact.phone)}</a></p>
  <p style="font-size:16px;margin:4px 0 0"><a href="mailto:${escapeHtml(
    order.contact.email
  )}">${escapeHtml(order.contact.email)}</a></p>

  <h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;border-bottom:1px solid #e5e5e5;padding-bottom:6px;margin-top:28px">Service</h2>
  <p style="font-size:16px;margin:12px 0 0"><strong>${escapeHtml(
    tier.label
  )}</strong> — ${formatCurrency(tier.ratePerLb)}/lb</p>
  <p style="font-size:15px;color:#444;margin:4px 0 0">Add-ons: ${escapeHtml(
    describeAddOns(order)
  )}</p>
  <p style="font-size:15px;color:#444;margin:4px 0 0">Customer estimates ${
    order.service.estimatedWeightLbs
  } lbs</p>
  ${
    order.instructions
      ? `<p style="font-size:15px;color:#444;margin:8px 0 0"><strong>Notes:</strong> ${escapeHtml(
          order.instructions
        )}</p>`
      : ""
  }

  <h2 style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;border-bottom:1px solid #e5e5e5;padding-bottom:6px;margin-top:28px">Estimate</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:16px">
    <tr><td style="padding:6px 0">Laundry${
      order.minimumApplied
        ? ` <span style="color:#666;font-size:14px">(${MIN_ORDER_LBS} lb minimum)</span>`
        : ""
    }</td><td align="right">${formatCurrency(order.laundryTotal)}</td></tr>
    <tr><td style="padding:6px 0">Delivery</td><td align="right">${formatCurrency(
      order.deliveryFee
    )}</td></tr>
    <tr style="border-top:2px solid #1a1a1a;font-weight:700"><td style="padding:10px 0">Total</td><td align="right">${formatCurrency(
      order.total
    )}</td></tr>
  </table>
  <p style="font-size:14px;color:#666;margin:8px 0 0">Nothing has been charged. Weigh at pickup.</p>
</div>`.trim();

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Customer confirmation
// ---------------------------------------------------------------------------

export function renderCustomerEmail(order: Order): {
  subject: string;
  text: string;
  html: string;
} {
  const tier = getTier(order.service.tierId);
  const subject = `We've got your pickup — ${order.reference}`;

  const text = [
    `Hi ${order.contact.firstName},`,
    "",
    `We have your pickup booked. Your reference is ${order.reference}.`,
    "",
    rows([
      ["Pickup", describePickup(order)],
      ["Address", order.address.label],
      ["Service", `${tier.label} — ${tier.summary}`],
      ["Add-ons", describeAddOns(order)],
    ]),
    "",
    "YOUR ESTIMATE",
    rows([
      ["Laundry", formatCurrency(order.laundryTotal)],
      ["Delivery", formatCurrency(order.deliveryFee)],
      ["Estimated total", formatCurrency(order.total)],
    ]),
    "",
    `This is an estimate based on the ${order.service.estimatedWeightLbs} lbs you told us about. We weigh your bag when we collect it, and that weight is what you actually pay for. Nothing has been charged yet.`,
    "",
    order.minimumApplied
      ? `Heads up: orders are billed at a ${MIN_ORDER_LBS} lb minimum. If your bag comes in lighter, we may credit the difference against your next order.`
      : "",
    "",
    "IF YOU NEED TO CANCEL",
    CANCELLATION_POLICY.terms.map((term) => `- ${term}`).join("\n"),
    "",
    `Need to change something? Call us on ${BUSINESS.phoneDisplay} or reply to this email and quote ${order.reference}.`,
    "",
    BUSINESS.name,
  ]
    .filter((block, index, all) => !(block === "" && all[index - 1] === ""))
    .join("\n");

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;color:#1a1a1a">
  <p style="font-size:17px;margin:0 0 16px">Hi ${escapeHtml(
    order.contact.firstName
  )},</p>
  <p style="font-size:17px;line-height:1.6;margin:0 0 24px">We have your pickup booked. Your reference is <strong>${escapeHtml(
    order.reference
  )}</strong>.</p>

  <div style="background:#f4f7f9;border-radius:16px;padding:20px 24px;margin-bottom:24px">
    <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;margin:0 0 10px">We'll collect</p>
    <p style="font-size:19px;font-weight:600;margin:0 0 4px">${escapeHtml(
      describePickup(order)
    )}</p>
    <p style="font-size:16px;color:#444;margin:0">${escapeHtml(
      order.address.label
    )}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;font-size:16px">
    <tr><td style="padding:6px 0;color:#444">${escapeHtml(
      tier.label
    )}</td><td align="right">${formatCurrency(order.laundryTotal)}</td></tr>
    <tr><td style="padding:6px 0;color:#444">Delivery</td><td align="right">${formatCurrency(
      order.deliveryFee
    )}</td></tr>
    <tr style="border-top:2px solid #1a1a1a;font-weight:700"><td style="padding:10px 0">Estimated total</td><td align="right">${formatCurrency(
      order.total
    )}</td></tr>
  </table>

  <p style="font-size:15px;line-height:1.6;color:#555;margin:20px 0 0">
    This is an estimate based on the ${
      order.service.estimatedWeightLbs
    } lbs you told us about. We weigh your bag when we collect it, and that weight is what you actually pay for. <strong>Nothing has been charged yet.</strong>
  </p>
  ${
    order.minimumApplied
      ? `<p style="font-size:15px;line-height:1.6;color:#555;margin:12px 0 0">Orders are billed at a ${MIN_ORDER_LBS} lb minimum. If your bag comes in lighter, we may credit the difference against your next order.</p>`
      : ""
  }

  <div style="background:#f4f7f9;border-radius:16px;padding:18px 22px;margin-top:24px">
    <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#666;margin:0 0 8px">If you need to cancel</p>
    <p style="font-size:15px;font-weight:600;margin:0 0 8px">${escapeHtml(
      CANCELLATION_POLICY.headline
    )}</p>
    <ul style="font-size:14px;line-height:1.6;color:#555;margin:0;padding-left:18px">
      ${CANCELLATION_POLICY.terms
        .map((term) => `<li>${escapeHtml(term)}</li>`)
        .join("")}
    </ul>
  </div>

  <p style="font-size:15px;line-height:1.6;color:#555;margin:24px 0 0">
    Need to change something? Call <a href="${escapeHtml(
      BUSINESS.phoneHref
    )}">${escapeHtml(
      BUSINESS.phoneDisplay
    )}</a> or reply to this email and quote ${escapeHtml(order.reference)}.
  </p>
  <p style="font-size:15px;margin:20px 0 0">${escapeHtml(BUSINESS.name)}</p>
</div>`.trim();

  return { subject, text, html };
}

// ---------------------------------------------------------------------------
// Out-of-area enquiry
// ---------------------------------------------------------------------------

/**
 * Someone the business cannot serve yet. Sent as its own email rather than
 * mixed in with real orders, so a full inbox never buries a job that needs
 * driving to — and so the list is easy to pull out later for marketing.
 */
export function renderWaitlistEmail(entry: WaitlistEntry): {
  subject: string;
  text: string;
  html: string;
} {
  const address = [entry.address.label, entry.address.context]
    .filter(Boolean)
    .join(", ");
  const subject = `Outside the area — ${address}`;

  const text = [
    "OUT-OF-AREA ENQUIRY",
    "",
    "This is not a booking. Nobody is expecting a pickup.",
    "",
    rows([
      ["Name", fullName(entry.contact)],
      ["Phone", entry.contact.phone],
      ["Email", entry.contact.email],
      ["Address", address],
      ["Distance", `${entry.distanceMiles} miles from the home office`],
    ]),
    "",
    `Received ${new Date(entry.receivedAt).toLocaleString("en-US")}`,
  ].join("\n");

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;color:#1a1a1a">
  <p style="font:600 12px/1 monospace;letter-spacing:.1em;text-transform:uppercase;color:#666;margin:0 0 4px">Out-of-area enquiry</p>
  <h1 style="font-size:24px;margin:0 0 8px">${escapeHtml(address)}</h1>
  <p style="font-size:15px;color:#666;margin:0 0 24px">${
    entry.distanceMiles
  } miles out. This is not a booking — nobody is expecting a pickup.</p>

  <p style="font-size:16px;margin:0">${escapeHtml(fullName(entry.contact))}</p>
  <p style="font-size:16px;margin:4px 0 0"><a href="tel:${escapeHtml(
    entry.contact.phone
  )}">${escapeHtml(entry.contact.phone)}</a></p>
  <p style="font-size:16px;margin:4px 0 0"><a href="mailto:${escapeHtml(
    entry.contact.email
  )}">${escapeHtml(entry.contact.email)}</a></p>
</div>`.trim();

  return { subject, text, html };
}

/** Confirmation to the person who is outside the area. */
export function renderWaitlistCustomerEmail(entry: WaitlistEntry): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Thanks — we'll let you know";

  const text = [
    `Hi ${entry.contact.firstName},`,
    "",
    `Thanks for getting in touch. Your address is about ${entry.distanceMiles} miles from us, which is a bit further than we currently drive, so we cannot book you a pickup just yet.`,
    "",
    "We have kept your details and will let you know as soon as we cover your area.",
    "",
    `If it is urgent, do call us on ${BUSINESS.phoneDisplay} — longer runs are sometimes possible, we just price them by hand.`,
    "",
    BUSINESS.name,
  ].join("\n");

  const html = `
<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;color:#1a1a1a">
  <p style="font-size:17px;margin:0 0 16px">Hi ${escapeHtml(
    entry.contact.firstName
  )},</p>
  <p style="font-size:17px;line-height:1.6;margin:0 0 16px">Thanks for getting in touch. Your address is about ${
    entry.distanceMiles
  } miles from us, which is a bit further than we currently drive, so we cannot book you a pickup just yet.</p>
  <p style="font-size:17px;line-height:1.6;margin:0 0 16px">We have kept your details and will let you know as soon as we cover your area.</p>
  <p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 20px">If it is urgent, do call us on <a href="${escapeHtml(
    BUSINESS.phoneHref
  )}">${escapeHtml(
    BUSINESS.phoneDisplay
  )}</a> — longer runs are sometimes possible, we just price them by hand.</p>
  <p style="font-size:15px;margin:0">${escapeHtml(BUSINESS.name)}</p>
</div>`.trim();

  return { subject, text, html };
}

/**
 * One-off check: exercises the /api/book and /api/waitlist intake against a
 * running dev server.
 *
 * Usage: node scripts/check-booking.mjs [baseUrl]
 */

const BASE = process.argv[2] ?? "http://localhost:3005";

/** A weekday inside the booking window, so the date/window pairing is valid. */
function nextWeekday() {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

async function post(label, body, path = "/api/book") {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  console.log(`\n── ${label}`);
  console.log(`   HTTP ${response.status}`);
  console.log(`   ${JSON.stringify(payload, null, 2).replace(/\n/g, "\n   ")}`);
  return { status: response.status, payload };
}

// A real address near the home office, resolved through our own suggest route.
async function findAddress(query) {
  const url = new URL("/api/address/suggest", BASE);
  url.searchParams.set("q", query);
  const data = await (await fetch(url)).json();
  return data.suggestions?.[0] ?? null;
}

const CUSTOMER = {
  firstName: "Test",
  lastName: "Customer",
  phone: "6195550142",
  email: "t@example.com",
};

await post("rejects an empty submission", {
  contact: { firstName: "", lastName: "", phone: "123", email: "nope" },
  address: { label: "" },
  service: { tierId: "bogus", addOnIds: [], estimatedWeightLbs: 0 },
  pickup: { date: "2020-01-01", windowId: "nope" },
});

const address = await findAddress("Camino De La Reina, San Diego");
if (!address) {
  console.log("\nNo address suggestion returned — is GEOAPIFY_API_KEY set?");
  process.exit(1);
}
console.log(`\nUsing address: ${address.label}, ${address.context}`);

// The shop is on Pacific time; "today" there is what the server must judge by.
const pacificToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const pacificTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
}).format(new Date());
console.log(`Pacific now: ${pacificToday} ${pacificTime}`);

// Picks whichever window runs today, so the "already passed" rule is tested
// against a real slot rather than one the schedule never ran.
const isWeekend = [0, 6].includes(
  new Date(`${pacificToday}T00:00:00Z`).getUTCDay()
);
await post("checks today's own window against the clock", {
  contact: CUSTOMER,
  address: { ...address, notes: "" },
  service: { tierId: "2-day", addOnIds: [], estimatedWeightLbs: 30 },
  pickup: {
    date: pacificToday,
    windowId: isWeekend ? "weekend-day" : "weekday-day",
  },
  acceptedCancellationPolicy: true,
});

await post("rejects a weekend window on a weekday", {
  contact: CUSTOMER,
  address: { ...address, notes: "" },
  service: { tierId: "2-day", addOnIds: [], estimatedWeightLbs: 30 },
  pickup: { date: nextWeekday(), windowId: "weekend-day" },
  acceptedCancellationPolicy: true,
});

await post("rejects a booking without the cancellation agreement", {
  contact: CUSTOMER,
  address: { ...address, notes: "" },
  service: { tierId: "2-day", addOnIds: [], estimatedWeightLbs: 30 },
  pickup: { date: nextWeekday(), windowId: "weekday-day" },
  acceptedCancellationPolicy: false,
});

await post("accepts a complete booking", {
  contact: CUSTOMER,
  address: { ...address, notes: "Apt 2, gate code 1234" },
  service: {
    tierId: "2-day",
    addOnIds: ["stain-treatment"],
    estimatedWeightLbs: 30,
  },
  pickup: { date: nextWeekday(), windowId: "weekday-day" },
  instructions: "Grey blanket is delicate",
  acceptedCancellationPolicy: true,
});

// ---- Out-of-area capture ---------------------------------------------------
// Coordinates are hard-coded rather than looked up: the suggest route only
// returns addresses near the home office, which is exactly the case this
// check needs to fall outside of. Wilshire Blvd, Los Angeles — ~120 miles out.
await post(
  "keeps an out-of-area enquiry",
  {
    contact: CUSTOMER,
    address: {
      label: "Wilshire Blvd",
      context: "Los Angeles, CA 90010",
      lat: 34.0619,
      lon: -118.3005,
      notes: "",
    },
  },
  "/api/waitlist"
);

await post(
  "rejects an out-of-area enquiry with no contact details",
  { contact: {}, address: { label: "" } },
  "/api/waitlist"
);

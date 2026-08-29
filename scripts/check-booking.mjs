/**
 * One-off check: exercises the /api/book intake against a running dev server.
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

async function post(label, body) {
  const response = await fetch(`${BASE}/api/book`, {
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

await post("rejects an empty submission", {
  contact: { name: "", phone: "123", email: "nope" },
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
  contact: { name: "Test Customer", phone: "6195550142", email: "t@example.com" },
  address: { ...address, notes: "" },
  service: { tierId: "2-day", addOnIds: [], estimatedWeightLbs: 30 },
  pickup: {
    date: pacificToday,
    windowId: isWeekend ? "weekend-day" : "weekday-day",
  },
});

await post("rejects a weekend window on a weekday", {
  contact: { name: "Test Customer", phone: "6195550142", email: "t@example.com" },
  address: { ...address, notes: "" },
  service: { tierId: "2-day", addOnIds: [], estimatedWeightLbs: 30 },
  pickup: { date: nextWeekday(), windowId: "weekend-day" },
});

await post("accepts a complete booking", {
  contact: { name: "Test Customer", phone: "6195550142", email: "t@example.com" },
  address: { ...address, notes: "Apt 2, gate code 1234" },
  service: {
    tierId: "2-day",
    addOnIds: ["stain-treatment"],
    estimatedWeightLbs: 30,
  },
  pickup: { date: nextWeekday(), windowId: "weekday-day" },
  instructions: "Grey blanket is delicate",
});

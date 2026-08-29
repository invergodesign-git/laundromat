/**
 * One-off check: route from the configured home office to a few real San Diego
 * addresses and apply the delivery pricing rules, so the cap and the service
 * radius can be eyeballed against actual driving distances.
 *
 * Usage: node scripts/check-delivery.mjs
 */

import { readFileSync } from "node:fs";

const RATE_PER_MILE = 0.77;
const FEE_CAP = 6.0;
const MAX_RADIUS = 18;
const METERS_PER_MILE = 1609.344;

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
    })
);

const origin = {
  lat: Number(env.LAUNDRY_ORIGIN_LAT),
  lon: Number(env.LAUNDRY_ORIGIN_LON),
};
const apiKey = env.GEOAPIFY_API_KEY;

const DESTINATIONS = [
  "Fashion Valley Mall, San Diego, CA",
  "Balboa Park, San Diego, CA",
  "San Diego Zoo, San Diego, CA",
  "Pacific Beach, San Diego, CA",
  "La Jolla Cove, San Diego, CA",
  "Chula Vista, CA",
  "Oceanside, CA",
];

async function geocode(text) {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", text);
  url.searchParams.set("limit", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("apiKey", apiKey);
  const hit = (await (await fetch(url)).json()).results?.[0];
  return hit ? { lat: hit.lat, lon: hit.lon } : null;
}

async function drivingMiles(to) {
  const url = new URL("https://api.geoapify.com/v1/routing");
  url.searchParams.set(
    "waypoints",
    `${origin.lat},${origin.lon}|${to.lat},${to.lon}`
  );
  url.searchParams.set("mode", "drive");
  url.searchParams.set("apiKey", apiKey);
  // Mirrors the app: ask for the default unit and honour whatever comes back.
  const properties = (await (await fetch(url)).json()).features?.[0]?.properties;
  if (properties?.distance == null) return null;
  const units = properties.distance_units;
  return units === "miles" || units === "imperial"
    ? properties.distance
    : properties.distance / METERS_PER_MILE;
}

function quote(miles) {
  if (miles > MAX_RADIUS) return "OUT OF AREA — call us";
  const uncapped = miles * RATE_PER_MILE;
  const fee = Math.min(uncapped, FEE_CAP);
  const note = uncapped > FEE_CAP ? `  (capped, raw $${uncapped.toFixed(2)})` : "";
  return `$${fee.toFixed(2)}${note}`;
}

console.log(`origin: ${origin.lat}, ${origin.lon}`);
console.log(
  `rules : $${RATE_PER_MILE}/mi, cap $${FEE_CAP.toFixed(
    2
  )}, max ${MAX_RADIUS} mi (cap starts ~${(FEE_CAP / RATE_PER_MILE).toFixed(
    1
  )} mi)\n`
);

for (const place of DESTINATIONS) {
  const point = await geocode(place);
  if (!point) {
    console.log(`${place.padEnd(38)} geocode failed`);
    continue;
  }
  const miles = await drivingMiles(point);
  if (miles == null) {
    console.log(`${place.padEnd(38)} no route`);
    continue;
  }
  console.log(
    `${place.padEnd(38)} ${miles.toFixed(1).padStart(5)} mi   ${quote(miles)}`
  );
}

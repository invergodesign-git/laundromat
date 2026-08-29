/**
 * One-off helper: decode the business's Google Plus Code into the coordinates
 * the geo layer needs, then reverse-geocode them to confirm the point really
 * is where the client says it is.
 *
 * Usage: node scripts/decode-pluscode.mjs
 */

import { readFileSync } from "node:fs";

const ALPHABET = "23456789CFGHJMPQRVWX";
const SHORT_CODE = "QVPF+94";
// The locality the client quoted alongside the short code.
const REFERENCE = { lat: 32.7157, lon: -117.1611, label: "San Diego, CA" };

/** Resolution of each character pair, in degrees. */
const PAIR_RESOLUTION = [20, 1, 0.05, 0.0025, 0.000125];

function decodeFull(code) {
  const digits = code.replace("+", "");
  let lat = -90;
  let lon = -180;

  for (let pair = 0; pair * 2 < digits.length; pair += 1) {
    const resolution = PAIR_RESOLUTION[pair];
    lat += ALPHABET.indexOf(digits[pair * 2]) * resolution;
    lon += ALPHABET.indexOf(digits[pair * 2 + 1]) * resolution;
  }

  // Report the centre of the final cell rather than its corner.
  const last = PAIR_RESOLUTION[Math.ceil(digits.length / 2) - 1];
  return { lat: lat + last / 2, lon: lon + last / 2, cellSizeDeg: last };
}

/**
 * Rebuilds the 4-character prefix a short code omits, using the reference
 * locality. Those first two pairs cover 20° then 1°, so they are simply the
 * reference point's own leading digits.
 */
function recoverPrefix({ lat, lon }) {
  const latOffset = lat + 90;
  const lonOffset = lon + 180;
  return (
    ALPHABET[Math.floor(latOffset / 20)] +
    ALPHABET[Math.floor(lonOffset / 20)] +
    ALPHABET[Math.floor(latOffset % 20)] +
    ALPHABET[Math.floor(lonOffset % 20)]
  );
}

function readApiKey() {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return env.match(/^GEOAPIFY_API_KEY=(.+)$/m)?.[1]?.trim();
}

const prefix = recoverPrefix(REFERENCE);
const fullCode = prefix + SHORT_CODE;
const point = decodeFull(fullCode);

console.log(`short code   : ${SHORT_CODE}`);
console.log(`reference    : ${REFERENCE.label}`);
console.log(`full code    : ${fullCode}`);
console.log(`cell size    : ~${(point.cellSizeDeg * 111_000).toFixed(0)} m`);
console.log("");
console.log(`LAUNDRY_ORIGIN_LAT=${point.lat.toFixed(7)}`);
console.log(`LAUNDRY_ORIGIN_LON=${point.lon.toFixed(7)}`);
console.log("");

const apiKey = readApiKey();
if (!apiKey) {
  console.log("No API key found in .env.local — skipping reverse geocode.");
  process.exit(0);
}

const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
url.searchParams.set("lat", String(point.lat));
url.searchParams.set("lon", String(point.lon));
url.searchParams.set("format", "json");
url.searchParams.set("apiKey", apiKey);

const response = await fetch(url);
if (!response.ok) {
  console.log(`Reverse geocode failed: HTTP ${response.status}`);
  process.exit(1);
}

const data = await response.json();
const hit = data.results?.[0];
console.log("reverse geocode says this point is:");
console.log(`  ${hit?.formatted ?? "(no result)"}`);

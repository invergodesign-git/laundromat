import fs from "node:fs";
import sharp from "sharp";

/**
 * Builds the site icons from the brand logo.
 *
 * The full lockup is unreadable at 32px, so we crop the turtle mark out of
 * `logo-knockout.png`, trim the transparent margin, and centre it on the
 * site's paper colour with a little breathing room.
 */

const SOURCE = "public/images/logo-knockout.png";
const BACKGROUND = { r: 242, g: 246, b: 255, alpha: 1 }; // --color-foam

/** Crop box around the turtle in the 958×326 lockup. */
const MARK = { left: 0, top: 0, width: 340, height: 326 };

async function markAt(size) {
  const padding = Math.round(size * 0.1);
  const inner = size - padding * 2;

  const mark = await sharp(SOURCE)
    .extract(MARK)
    .trim({ threshold: 10 })
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Packs PNG buffers into a multi-size .ico (ICO allows embedded PNGs). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  let offset = 6 + entries.length * 16;
  const directory = [];

  for (const { size, data } of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    directory.push(entry);
    offset += data.length;
  }

  return Buffer.concat([
    header,
    ...directory,
    ...entries.map((e) => e.data),
  ]);
}

const [icon512, appleIcon, ico16, ico32, ico48] = await Promise.all([
  markAt(512),
  markAt(180),
  markAt(16),
  markAt(32),
  markAt(48),
]);

fs.writeFileSync("src/app/icon.png", icon512);
fs.writeFileSync("src/app/apple-icon.png", appleIcon);
fs.writeFileSync(
  "src/app/favicon.ico",
  buildIco([
    { size: 16, data: ico16 },
    { size: 32, data: ico32 },
    { size: 48, data: ico48 },
  ])
);

console.log("icon.png, apple-icon.png and favicon.ico written");

/**
 * Short order references.
 *
 * Exists so a phone call can start with "I'm calling about CL-7K4M2" instead
 * of spelling out an address. Not a security token and not a database key —
 * just something a person can read down a phone line.
 */

/**
 * Deliberately excludes characters that get misheard or misread: no O/0, no
 * I/1, no S/5, no B/8.
 */
const ALPHABET = "ACDEFGHJKLMNPQRTUVWXY2346789";
const LENGTH = 5;

export function createOrderReference(): string {
  const bytes = new Uint8Array(LENGTH);
  crypto.getRandomValues(bytes);

  let code = "";
  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }

  return `CL-${code}`;
}

import type { Profile } from "./types";
import { fileSafeName } from "./utils";

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

function fold(line: string) {
  // RFC 6350/2426: lines longer than 75 octets are folded with CRLF + space.
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) chunks.push(" " + line.slice(i, i + 74));
  return chunks.join("\r\n");
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { family: "", given: parts[0] };
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
}

export interface VCardOptions {
  cardUrl?: string;
  photo?: { base64: string; type: "JPEG" | "PNG" };
}

/** Builds a vCard 3.0 string. Only fields that exist are included. */
export function buildVCard(p: Profile, opts: VCardOptions = {}) {
  const { family, given } = splitName(p.full_name);
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(family)};${esc(given)};;;`,
    `FN:${esc(p.full_name.trim())}`,
  ];
  if (p.company) lines.push(`ORG:${esc(p.company)}`);
  if (p.job_title) lines.push(`TITLE:${esc(p.job_title)}`);
  if (p.phone) lines.push(`TEL;TYPE=CELL:${p.phone.trim()}`);
  if (p.email) lines.push(`EMAIL;TYPE=INTERNET:${p.email.trim()}`);
  if (p.website) {
    const w = p.website.trim();
    lines.push(`URL:${/^https?:\/\//i.test(w) ? w : `https://${w}`}`);
  }
  if (opts.cardUrl) lines.push(`URL:${opts.cardUrl}`);
  if (p.address) lines.push(`ADR;TYPE=WORK:;;${esc(p.address)};;;;`);
  if (p.bio) lines.push(`NOTE:${esc(p.bio)}`);
  lines.push(`UID:urn:uuid:${p.id}`);
  if (opts.photo) lines.push(`PHOTO;ENCODING=b;TYPE=${opts.photo.type}:${opts.photo.base64}`);
  lines.push("END:VCARD");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function vcardFilename(p: Pick<Profile, "full_name">) {
  return `${fileSafeName(p.full_name)}.vcf`;
}

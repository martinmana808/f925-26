// Generates the full favicon / apple-touch / OG image set from three sources:
//   ~/Desktop/favicon.png   (600x600, B/W logo on white)  -> favicons
//   ~/Desktop/others.png    (600x600, logo on mint)        -> apple-touch / app icons
//   ~/Desktop/og image.png  (1200x630, laptop on mint)     -> OG/Twitter share image
// Run: node scripts/generate-icons.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DESKTOP = join(homedir(), 'Desktop');
const PUBLIC = join(process.cwd(), 'public');

const SRC = {
  favicon: join(DESKTOP, 'favicon.png'),
  app: join(DESKTOP, 'others.png'),
  og: join(DESKTOP, 'og image.png'),
};

const out = (name) => join(PUBLIC, name);

// Resize a source to a square PNG buffer.
const png = (src, size) =>
  sharp(src).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();

// Minimal ICO encoder: packs PNG-encoded entries (supported by all modern
// browsers + Windows Vista+). Each entry is a full PNG; the directory just
// records size/offset.
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(entries.length, 4); // image count

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const bodies = [];

  entries.forEach((e, i) => {
    const d = dir.subarray(i * 16, i * 16 + 16);
    d.writeUInt8(e.size >= 256 ? 0 : e.size, 0); // width  (0 = 256)
    d.writeUInt8(e.size >= 256 ? 0 : e.size, 1); // height (0 = 256)
    d.writeUInt8(0, 2); // palette
    d.writeUInt8(0, 3); // reserved
    d.writeUInt16LE(1, 4); // color planes
    d.writeUInt16LE(32, 6); // bits per pixel
    d.writeUInt32LE(e.buf.length, 8); // bytes in resource
    d.writeUInt32LE(offset, 12); // offset
    offset += e.buf.length;
    bodies.push(e.buf);
  });

  return Buffer.concat([header, dir, ...bodies]);
}

const wrote = [];
async function main() {
  // --- OG image (already 1200x630) — normalize + compress ---
  await sharp(SRC.og)
    .resize(1200, 630, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(out('og-1200x630.png'));
  wrote.push('og-1200x630.png');

  // --- Favicons (from B/W-on-white source) ---
  for (const size of [16, 32, 48, 96]) {
    writeFileSync(out(`favicon-${size}x${size}.png`), await png(SRC.favicon, size));
    wrote.push(`favicon-${size}x${size}.png`);
  }
  // Default favicon.png (any) — 64px
  writeFileSync(out('favicon.png'), await png(SRC.favicon, 64));
  wrote.push('favicon.png');
  // Multi-resolution .ico (16/32/48)
  const icoEntries = await Promise.all(
    [16, 32, 48].map(async (size) => ({ size, buf: await png(SRC.favicon, size) }))
  );
  writeFileSync(out('favicon.ico'), buildIco(icoEntries));
  wrote.push('favicon.ico');

  // --- Apple-touch / app icons (from logo-on-mint source, opaque) ---
  // Apple touch icon: flatten any alpha onto white-ish, keep mint background.
  writeFileSync(out('apple-touch-icon.png'), await png(SRC.app, 180));
  wrote.push('apple-touch-icon.png');
  for (const size of [192, 512]) {
    writeFileSync(out(`apple-touch-icon-${size}x${size}.png`), await png(SRC.app, size));
    wrote.push(`apple-touch-icon-${size}x${size}.png`);
  }

  console.log('Generated:\n  ' + wrote.join('\n  '));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

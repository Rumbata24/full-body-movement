import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const svg = `
<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#171a24" />
      <stop offset="100%" stop-color="#0f1117" />
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f0d29c" />
      <stop offset="100%" stop-color="#dba85f" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <circle cx="256" cy="256" r="132" fill="none" stroke="#242835" stroke-width="30" />
  <circle
    cx="256"
    cy="256"
    r="132"
    fill="none"
    stroke="url(#ring)"
    stroke-width="30"
    stroke-linecap="round"
    stroke-dasharray="622 829"
    transform="rotate(-90 256 256)"
  />
  <circle cx="256" cy="256" r="46" fill="#e8c27a" />
</svg>
`;

writeFileSync(path.join(outDir, "icon.svg"), svg.trim());

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, name));
  console.log("wrote", name);
}

// Maskable variant with extra padding so the ring isn't clipped by OS masks
const maskableSvg = svg.replace(
  '<rect width="512" height="512" rx="112" fill="url(#bg)" />',
  '<rect width="512" height="512" fill="url(#bg)" />',
);
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(path.join(outDir, "icon-maskable-512.png"));
console.log("wrote icon-maskable-512.png");

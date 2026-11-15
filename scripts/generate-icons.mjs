import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');
mkdirSync(publicDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

function encodePng(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // profundidad de bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const src = Buffer.from(pixels.buffer, pixels.byteOffset, pixels.byteLength);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro: ninguno
    src.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function draw(size, paddingRatio = 0) {
  const pixels = new Uint8Array(size * size * 4);
  const inner = size * (1 - paddingRatio * 2);
  const offset = size * paddingRatio;
  const cx = size / 2;
  const topY = offset + inner * 0.24;
  const barH = Math.max(1, Math.round(inner * 0.15));
  const barW = Math.round(inner * 0.54);
  const stemW = Math.round(inner * 0.15);
  const stemH = Math.round(inner * 0.36);
  const dot = Math.max(2, Math.round(inner * 0.1));
  const dotX = Math.round(offset + inner * 0.7);
  const dotY = Math.round(offset + inner * 0.7);

  const set = (x, y, r, g, b) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = 255;
  };
  const rect = (x0, y0, w, h, r, g, b) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, r, g, b);
  };

  // Fondo carbón
  rect(0, 0, size, size, 34, 37, 42);
  // Marca "T" amarilla
  rect(Math.round(cx - barW / 2), Math.round(topY), barW, barH, 223, 154, 18);
  rect(Math.round(cx - stemW / 2), Math.round(topY), stemW, Math.round(barH + stemH), 223, 154, 18);
  // Acento dorado
  rect(dotX, dotY, dot, dot, 221, 186, 115);

  return pixels;
}

function write(name, size, paddingRatio = 0) {
  const pixels = draw(size, paddingRatio);
  writeFileSync(join(publicDir, name), encodePng(size, size, pixels));
  console.log(`OK public/${name} (${size}x${size})`);
}

write('pwa-192x192.png', 192);
write('pwa-512x512.png', 512);
write('maskable-512x512.png', 512, 0.12);
write('apple-touch-icon.png', 180);
write('favicon-32x32.png', 32);

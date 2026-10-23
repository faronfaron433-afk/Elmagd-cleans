import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawPixel) {
  // Signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: 6 = RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixel(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate PWA icons with nice gradient, sparkles and bottle silhouette
function iconPainter(isMaskable) {
  return (x, y, width, height) => {
    const nx = x / width; // 0..1
    const ny = y / height; // 0..1
    const cx = 0.5;
    const cy = 0.5;
    const dx = nx - cx;
    const dy = ny - cy;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Background gradient: Teal-800 to Teal-600
    let bgR = Math.round(15 + 10 * nx);
    let bgG = Math.round(118 + 30 * ny);
    let bgB = Math.round(110 + 26 * nx);

    // Outer corner radius for non-maskable (squircle)
    if (!isMaskable) {
      // Rounded corner cutoff
      const rCorner = 0.22;
      const qx = Math.max(0, Math.abs(dx) - (0.5 - rCorner));
      const qy = Math.max(0, Math.abs(dy) - (0.5 - rCorner));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);
      if (cornerDist > rCorner) {
        return [0, 0, 0, 0]; // Transparent outside squircle
      }
    }

    // Safe zone scale
    const scale = isMaskable ? 0.75 : 0.88;
    const sx = (nx - 0.5) / scale + 0.5;
    const sy = (ny - 0.5) / scale + 0.5;

    // Draw central detergent bottle shape
    // Bottle body bounds: sx in [0.34, 0.66], sy in [0.38, 0.82]
    const inBottleBody = (
      sx >= 0.35 && sx <= 0.65 &&
      sy >= 0.40 && sy <= 0.82
    );
    // Neck bounds: sx in [0.44, 0.56], sy in [0.28, 0.40]
    const inNeck = (
      sx >= 0.44 && sx <= 0.56 &&
      sy >= 0.28 && sy <= 0.40
    );
    // Spray top: sx in [0.42, 0.68], sy in [0.18, 0.28]
    const inCap = (
      sx >= 0.42 && sx <= 0.66 &&
      sy >= 0.20 && sy <= 0.28
    );
    // Label on bottle: sx in [0.39, 0.61], sy in [0.50, 0.72]
    const inLabel = (
      sx >= 0.39 && sx <= 0.61 &&
      sy >= 0.52 && sy <= 0.72
    );

    // Floating bubbles
    const bubble1 = Math.sqrt((sx - 0.24) ** 2 + (sy - 0.35) ** 2) < 0.05;
    const bubble2 = Math.sqrt((sx - 0.78) ** 2 + (sy - 0.30) ** 2) < 0.06;
    const bubble3 = Math.sqrt((sx - 0.76) ** 2 + (sy - 0.70) ** 2) < 0.04;
    const bubble4 = Math.sqrt((sx - 0.22) ** 2 + (sy - 0.65) ** 2) < 0.035;

    // Sparkle star near top right
    const starDist = Math.sqrt((sx - 0.78) ** 2 + (sy - 0.20) ** 2);
    const starCross = (Math.abs(sx - 0.78) < 0.015 && Math.abs(sy - 0.20) < 0.05) ||
                      (Math.abs(sy - 0.20) < 0.015 && Math.abs(sx - 0.78) < 0.05);

    if (starDist < 0.04 || starCross) {
      return [254, 240, 138, 255]; // Yellow gold sparkle
    }

    if (bubble1 || bubble2 || bubble3 || bubble4) {
      return [204, 251, 241, 230]; // Soft mint bubble
    }

    if (inLabel) {
      // Cyan/emerald bright label
      return [6, 182, 212, 255];
    }

    if (inCap) {
      return [94, 234, 212, 255];
    }

    if (inNeck || inBottleBody) {
      return [255, 255, 255, 255]; // Crisp white bottle
    }

    // Background gradient with ring
    if (Math.abs(distFromCenter - (isMaskable ? 0.38 : 0.42)) < 0.008) {
      return [45, 212, 191, 140]; // Teal accent ring
    }

    return [bgR, bgG, bgB, 255];
  };
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. pwa-192x192.png
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, iconPainter(false)));
console.log('Created pwa-192x192.png');

// 2. pwa-512x512.png
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, iconPainter(false)));
console.log('Created pwa-512x512.png');

// 3. pwa-maskable-512x512.png (padded safe zone)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, iconPainter(true)));
console.log('Created pwa-maskable-512x512.png');

// 4. apple-touch-icon.png (180x180)
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, iconPainter(false)));
console.log('Created apple-touch-icon.png');

// 5. favicon.ico / favicon.png (64x64)
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, iconPainter(false)));
console.log('Created favicon.ico');

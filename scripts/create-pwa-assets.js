const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Create Vector SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#b45309" />
    </linearGradient>
    <linearGradient id="pastelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="60%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#78350f" flood-opacity="0.45" />
    </filter>
  </defs>
  
  <!-- Background Rounded Rect -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)" />
  
  <!-- Outer Glow Ring -->
  <rect x="12" y="12" width="488" height="488" rx="116" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25" />
  
  <!-- Steam lines -->
  <path d="M210 120 C 200 95, 230 80, 215 55" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.6" />
  <path d="M256 110 C 246 85, 276 70, 261 45" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.8" />
  <path d="M302 120 C 292 95, 322 80, 307 55" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.6" />

  <!-- Main Pastel Body (D-shape / Crescent Fold) -->
  <g filter="url(#shadow)">
    <!-- Base folded pastel -->
    <path d="M 110 320 
             C 110 200, 200 150, 256 150 
             C 312 150, 402 200, 402 320 
             C 340 350, 172 350, 110 320 Z" 
          fill="url(#pastelGrad)" stroke="#b45309" stroke-width="6" stroke-linejoin="round" />
          
    <!-- Pastel crimped edge (borda frisada de pastel) -->
    <path d="M 110 320 
             Q 130 345, 150 330 
             Q 170 350, 190 335 
             Q 210 355, 230 338 
             Q 256 360, 282 338 
             Q 302 355, 322 335 
             Q 342 350, 362 330 
             Q 382 345, 402 320" 
          fill="none" stroke="#92400e" stroke-width="7" stroke-linecap="round" />
          
    <!-- Decorative Fork Marks / Furinhos da borda -->
    <line x1="140" y1="322" x2="140" y2="336" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="170" y1="326" x2="170" y2="340" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="200" y1="330" x2="200" y2="344" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="230" y1="332" x2="230" y2="346" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="260" y1="333" x2="260" y2="347" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="290" y1="332" x2="290" y2="346" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="320" y1="330" x2="320" y2="344" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="350" y1="326" x2="350" y2="340" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    <line x1="380" y1="322" x2="380" y2="336" stroke="#92400e" stroke-width="4" stroke-linecap="round" />
    
    <!-- Crispy air bubbles on fried crust (bolhinhas da massa frita) -->
    <ellipse cx="210" cy="225" rx="14" ry="10" fill="#fef08a" opacity="0.8" />
    <ellipse cx="290" cy="215" rx="16" ry="11" fill="#fde047" opacity="0.75" />
    <ellipse cx="250" cy="260" rx="20" ry="13" fill="#fef08a" opacity="0.85" />
    <ellipse cx="180" cy="275" rx="12" ry="8" fill="#fde047" opacity="0.7" />
    <ellipse cx="330" cy="270" rx="15" ry="9" fill="#fef08a" opacity="0.7" />
  </g>
  
  <!-- Text Label -->
  <text x="256" y="440" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="44" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    SUCULENTOS
  </text>
  <text x="256" y="475" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="20" fill="#fef3c7" text-anchor="middle" letter-spacing="1">
    PASTELARIA
  </text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgContent);

// 2. Pure PNG Builder with RGBA buffer and zlib
function createPNG(width, height, getPixel) {
  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA (6)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw Image Data with filter byte per scanline
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    rawData[pos++] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      rawData[pos++] = r;
      rawData[pos++] = g;
      rawData[pos++] = b;
      rawData[pos++] = a;
    }
  }

  // Compress with deflate
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // CRC32 Helper
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lengthBuf = Buffer.alloc(4);
    lengthBuf.writeUInt32BE(data.length, 0);

    const toCrc = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(toCrc);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);

    return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Pixel Generator for Pastel Icon
function getPastelPixel(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1

  const cornerRadius = isMaskable ? 0.99 : 0.65;
  const distCorner = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);

  // If outside squircle (for non-maskable)
  if (!isMaskable && distCorner > Math.pow(cornerRadius, 4)) {
    return [0, 0, 0, 0]; // Transparent
  }

  // Background Gradient (Amber to Dark Orange)
  const grad = (ny + 1) / 2;
  let bgR = Math.round(245 * (1 - grad) + 180 * grad);
  let bgG = Math.round(158 * (1 - grad) + 83 * grad);
  let bgB = Math.round(11 * (1 - grad) + 9 * grad);

  // Check if inside Pastel Body (Half ellipse / crescent)
  const pastelCenterX = 0;
  const pastelCenterY = 0.05;
  const px = nx - pastelCenterX;
  const py = ny - pastelCenterY;

  // Upper dome
  const insideDome = (px * px) / 0.36 + (py * py) / 0.18 < 1 && py > -0.45 && py < 0.25;
  const insideBottom = (px * px) / 0.38 + ((py - 0.15) * (py - 0.15)) / 0.06 < 1 && py >= 0.1;

  if (insideDome || insideBottom) {
    // Pastel Gold Texture
    const pGrad = (py + 0.45) / 0.7;
    const pR = Math.round(254 * (1 - pGrad) + 217 * pGrad);
    const pG = Math.round(240 * (1 - pGrad) + 119 * pGrad);
    const pB = Math.round(138 * (1 - pGrad) + 6 * pGrad);

    // Border crimp
    if (py > 0.16) {
      return [180, 83, 9, 255];
    }

    return [pR, pG, pB, 255];
  }

  return [bgR, bgG, bgB, 255];
}

// Generate PNG Files
console.log('Generating PWA Icons...');
const png192 = createPNG(192, 192, (x, y, w, h) => getPastelPixel(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);

const png512 = createPNG(512, 512, (x, y, w, h) => getPastelPixel(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);

const pngMaskable = createPNG(512, 512, (x, y, w, h) => getPastelPixel(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable.png'), pngMaskable);

// Also copy icon-192.png to public/apple-touch-icon.png and public/icon.png
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), png192);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon.png'), png192);

console.log('Icons successfully created in public/icons/');

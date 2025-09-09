import axios from "axios";
import Jimp from "jimp";
import { log } from "./logger.js";

/**
 * Load an image from URL and return { width, height, data } where data is RGBA Uint8Array
 */
export async function loadImageRGBA(url) {
  log(`Downloading image: ${url}`);
  const { data: buf } = await axios.get(url, { responseType: "arraybuffer" });
  const img = await Jimp.read(Buffer.from(buf));
  // Ensure no alpha holes; composite on white
  const bg = new Jimp(img.width, img.height, 0xffffffff);
  bg.composite(img, 0, 0);
  const data = new Uint8Array(bg.bitmap.data); // RGBA
  return { width: bg.bitmap.width, height: bg.bitmap.height, data };
}

/**
 * Map an RGBA pixel to nearest color in palette array of hex strings, returns hex string
 */
export function nearestPaletteColor(r, g, b, paletteHex) {
  let best = paletteHex[0];
  let bestDist = Infinity;
  for (const hex of paletteHex) {
    const rr = parseInt(hex.slice(1, 3), 16);
    const gg = parseInt(hex.slice(3, 5), 16);
    const bb = parseInt(hex.slice(5, 7), 16);
    const d = (r - rr) ** 2 + (g - gg) ** 2 + (b - bb) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = hex;
    }
  }
  return best;
}

/**
 * Convert RGBA buffer to a 2D array of hex colors using a palette
 */
export function rasterToPaletteGrid(rgba, width, height, paletteHex) {
  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = rgba[i + 0], g = rgba[i + 1], b = rgba[i + 2], a = rgba[i + 3];
      if (a < 128) {
        row.push(null); // transparent -> skip
      } else {
        row.push(nearestPaletteColor(r, g, b, paletteHex));
      }
    }
    grid.push(row);
  }
  return grid;
}

import { log, error } from "./utils/logger.js";
import { loadImageRGBA, rasterToPaletteGrid } from "./utils/image.js";
import { selectColor, placePixel, isCooldownActive } from "./site/wplace.js";

export async function runPainter(page, cfg) {
  const {
    IMAGE_URL,
    TARGET_X, TARGET_Y,
    PALETTE,
    PLACE_INTERVAL_MS,
    MAX_ERRORS_BEFORE_RELOAD
  } = cfg;

  const paletteHex = PALETTE.split(",").map(s => s.trim().toUpperCase());
  const { width, height, data } = await loadImageRGBA(IMAGE_URL);
  log(`Image loaded ${width}x${height}`);

  const grid = rasterToPaletteGrid(data, width, height, paletteHex);

  let errors = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const hex = grid[y][x];
      if (!hex) continue; // transparent -> skip

      // Cooldown handling
      const cd = await isCooldownActive(page);
      if (cd > 0) {
        log(`Cooldown active: waiting ${cd}ms`);
        await page.waitForTimeout(cd + 250);
      }

      // Select color
      const ok = await selectColor(page, hex);
      if (!ok) {
        error(`Palette color not found: ${hex}`);
        errors++;
        if (errors >= MAX_ERRORS_BEFORE_RELOAD) throw new Error("Too many errors selecting color");
        continue;
      }

      // Place pixel
      try {
        await placePixel(page, TARGET_X + x, TARGET_Y + y);
        log(`Placed pixel (${TARGET_X + x},${TARGET_Y + y}) ${hex}`);
        await page.waitForTimeout(PLACE_INTERVAL_MS);
      } catch (e) {
        error("placePixel failed", e);
        errors++;
        if (errors >= MAX_ERRORS_BEFORE_RELOAD) throw e;
      }
    }
  }
  log("Painting complete ✔");
}

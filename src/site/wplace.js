import { log } from "../utils/logger.js";

// *** IMPORTANT ***
// Update selectors & actions to match the current WPlace UI.
// The defaults below are placeholders that often work on canvas-style sites.

export async function prepareSite(page, { url, cookieJson }) {
  log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: "networkidle2" });

  // Optional: accept cookies / click start buttons
  try {
    await page.waitForTimeout(1000);
    const acceptBtn = await page.$('button:has-text("Accept")');
    if (acceptBtn) {
      await acceptBtn.click();
      log("Clicked cookie accept button");
    }
  } catch {}

  // If cookies are supplied (session login), set them and refresh
  if (cookieJson?.length) {
    await page.setCookie(...cookieJson);
    await page.reload({ waitUntil: "networkidle2" });
    log("Applied cookies and reloaded");
  }
}

export async function selectColor(page, hex) {
  // Example: if each palette swatch has data-color="#RRGGBB"
  const sel = `[data-color="${hex.toUpperCase()}"]`;
  const el = await page.$(sel);
  if (el) {
    await el.click({ delay: 10 });
    return true;
  }
  // Fallback: try clicking a palette cell with inline style background-color
  const found = await page.evaluate((hex) => {
    const nodes = Array.from(document.querySelectorAll("*"));
    const target = nodes.find(n => {
      const s = getComputedStyle(n);
      return s && (s.backgroundColor?.toLowerCase().includes(hex.slice(1).toLowerCase()));
    });
    if (target) { target.click(); return true; }
    return false;
  }, hex);
  return !!found;
}

export async function placePixel(page, x, y) {
  // Strategy: click on canvas at (x,y) relative to the board. Adjust selectors as needed.
  const canvasSelector = "canvas"; // TODO: set to the actual canvas selector
  const box = await page.$eval(canvasSelector, el => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  // Move and click
  const clickX = box.x + x;
  const clickY = box.y + y;
  await page.mouse.move(clickX, clickY);
  await page.mouse.click(clickX, clickY, { delay: 10 });
}

export async function isCooldownActive(page) {
  // Try to detect any cooldown timer element; return ms remaining if found, else 0
  const ms = await page.evaluate(() => {
    const t = document.querySelector('[data-cooldown], .cooldown, .timer');
    if (!t) return 0;
    const txt = t.textContent?.trim() || "";
    const m = txt.match(/(\d+):(\d+)/);
    if (m) { return (parseInt(m[1]) * 60 + parseInt(m[2])) * 1000; }
    return 1000; // default 1s if unknown element present
  });
  return ms || 0;
}

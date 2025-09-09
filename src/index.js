import express from "express";
import puppeteer from "puppeteer";
import { log, error } from "./utils/logger.js";
import { runPainter } from "./painter.js";
import { prepareSite } from "./site/wplace.js";

// --- Config ---
const cfg = {
  WPLACE_URL: process.env.WPLACE_URL || "https://wplace.live/",
  HEADLESS: (process.env.HEADLESS || "true").toLowerCase() === "true",
  CHROME_NO_SANDBOX: (process.env.CHROME_NO_SANDBOX || "true").toLowerCase() === "true",
  IMAGE_URL: process.env.IMAGE_URL,
  TARGET_X: parseInt(process.env.TARGET_X || "0", 10),
  TARGET_Y: parseInt(process.env.TARGET_Y || "0", 10),
  PALETTE: process.env.PALETTE || "#000000,#FFFFFF",
  PLACE_INTERVAL_MS: parseInt(process.env.PLACE_INTERVAL_MS || "1500", 10),
  MAX_ERRORS_BEFORE_RELOAD: parseInt(process.env.MAX_ERRORS_BEFORE_RELOAD || "10", 10),
  COOKIE_JSON: (() => { try { return JSON.parse(process.env.COOKIE_JSON || "null"); } catch { return null; } })()
};

if (!cfg.IMAGE_URL) {
  console.error("IMAGE_URL is required");
  process.exit(1);
}

// --- tiny health server (Railway keeps service alive) ---
const app = express();
app.get("/", (req, res) => res.send("wplace auto-image bot running"));
const port = process.env.PORT || 3000;
app.listen(port, () => log(`Health server on :${port}`));

(async () => {
  const launchArgs = [
    "--disable-dev-shm-usage",
    "--no-first-run",
    "--no-default-browser-check"
  ];
  if (cfg.CHROME_NO_SANDBOX) launchArgs.push("--no-sandbox", "--disable-setuid-sandbox");

  const browser = await puppeteer.launch({
    headless: cfg.HEADLESS,
    args: launchArgs
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
  );

  try {
    await prepareSite(page, { url: cfg.WPLACE_URL, cookieJson: cfg.COOKIE_JSON });
    await runPainter(page, cfg);
  } catch (e) {
    error("Fatal error in painter", e);
  } finally {
    // Keep browser open so service stays alive for logs; close if you prefer
    log("Bot finished run");
  }
})();

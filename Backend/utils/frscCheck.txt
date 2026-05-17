// utils/frscCheck.js
import puppeteer from "puppeteer";
import fs from "fs";

// Finds Chromium on both local machines and Render's Ubuntu environment
function findChromium() {
  const candidates = [
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log("Found system Chromium at:", p);
      return p;
    }
  }
  // Fall back to Puppeteer's own bundled Chromium
  console.log("No system Chromium found — using Puppeteer bundled Chromium");
  return undefined;
}

export const frscVerify = async (plate) => {
  let browser;
  try {
    const url = "https://nvis.frsc.gov.ng/VehicleManagement/VerifyPlateNo";

    const launchOptions = {
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",   // critical for Render — /dev/shm is only 64MB
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
        "--disable-extensions",
      ],
    };

    const chromiumPath = findChromium();
    if (chromiumPath) {
      launchOptions.executablePath = chromiumPath;
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Real user-agent prevents FRSC from blocking headless requests
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    await page.type('input[name="plateNumber"]', plate);

    await Promise.all([
      page.click('button.find-car'),
      page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }),
    ]);

    const resultText = await page.evaluate(() => {
      return document.body.innerText.toLowerCase();
    });

    await browser.close();
    browser = null;

    console.log("Parsed FRSC result text:", resultText);

    const makeMatch  = resultText.match(/vehicle make\s+(.*)/);
    const colorMatch = resultText.match(/vehicle color\s+(.*)/);

    const vehicleMake  = makeMatch  ? makeMatch[1].trim()  : null;
    const vehicleColor = colorMatch ? colorMatch[1].trim() : null;

    if (resultText.includes("valid and assigned")) {
      return {
        status:  "VALID",
        message: "Plate number valid and assigned (FRSC)",
        make:    vehicleMake,
        color:   vehicleColor,
      };
    } else if (resultText.includes("not found")) {
      return { status: "NOT FOUND", message: "Plate number not found in registry" };
    } else if (resultText.includes("plate number is required")) {
      return { status: "INVALID", message: "No plate number submitted" };
    } else {
      return { status: "UNKNOWN", message: "Unable to confirm vehicle status" };
    }

  } catch (err) {
    console.error("FRSC check error:", err.message);
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    return { status: "ERROR", message: "Failed to reach FRSC portal" };
  }
};
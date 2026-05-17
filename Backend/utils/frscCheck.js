// utils/frscCheck.js
import puppeteer from "puppeteer";

export const frscVerify = async (plate) => {
  let browser;
  try {
    const url = "https://nvis.frsc.gov.ng/VehicleManagement/VerifyPlateNo";

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",  // ✅ critical: Render's /dev/shm is only 64MB
        "--disable-gpu",            // ✅ no GPU in Render containers
        "--no-zygote",              // ✅ avoids zygote process issues in containers
        "--single-process",         // ✅ Render free tier needs single-process mode
      ],
    });

    const page = await browser.newPage();

    // Set real user-agent so FRSC portal doesn't block headless browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2" });

    // Fill in the plate number — identical to original
    await page.type('input[name="plateNumber"]', plate);

    // Submit the form — identical to original
    await Promise.all([
      page.click('button.find-car'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // Extract all visible text — identical to original
    const resultText = await page.evaluate(() => {
      return document.body.innerText.toLowerCase();
    });

    await browser.close();
    browser = null;

    console.log("Parsed FRSC result text:", resultText);

    // Extract vehicle details — identical to original
    const makeMatch  = resultText.match(/vehicle make\s+(.*)/);
    const colorMatch = resultText.match(/vehicle color\s+(.*)/);

    const vehicleMake  = makeMatch  ? makeMatch[1].trim()  : null;
    const vehicleColor = colorMatch ? colorMatch[1].trim() : null;

    // Return logic — identical to original
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

    // Always close browser if it opened before the error
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }

    return { status: "ERROR", message: "Failed to reach FRSC portal" };
  }
};
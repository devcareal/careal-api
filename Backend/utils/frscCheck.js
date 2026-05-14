import puppeteer from "puppeteer";

export const frscVerify = async (plate) => {
  try {
    const url = "https://nvis.frsc.gov.ng/VehicleManagement/VerifyPlateNo";

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Fill in the plate number
    await page.type('input[name="plateNumber"]', plate);

    // Submit the form using the correct button selector
    await Promise.all([
      page.click('button.find-car'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // Extract all visible text from the page
    const resultText = await page.evaluate(() => {
      return document.body.innerText.toLowerCase();
    });

    await browser.close();

    console.log("Parsed FRSC result text:", resultText);

    // Extract vehicle details
    const makeMatch = resultText.match(/vehicle make\s+(.*)/);
    const colorMatch = resultText.match(/vehicle color\s+(.*)/);

    const vehicleMake = makeMatch ? makeMatch[1].trim() : null;
    const vehicleColor = colorMatch ? colorMatch[1].trim() : null;

    if (resultText.includes("valid and assigned")) {
      return {
        status: "VALID",
        message: "Plate number valid and assigned (FRSC)",
        make: vehicleMake,
        color: vehicleColor,
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
    return { status: "ERROR", message: "Failed to reach FRSC portal" };
  }
};
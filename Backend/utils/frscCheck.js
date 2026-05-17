// utils/frscCheck.js
// ─────────────────────────────────────────────────────────────────────────────
// Uses axios + cheerio to query the FRSC portal directly — no Puppeteer/Chrome.
// This works on Render's free tier which cannot reliably run a headless browser.
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";
import * as cheerio from "cheerio";

const FRSC_URL = "https://nvis.frsc.gov.ng/VehicleManagement/VerifyPlateNo";

// Some servers block requests without a real browser user-agent
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Content-Type":    "application/x-www-form-urlencoded",
  "Referer":         FRSC_URL,
  "Origin":          "https://nvis.frsc.gov.ng",
};

export const frscVerify = async (plate) => {
  try {
    // ── Step 1: GET the page to grab any CSRF token / hidden fields ───────────
    const getRes = await axios.get(FRSC_URL, {
      headers: { ...HEADERS, "Content-Type": "text/html" },
      timeout: 20000,
      // Keep cookies between requests
      withCredentials: true,
    });

    const $get = cheerio.load(getRes.data);

    // Extract hidden form fields (CSRF tokens, view state, etc.)
    const hiddenFields = {};
    $get('form input[type="hidden"]').each((_, el) => {
      const name  = $get(el).attr("name");
      const value = $get(el).attr("value") || "";
      if (name) hiddenFields[name] = value;
    });

    // Get cookies from the GET request to send back
    const cookies = getRes.headers["set-cookie"]
      ? getRes.headers["set-cookie"].map(c => c.split(";")[0]).join("; ")
      : "";

    console.log("FRSC hidden fields found:", Object.keys(hiddenFields));

    // ── Step 2: POST the form with the plate number ───────────────────────────
    const formData = new URLSearchParams({
      ...hiddenFields,
      plateNumber: plate,
    });

    const postRes = await axios.post(FRSC_URL, formData.toString(), {
      headers: {
        ...HEADERS,
        "Cookie": cookies,
      },
      timeout: 20000,
      maxRedirects: 5,
    });

    const $post = cheerio.load(postRes.data);

    // Get all visible text from the response page
    const resultText = $post("body").text().toLowerCase().replace(/\s+/g, " ").trim();

    console.log("FRSC response text (first 300 chars):", resultText.substring(0, 300));

    // Extract vehicle details using cheerio selectors first, then regex fallback
    let vehicleMake  = null;
    let vehicleColor = null;

    // Try to find details in table cells or labeled fields
    $post("td, th, label, span, div, p").each((_, el) => {
      const text = $post(el).text().trim().toLowerCase();
      if (text.includes("vehicle make") || text.includes("make:")) {
        const next = $post(el).next().text().trim();
        if (next) vehicleMake = next;
      }
      if (text.includes("vehicle colour") || text.includes("vehicle color") || text.includes("colour:") || text.includes("color:")) {
        const next = $post(el).next().text().trim();
        if (next) vehicleColor = next;
      }
    });

    // Regex fallback if cheerio selectors didn't find them
    if (!vehicleMake) {
      const m = resultText.match(/vehicle make[:\s]+([a-z0-9\s]+?)(?:\s{2,}|\n|$)/);
      if (m) vehicleMake = m[1].trim();
    }
    if (!vehicleColor) {
      const m = resultText.match(/vehicle colo(?:u)?r[:\s]+([a-z0-9\s]+?)(?:\s{2,}|\n|$)/);
      if (m) vehicleColor = m[1].trim();
    }

    // ── Interpret result ──────────────────────────────────────────────────────
    if (resultText.includes("valid and assigned")) {
      return {
        status:  "VALID",
        message: "Plate number valid and assigned (FRSC)",
        make:    vehicleMake,
        color:   vehicleColor,
      };
    } else if (resultText.includes("not found") || resultText.includes("no record")) {
      return {
        status:  "NOT FOUND",
        message: "Plate number not found in FRSC registry",
      };
    } else if (resultText.includes("plate number is required") || resultText.includes("invalid plate")) {
      return {
        status:  "INVALID",
        message: "Invalid plate number format",
      };
    } else {
      // We got a response but couldn't interpret it
      console.log("FRSC full response text:", resultText.substring(0, 500));
      return {
        status:  "UNKNOWN",
        message: "Unable to confirm vehicle status from FRSC portal",
      };
    }

  } catch (err) {
    console.error("FRSC check error:", err.message);

    // Distinguish network errors from parse errors
    if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT") {
      return {
        status:  "ERROR",
        message: "FRSC portal is currently unreachable. Please try again later.",
      };
    }

    return {
      status:  "ERROR",
      message: "Failed to verify plate number. Please try again.",
    };
  }
};
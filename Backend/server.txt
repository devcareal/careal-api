import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { frscVerify } from "./utils/frscCheck.js";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ✅ PostgreSQL connection (Supabase with SSL)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // 👈 allows Supabase’s self-signed cert
  },
});

// ✅ Ensure table exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    service_title VARCHAR(100),
    base_price INT,
    developer_fee INT,
    payment_charge INT,
    total INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log("✅ payments table ready"))
  .catch(err => console.error("❌ Error creating table:", err));

// ✅ Save payment
app.post("/api/payments", async (req, res) => {
  const { title, basePrice, developerFee, paymentCharge } = req.body;

  if (!title || !basePrice) {
    return res.status(400).json({ message: "Missing payment info." });
  }

  const total = basePrice + developerFee + paymentCharge;

  try {
    const result = await pool.query(
      `INSERT INTO payments (service_title, base_price, developer_fee, payment_charge, total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, basePrice, developerFee, paymentCharge, total]
    );

    console.log("💰 Payment saved:", result.rows[0]);
    res.status(201).json({
      message: "✅ Payment recorded successfully!",
      payment: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error saving payment:", err);
    res.status(500).json({ message: "Error saving payment." });
  }
});

// ✅ Fetch all payments
app.get("/api/payments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    res.status(500).json({ message: "Error fetching payments." });
  }
});

// ✅ Verify plate number
app.post("/api/verifyplate", async (req, res) => {
  const { plateNumber } = req.body;

  if (!plateNumber) {
    return res.status(400).json({ message: "Plate number is required." });
  }

  try {
    const result = await frscVerify(plateNumber);
    console.log(" FRSC result:", result);

    res.status(200).json({
      message: result.message,
      status: result.status,
      make: result.make || "",
      color: result.color || "",
    });
  } catch (error) {
    console.error("❌ Verification error:", error.message);
    res.status(500).json({ message: "Server error during verification." });
  }
});

// ✅ Root route
app.get("/", (req, res) => res.send("🚗 CAREAL Backend Running Successfully!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

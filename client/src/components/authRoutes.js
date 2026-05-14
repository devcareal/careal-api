import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

// Helper: create token
const createToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

// SIGNUP
router.post("/signup", async (req, res) => {
  const { firstName, otherName, lastName, email, password } = req.body;

  try {
    const exists = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (exists.rows.length)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users 
      (first_name, other_name, last_name, email, password, role)
      VALUES ($1,$2,$3,$4,$5,'user')
      RETURNING id, first_name, role`,
      [firstName, otherName, lastName, email, hashed]
    );

    const token = createToken(result.rows[0]);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: "strict",
        maxAge: 60 * 60 * 1000,
      })
      .status(201)
      .json({ user: result.rows[0] });
  } catch {
    res.status(500).json({ message: "Signup failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  if (!result.rows.length)
    return res.status(400).json({ message: "Invalid credentials" });

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = createToken(user);

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    })
    .json({
      user: {
        id: user.id,
        firstName: user.first_name,
        role: user.role,
      },
    });
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

export default router;

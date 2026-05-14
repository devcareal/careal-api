import express from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User dashboard
router.get("/dashboard", requireAuth, (req, res) => {
  res.json({ message: "Welcome user", user: req.user });
});

// Admin-only route
router.get("/admin", requireAuth, requireAdmin, (req, res) => {
  res.json({ message: "Welcome admin" });
});

export default router;

// backend/routes/auth.js
import express from 'express';
import { signup, login } from '../controllers/authController.js';  // ✅ correct path

const router = express.Router();

// POST /signup
router.post('/signup', signup);

// POST /login
router.post('/login', login);

export default router;

// routes/verify.js
import express from 'express';
import { frscVerify } from '../utils/frscCheck.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { plateNumber } = req.body;

  if (!plateNumber || typeof plateNumber !== 'string' || plateNumber.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Valid plate number is required',
    });
  }

  try {
    const result = await frscVerify(plateNumber.trim().toUpperCase());

    res.json({
      success: result.status === 'VALID',
      plateNumber: plateNumber.trim().toUpperCase(),
      status: result.status,
      message: result.message,
      make: result.make || null,
      color: result.color || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify plate number',
      error: error.message,
    });
  }
});

export default router;
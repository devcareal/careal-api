
//    payments.js needs FRONTEND_URL (singular) for the Flutterwave redirect_url.
//   //      FRONTEND_URL=http://localhost:5173
//  
import express from 'express';
import pool from '../db.js';
import { protect } from '../src/middleware/auth.js';
import ServicePrice from '../ServicePrice.js';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// ─────────────────────────────────────────────
// POST /api/payments/initiate
// ─────────────────────────────────────────────
router.post('/initiate', protect, async (req, res) => {
  const { plate_number, license, roadworthiness, insurance } = req.body;

  if (!plate_number) {
    return res.status(400).json({ message: 'plate_number is required' });
  }
  if (!license && !roadworthiness && !insurance) {
    return res.status(400).json({ message: 'At least one service must be selected' });
  }

  const license_amount        = license        ? ServicePrice.licence.price        : 0;
  const roadworthiness_amount = roadworthiness ? ServicePrice.road_worthiness.price : 0;
  const insurance_amount      = insurance      ? ServicePrice.insurance.price      : 0;
  const total_amount          = license_amount + roadworthiness_amount + insurance_amount;

  const selectedServices = [];
  if (license)        selectedServices.push(ServicePrice.licence.name);
  if (roadworthiness) selectedServices.push(ServicePrice.road_worthiness.name);
  if (insurance)      selectedServices.push(ServicePrice.insurance.name);

  const tx_ref = `CAREAL-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const user = req.user;

  // ✅ FRONTEND_URL (singular) — must be in .env
  //    Add:  FRONTEND_URL=http://localhost:5173
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    console.error('FRONTEND_URL is not set in .env — Flutterwave redirect will break!');
    return res.status(500).json({ message: 'Server misconfiguration: FRONTEND_URL not set' });
  }

  try {
    const flwPayload = {
      tx_ref,
      amount:       total_amount,
      currency:     'NGN',
      // ✅ This is what was undefined before — now uses the correct env var
      redirect_url: `${frontendUrl}/payment/verify`,
      customer: {
        email:       user.email,
        name:        `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        phonenumber: user.phone || '',
      },
      meta: {
        user_id:               user.id,
        plate_number:          plate_number.toUpperCase(),
        license:               license        ? 'true' : 'false',
        roadworthiness:        roadworthiness ? 'true' : 'false',
        insurance:             insurance      ? 'true' : 'false',
        license_amount,
        roadworthiness_amount,
        insurance_amount,
      },
      customizations: {
        title:       'CAREAL Services',
        description: selectedServices.join(', '),
        logo:        `${frontendUrl}/logo.png`,
      },
      payment_options: 'card,banktransfer,ussd',
    };

    const flwRes = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      flwPayload,
      {
        headers: {
          Authorization:  `Bearer ${process.env.FLW_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (flwRes.data.status !== 'success') {
      console.error('Flutterwave initiation failed:', flwRes.data);
      return res.status(502).json({ message: 'Payment gateway error. Please try again.' });
    }

    return res.status(200).json({
      message:      'Payment initiated',
      payment_link: flwRes.data.data.link,
      tx_ref,
    });

  } catch (err) {
    console.error('Initiate payment error:', err?.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to initiate payment', error: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/payments/verify
// Called by PaymentVerify.jsx after Flutterwave redirect
// ─────────────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  const { transaction_id, tx_ref } = req.body;

  if (!transaction_id || !tx_ref) {
    return res.status(400).json({ message: 'transaction_id and tx_ref are required' });
  }

  try {
    const verifyRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
    );

    const flwData = verifyRes.data?.data;

    if (
      !flwData ||
      verifyRes.data.status !== 'success' ||
      flwData.status !== 'successful' ||
      flwData.tx_ref !== tx_ref
    ) {
      return res.status(402).json({ message: 'Payment verification failed or payment was not successful.' });
    }

    const meta                  = flwData.meta || {};
    // ✅ FIX: Supabase column is reg_number, not plate_number
    const reg_number            = (meta.plate_number || '').toUpperCase();
    const license               = meta.license        === 'true';
    const roadworthiness        = meta.roadworthiness === 'true';
    const insurance             = meta.insurance      === 'true';
    const license_amount        = Number(meta.license_amount        || 0);
    const roadworthiness_amount = Number(meta.roadworthiness_amount || 0);
    const insurance_amount      = Number(meta.insurance_amount      || 0);
    const amount                = license_amount + roadworthiness_amount + insurance_amount;

    if (!reg_number) {
      console.error('No plate number in Flutterwave meta:', meta);
      return res.status(400).json({ message: 'Payment meta missing plate number — cannot record.' });
    }

    // Idempotency — don't double-record the same transaction
    const existing = await pool.query(
      'SELECT id FROM vehicle_payments WHERE payment_ref = $1',
      [tx_ref]
    );
    if (existing.rows.length > 0) {
      return res.status(200).json({
        message:    'Payment already recorded',
        payment_id: existing.rows[0].id,
      });
    }

    const result = await pool.query(
      `INSERT INTO vehicle_payments (
        user_id, reg_number,
        license, roadworthiness, insurance,
        license_amount, roadworthiness_amount, insurance_amount,
        amount, payment_ref,
        license_status, roadworthiness_status, insurance_status,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, 'paid'
      ) RETURNING *`,
      [
        req.user.id,
        reg_number,
        license,
        roadworthiness,
        insurance,
        license_amount,
        roadworthiness_amount,
        insurance_amount,
        amount,
        tx_ref,
        license        ? 'Pending' : 'N/A',
        roadworthiness ? 'Pending' : 'N/A',
        insurance      ? 'Pending' : 'N/A',
      ]
    );

    return res.status(201).json({
      message: 'Payment verified and recorded successfully',
      payment: result.rows[0],
    });

  } catch (err) {
    console.error('Verify payment error:', err?.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to verify payment', error: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/payments
// ─────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vehicle_payments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ message: 'Failed to fetch payments', error: err.message });
  }
});

export default router;
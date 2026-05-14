// routes/vehicles.js
import express from 'express';
import { protect } from '../src/middleware/auth.js';
import { supabase } from '../src/supabase.js';
import { frscVerify } from '../utils/frscCheck.js';

const router = express.Router();

// GET /api/vehicles - list all vehicles for logged-in user
router.get('/', protect, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('user_vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      message: 'Vehicles fetched',
      vehicles: data || [],
    });
  } catch (err) {
    console.error('Fetch vehicles error:', err.message);
    res.status(500).json({ message: 'Failed to fetch vehicles' });
  }
});

// POST /api/vehicles - add new vehicle with FRSC verification
router.post('/', protect, async (req, res) => {
  const userId = req.user.id;
  const { plateNumber } = req.body;

  if (!plateNumber) {
    return res.status(400).json({ message: 'Plate number is required' });
  }

  try {
    // 1. Verify plate number via FRSC
    const result = await frscVerify(plateNumber.trim().toUpperCase());

    if (result.status !== 'VALID') {
      return res.status(400).json({
        message: 'Plate number verification failed',
        status: result.status,
        details: result.message,
      });
    }

    // 2. Insert into user_vehicles
    const { data, error } = await supabase
      .from('user_vehicles')
      .insert({
        user_id: userId,
        plate_number: plateNumber.toUpperCase(),
        make: result.make || null,
        color: result.color || null,
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return res.status(409).json({ message: 'This plate number is already added' });
      }
      throw error;
    }

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle: data,
    });
  } catch (err) {
    console.error('Add vehicle error:', err.message);
    res.status(500).json({ message: 'Failed to add vehicle' });
  }
});

export default router;

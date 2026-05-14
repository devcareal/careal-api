// backend/controllers/authController.js
import { supabase } from '../src/supabase.js';   // adjust if supabase.js is elsewhere
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { frscVerify } from '../utils/frscCheck.js';  // adjust path if needed

// ──────────────────────────────────────────────
// SIGNUP with plate verification + password hash
// ──────────────────────────────────────────────
export const signup = async (req, res) => {
  const { firstName, otherName, lastName, email, password, plateNumber } = req.body;

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

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert into vehicle_users
    const { data, error } = await supabase
      .from('vehicle_users')
      .insert([
        {
          id: crypto.randomUUID(),
          first_name: firstName,
          other_name: otherName || null,
          last_name: lastName,
          email,
          password_hash: passwordHash,
          plate_number: plateNumber.toUpperCase(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.status(201).json({
      message: 'Account created successfully',
      user: data,
      verifiedVehicle: {
        make: result.make,
        color: result.color,
      },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ──────────────────────────────────────────────
// LOGIN with password check + JWT
// ──────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('vehicle_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is undefined!');
      return res.status(500).json({ message: 'Server error: JWT secret missing' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, plate_number: user.plate_number || null },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        plate_number: user.plate_number || null,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

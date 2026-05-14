// server.js – safe version with env + CORS fix
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';  // Loads .env automatically
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

// Import routes
import authRoutes from './routes/auth.js';
import verifyRoutes from './routes/verify.js';
import paymentsRoutes from './routes/payments.js';
import vehiclesRouter from './routes/vehicles.js';

console.log('JWT_SECRET loaded?', !!process.env.JWT_SECRET); // debug line

const app = express();

// ✅ CORS setup: allow multiple origins from .env
const allowedOrigins = process.env.FRONTEND_URLS?.split(',') || [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/vehicles', vehiclesRouter);

// Custom protect middleware (JWT verification)
const customProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Profile route
app.get('/api/profile', customProtect, (req, res) => {
  const user = req.user;
  res.json({
    message: 'Profile fetched successfully',
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name || null,
      last_name: user.last_name || null,
      plate_number: user.plate_number || null,
      created_at: user.created_at || null,
    },
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('🚗 CAREAL Backend Running Successfully!');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// src/middleware/auth.js
import jwt from 'jsonwebtoken';

// In-memory blacklist for revoked tokens (for demo; use Redis/DB in production)
const tokenBlacklist = new Set();

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  // Check if token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token revoked' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, ... }
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Utility to revoke tokens (e.g., on logout)
export const revokeToken = (token) => {
  tokenBlacklist.add(token);
};

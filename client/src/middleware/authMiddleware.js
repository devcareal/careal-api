import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin access only" });
  next();
};

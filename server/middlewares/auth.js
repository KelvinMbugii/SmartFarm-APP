const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    // Allow OPTIONS method to pass for CORS preflight
    if (req.method === "OPTIONS") {
      return next();
    }

    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.log("Authorization header missing or malformed");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT payload:", decoded);

    // Check that decoded token contains userId 
    if (!decoded.userId) {
      console.log("Token payload missing userId");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Get user from token and attach to request
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found with id:", decoded.userId);
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Role-based authorization (admin, farmer, officer, etc.)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied for role: ${req.user.role}` });
    }
    next();
  };
};

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = { protect, authorizeRoles, generateToken };





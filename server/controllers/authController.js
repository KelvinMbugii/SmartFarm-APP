const jwt = require("jsonwebtoken");
const User = require("../models/user");
const formatValidationError = require("../utils/formatValidationError");

const CANONICAL_ROLES = ["farmer", "agripreneur", "officer", "admin"];

const LEGACY_ROLE_MAP = {
  agriprenuer: "agripreneur",
};

const normalizeRole = (role = "") => {
  const normalized = String(role).trim().toLowerCase();
  return LEGACY_ROLE_MAP[normalized] || normalized;
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, location, phone, farmDetails } =
      req.body;

    const normalizedRole = normalizeRole(role);
    const normalizedPhone = (phone || "").trim();

    // Validate role
    if (!CANONICAL_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        error: `Invalid role. Allowed roles: ${CANONICAL_ROLES.join(", ")}`,
      });
    }

    // Validate phone
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Phone is required." });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user (schema uses "Phone" with capital P)
    const user = new User({
      name,
      email,
      password,
      role: normalizedRole,
      location,
      Phone: normalizedPhone,
      farmDetails: normalizedRole === "farmer" ? farmDetails : undefined,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        phone: user.Phone,
        farmDetails: user.farmDetails,
      },
    });
  } catch (error) {
    const formatted = formatValidationError(error);

    return res.status(formatted.statusCode || 500).json({
      error: formatted.message || "Server error",
      details: formatted.details,
    });
  }
};

module.exports = {
  register,
};

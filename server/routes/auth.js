// // const express = require('express');
// // const jwt = require('jsonwebtoken');
// // const User = require('../models/User')
// // const auth = require('../middlewares/auth');

// // // Forget password logic
// // const crypto = require('crypto');
// // const sendEmail = require('../utils/sendEmail');


// // const router = express.Router();

// // // Register route
// // router.post('/register', async(req,res) => {
// //     try{
// //     const { name, email, password, role, location, phone, farmDetails} = req.body;

// //     const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : role;
// //     const allowedRoles = ['farmer', 'agriprenuer', 'officer', 'admin'];

// //     if(!allowedRoles.includes(normalizedRole)){
// //       return res.status(400).json({
// //         error: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
// //       });

// //     }

// //     // Check if the user exists
// //     const existingUser = await User.findOne({email:email?.trim().toLowerCase()});

// //     if(existingUser){
// //         return res.status(400).json({error: 'User already exists'});
// //     }

// //     // Creating new User
// //     const user = new User({
// //         name,
// //         email:email?.trim().toLowerCase(),
// //         password:password?.trim(),
// //         role: normalizedRole,
// //         location:location?.trim(),
// //         phone:phone?.trim(),
// //         farmDetails: normalizedRole === 'farmer' ? farmDetails : undefined
// //     });

// //     await user.save();

// //     // Generate a token
// //     const token = jwt.sign(
// //         {userId: user._id, role: user.role},
// //         process.env.JWT_SECRET,
// //         { expiresIn: '7d'}
// //     );

// //     res.status(201).json({
// //         token,
// //         user: {
// //             id: user._id,
// //             name: user.name,
// //             email: user.email,
// //             role: user.role,
// //             location: user.location,
// //             phone: user.phone,
// //             farmDetails: user.farmDetails
// //         }
// //     });
// // } catch(error){
// //     res.status(500).json({ error: error.message});
// // }
// // });


// // // Login route
// // router.post('/login', async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     // Find user
// //     const user = await User.findOne({ email });
// //     if (!user) {
// //       return res.status(400).json({ error: 'Invalid credentials' });
// //     }

// //     // Check password
// //     const isMatch = await user.comparePassword(password);
// //     if (!isMatch) {
// //       return res.status(400).json({ error: 'Invalid credentials' });
// //     }

// //     // Updating online status
// //     user.isOnline = true;
// //     await user.save();

// //     // Generate token
// //     const token = jwt.sign(
// //       { userId: user._id, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: '7d' }
// //     );

// //     res.json({
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         role: user.role,
// //         location: user.location,
// //         phone: user.phone,
// //         farmDetails: user.farmDetails,
// //         avatar: user.avatar
// //       }
// //     });
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // // Get current user
// // router.get('/me', auth.protect, async(req,res) => {
// //     try{
// //         res.json(req.user);
// //     } catch (error){
// //         res.status(500).json({ error: error.message });
// //     }
// // });

// // // Logout
// // router.post('/logout', auth.protect, async (req, res) => {
// //     try{
// //         const user = await User.findById(req.user.userId);
// //         user.isOnline = false;
// //         user.LastSeen = new Date();
// //         await user.save();

// //         res.json({ message: 'Logged out successfully'})
// //     } catch (error){
// //         res.status(500).json({ error: error.message });
// //     }
// // });

// // // Post/api/auth/forgot-password
// // router.post('/forgot-password', async (req, res) => {
// //  try {
// //     const { email } = req.body;
// //     const user = await User.findOne({ email });
// //     const genericMsg = { message: 'Check your email, a reset link has been sent.'};

// //     if (!user) return res.status(200).json(genericMsg);

// //     // create token
// //     const resetToken = crypto.randomBytes(32).toString('hex');
// //     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

// //     user.resetPasswordToken = hashedToken;
// //     user.resetPasswordExpires = Date.now() + 1000 * 60 *  60;
// //     await user.save();

// //     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// //     const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
// //     const message = `Click here to reset your password: ${resetUrl}`;

// //     try {
// //       await sendEmail(user.email, 'Password Reset Request', message);
// //       return res.json(genericMsg);
// //     } catch (error) {
// //       // In local/dev setup 
// //       if (error.code === 'Email_CONFIG_MISSING' && process.env.NODE_ENV !== 'production'){
// //         console.warn('[forgot-password] Email config missing.Returning reset link in dev mode:', resetUrl);
// //         return res.status(200).json({
// //           ...genericMsg,
// //           debugResetLink: resetUrl,
// //           debugNote: 'Email is not configured. Use debugResetLink locally.',
// //         });
// //       }

// //       user.resetPasswordToken = undefined;
// //       user.resetPasswordExpires = undefined;
// //       await user.save();

// //       return res.status(500).json({ error: 'Failed to send email'});
// //     }
// //  } catch (error){
// //   return res
// //     .status(500)
// //     .json({ error: error.message || "Forgot password failed" });
// //  }
// // });

// // // POST /api/auth/reset-password/:token
// // router.post('/reset-password/:token', async (req, res) => {
// //   const { token } = req.params;
// //   const { password } = req.body;

// //   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
// //   const user = await User.findOne({
// //     resetPasswordToken:hashedToken,
// //     resetPasswordExpires: { $gt: Date.now() }
// //   });

// //   if(!user) return res.status(400).json({ error: 'Invalid or expired token'});

// //   user.password = password;
// //   user.resetPasswordToken = undefined;
// //   user.resetPasswordExpires = undefined;

// //   await user.save();

// //   res.json({ message: 'Password reset successful.'});

// // });

// // //Admin Dashboard
// // router.get("/IT/dashboard", auth.protect, auth.authorizeRoles("admin"), (req, res) => {
// //   res.json({
// //     message: "Welcome to the Admin Dashboard",
// //     user: req.user,
// //     activities: []
// //   });
// // })


// // module.exports = router;const express = require('express');
// const jwt = require('jsonwebtoken');
// const User = require('../models/user')
// const auth = require('../middlewares/auth');

// // Forget password logic
// const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');


// const router = express.Router();


// // Register route
// router.post('/register', async(req,res) => {
//     try{
//     const { name, email, password, role, location, phone, farmDetails} = req.body;

//     const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : role;
//     const allowedRoles = ['farmer', 'agripreneur','officer', 'admin'];

//     if(!allowedRoles.includes(normalizedRole)){
//       return res.status(400).json({
//         error: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
//       });
//     }

//     // Check if the user exists
//     const existingUser = await User.findOne({email:email?.trim().toLowerCase()});

//     if(existingUser){
//         return res.status(400).json({error: 'User already exists'});
//     }

//     // Creating new User
//     const user = new User({
//         name,
//         email:email?.trim().toLowerCase(),
//         password,
//         role: normalizedRole,
//         location,
//         phone,
//         farmDetails: normalizedRole === 'farmer' ? farmDetails : undefined
//     });

//     await user.save();

//     // Generate a token
//     const token = jwt.sign(
//         {userId: user._id, role: user.role},
//         process.env.JWT_SECRET,
//         { expiresIn: '7d'}
//     );

//     res.status(201).json({
//         token,
//         user: {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             location: user.location,
//             phone: user.phone,
//             farmDetails: user.farmDetails
//         }
//     });
// } catch(error){
//     res.status(500).json({ error: error.message});
// }
// });


// // Login route
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Check password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Updating online status without triggering full-document validation
//     await User.findByIdAndUpdate(user._id, { isOnline: true });

//     // Generate token
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         role: user.role,
//         location: user.location,
//         phone: user.phone,
//         farmDetails: user.farmDetails,
//         avatar: user.avatar
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get current user
// router.get('/me', auth.protect, async(req,res) => {
//     try{
//         res.json(req.user);
//     } catch (error){
//         res.status(500).json({ error: error.message });
//     }
// });

// // Logout
// router.post('/logout', auth.protect, async (req, res) => {
//     try{
//         await User.findByIdAndUpdate(req.user.userId, {
//             isOnline: false,
//             LastSeen: new Date()
//         });

//         res.json({ message: 'Logged out successfully'})
//     } catch (error){
//         res.status(500).json({ error: error.message });
//     }
// });

// // Post/api/auth/forgot-password
// router.post('/forgot-password', async (req, res) => {
//  try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     const genericMsg = { message: 'Check your email, a reset link has been sent.'};

//     if (!user) return res.status(200).json(genericMsg);

//     // create token
//     const resetToken = crypto.randomBytes(32).toString('hex');
//     const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = Date.now() + 1000 * 60 *  60;
//     await user.save();

//     const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

//     const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
//     const message = `Click here to reset your password: ${resetUrl}`;

//     try {
//       await sendEmail(user.email, 'Password Reset Request', message);
//       return res.json(genericMsg);
//     } catch (error) {
//       // In local/dev setup 
//       if (error.code === 'Email_CONFIG_MISSING' && process.env.NODE_ENV !== 'production'){
//         console.warn('[forgot-password] Email config missing.Returning reset link in dev mode:', resetUrl);
//         return res.status(200).json({
//           ...genericMsg,
//           debugResetLink: resetUrl,
//           debugNote: 'Email is not configured. Use debugResetLink locally.',
//         });
//       }

//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpires = undefined;
//       await user.save();

//       return res.status(500).json({ error: 'Failed to send email'});
//     }
//  } catch (error){
//   return res
//     .status(500)
//     .json({ error: error.message || "Forgot password failed" });
//  }
// });

// // POST /api/auth/reset-password/:token
// router.post('/reset-password/:token', async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
//   const user = await User.findOne({
//     resetPasswordToken:hashedToken,
//     resetPasswordExpires: { $gt: Date.now() }
//   });

//   if(!user) return res.status(400).json({ error: 'Invalid or expired token'});

//   user.password = password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpires = undefined;

//   await user.save();

//   res.json({ message: 'Password reset successful.'});

// });

// //Admin Dashboard
// // router.get("/admin/dashboard", auth.protect, auth.authorizeRoles("admin"), (req, res) => {
// //   res.json({
// //     message: "Welcome to the Admin Dashboard",
// //     user: req.user,
// //     activities: []
// //   });
// // })



const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authController = require("../controllers/authController");
const auth = require("../middlewares/auth");

// Forget password logic
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Updating online status (avoid user.save() so we don't run full validation)
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        location: user.location,
        phone: user.Phone,
        farmDetails: user.farmDetails,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", auth.protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post("/logout", auth.protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      isOnline: false,
      LastSeen: new Date(),
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post/api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const genericMsg = {
      message: "Check your email, a reset link has been sent.",
    };

    if (!user) return res.status(200).json(genericMsg);

    // create token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: Date.now() + 1000 * 60 * 60,
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    const message = `Click here to reset your password: ${resetUrl}`;

    try {
      await sendEmail(user.email, "Password Reset Request", message);
      return res.json(genericMsg);
    } catch (error) {
      // In local/dev setup
      if (
        error.code === "Email_CONFIG_MISSING" &&
        process.env.NODE_ENV !== "production"
      ) {
        console.warn(
          "[forgot-password] Email config missing.Returning reset link in dev mode:",
          resetUrl,
        );
        return res.status(200).json({
          ...genericMsg,
          debugResetLink: resetUrl,
          debugNote: "Email is not configured. Use debugResetLink locally.",
        });
      }

      await User.findByIdAndUpdate(user._id, {
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      });

      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Forgot password failed" });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ error: "Invalid or expired token" });

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(user._id, {
    $set: { password: hashedPassword },
    $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
  });

  res.json({ message: "Password reset successful." });
});

//Admin Dashboard
router.get(
  "/IT/dashboard",
  auth.protect,
  auth.authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome to the Admin Dashboard",
      user: req.user,
      activities: [],
    });
  },
);

module.exports = router;

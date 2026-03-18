// const express = require("express");
// const User = require("../models/user");
// const Forum = require("../models/Forum");
// const { protect, authorizeRoles } = require("../middlewares/auth");

// const router = express.Router();

// router.use(protect, authorizeRoles("admin"));

// router.get("/overview", async (req, res) => {
//   try {
//     const [
//       totalUsers,
//       activeUsers,
//       offlineUsers,
//       admins,
//       officers,
//       farmers,
//       agripreneurs,
//       activePosts,
//       pinnedPosts,
//       openReports,
//       recentUsers,
//       recentPosts,
//     ] = await Promise.all([
//       User.countDocuments(),
//       User.countDocuments({ isActive: true }),
//       User.countDocuments({ isOnline: false }),
//       User.countDocuments({ role: "admin" }),
//       User.countDocuments({ role: "officer" }),
//       User.countDocuments({ role: "farmer" }),
//       User.countDocuments({ role: "agripreneur" }),
//       Forum.countDocuments(),
//       Forum.countDocuments({ pinned: true }),
//       Forum.countDocuments({ "reports.status": "open" }),
//       User.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select("name email role isActive createdAt"),
//       Forum.find()
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select("title category pinned createdAt")
//         .populate({ path: "author", select: "name role", model: "User" }),
//     ]);

//     res.json({
//       totals: {
//         users: totalUsers,
//         activeUsers,
//         deactivatedUsers: Math.max(totalUsers - activeUsers, 0),
//         onlineUsers: Math.max(totalUsers - offlineUsers, 0),
//         posts: activePosts,
//         pinnedPosts,
//         openReports,
//       },
//       roles: {
//         admins,
//         officers,
//         farmers,
//         agripreneurs,
//       },
//       recentUsers,
//       recentPosts,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.get("/users", async (req, res) => {
//   try {
//     const { search = "", role = "", status = "" } = req.query;
//     const query = {};

//     if (role) query.role = role;
//     if (status === "active") query.isActive = true;
//     if (status === "deactivated") query.isActive = false;

//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { location: { $regex: search, $options: "i" } },
//       ];
//     }

//     const users = await User.find(query)
//       .sort({ createdAt: -1 })
//       .select(
//         "name email role location Phone isOnline LastSeen isActive deactivatedAt createdAt",
//       );

//     const normalized = users.map((u) => {
//       const obj = u.toObject();
//       return {
//         ...obj,
//         phone: obj.phone || obj.Phone,
//         lastSeen: obj.lastSeen || obj.LastSeen,
//       };
//     });

//     res.json(normalized);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.patch("/users/:id/status", async (req, res) => {
//   try {
//     const { isActive } = req.body;
//     if (typeof isActive !== "boolean") {
//       return res.status(400).json({ error: "isActive must be a boolean" });
//     }

//     if (req.params.id === String(req.user._id)) {
//       return res
//         .status(400)
//         .json({ error: "You cannot deactivate your own admin account" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           isActive,
//           deactivatedAt: isActive ? null : new Date(),
//           ...(isActive ? {} : { isOnline: false, LastSeen: new Date() }),
//         },
//       },
//       { new: true },
//     ).select("name email role isActive deactivatedAt");

//     if (!updatedUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.get("/posts", async (req, res) => {
//   try {
//     const posts = await Forum.find()
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .select("title category pinned reports createdAt")
//       .populate({ path: "author", select: "name role", model: "User" });

//     const normalized = posts.map((post) => {
//       const openReports = (post.reports || []).filter(
//         (report) => report.status === "open",
//       ).length;
//       return {
//         _id: post._id,
//         title: post.title,
//         category: post.category,
//         pinned: post.pinned,
//         createdAt: post.createdAt,
//         author: post.author,
//         openReports,
//       };
//     });

//     res.json(normalized);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.patch("/posts/:id/pin", async (req, res) => {
//   try {
//     const { pinned } = req.body;
//     if (typeof pinned !== "boolean") {
//       return res.status(400).json({ error: "pinned must be a boolean" });
//     }

//     const post = await Forum.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           pinned,
//           pinnedBy: pinned ? req.user._id : null,
//           pinnedAt: pinned ? new Date() : null,
//         },
//       },
//       { new: true },
//     ).select("title pinned pinnedAt");

//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// router.delete("/posts/:id", async (req, res) => {
//   try {
//     const post = await Forum.findById(req.params.id);
//     if (!post) {
//       return res.status(404).json({ error: "Post not found" });
//     }

//     await post.deleteOne();
//     res.json({ message: "Post deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;


const express = require("express");
const User = require("../models/user");
const Forum = require("../models/Forum");
const MarketplaceProduct = require("../models/MarketplaceProduct");
const Order = require("../models/Order");
const { protect, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      offlineUsers,
      admins,
      officers,
      farmers,
      agripreneurs,
      activePosts,
      pinnedPosts,
      openReports,
      recentUsers,
      recentPosts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isOnline: false }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "officer" }),
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "agripreneur" }),
      Forum.countDocuments(),
      Forum.countDocuments({ pinned: true }),
      Forum.countDocuments({ "reports.status": "open" }),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role isActive createdAt"),
      Forum.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title category pinned createdAt")
        .populate({ path: "author", select: "name role", model: "User" }),
    ]);

    res.json({
      totals: {
        users: totalUsers,
        activeUsers,
        deactivatedUsers: Math.max(totalUsers - activeUsers, 0),
        onlineUsers: Math.max(totalUsers - offlineUsers, 0),
        posts: activePosts,
        pinnedPosts,
        openReports,
      },
      roles: {
        admins,
        officers,
        farmers,
        agripreneurs,
      },
      recentUsers,
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/alerts", async (req, res) => {
  try {
    const [openReports, deactivatedUsers, outOfStockProducts, cancelledOrders, pendingPayments] =
      await Promise.all([
        Forum.countDocuments({ "reports.status": "open" }),
        User.countDocuments({ isActive: false }),
        MarketplaceProduct.countDocuments({ isOutOfStock: true }),
        Order.countDocuments({ status: "cancelled" }),
        Order.countDocuments({ paymentStatus: { $in: ["pending", "failed"] } }),
      ]);

    const alerts = [
      {
        type: "forum-moderation",
        severity: openReports > 10 ? "critical" : openReports > 0 ? "warning" : "info",
        title: "Forum moderation queue",
        message:
          openReports > 0
            ? `${openReports} forum reports are still open.`
            : "No open forum reports.",
      },
      {
        type: "accounts",
        severity: deactivatedUsers > 20 ? "warning" : "info",
        title: "Deactivated accounts",
        message: `${deactivatedUsers} user account(s) are currently deactivated.`,
      },
      {
        type: "marketplace-listings",
        severity: outOfStockProducts > 25 ? "warning" : "info",
        title: "Out-of-stock listings",
        message: `${outOfStockProducts} listing(s) are marked out of stock.`,
      },
      {
        type: "marketplace-orders",
        severity: cancelledOrders > 8 ? "warning" : "info",
        title: "Cancelled orders",
        message: `${cancelledOrders} order(s) are cancelled and may require review.`,
      },
      {
        type: "payments",
        severity: pendingPayments > 12 ? "critical" : pendingPayments > 0 ? "warning" : "info",
        title: "Pending/failed payments",
        message:
          pendingPayments > 0
            ? `${pendingPayments} order payment(s) are pending or failed.`
            : "All tracked marketplace payments are clear.",
      },
    ];

    const summary = alerts.reduce(
      (acc, alert) => {
        acc.total += 1;
        acc[alert.severity] += 1;
        return acc;
      },
      { critical: 0, warning: 0, info: 0, total: 0 },
    );

    res.json({ summary, alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const { search = "", role = "", status = "" } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status === "active") query.isActive = true;
    if (status === "deactivated") query.isActive = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .select(
        "name email role location Phone isOnline LastSeen isActive deactivatedAt createdAt",
      );

    const normalized = users.map((u) => {
      const obj = u.toObject();
      return {
        ...obj,
        phone: obj.phone || obj.Phone,
        lastSeen: obj.lastSeen || obj.LastSeen,
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    if (req.params.id === String(req.user._id)) {
      return res
        .status(400)
        .json({ error: "You cannot deactivate your own admin account" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isActive,
          deactivatedAt: isActive ? null : new Date(),
          ...(isActive ? {} : { isOnline: false, LastSeen: new Date() }),
        },
      },
      { new: true },
    ).select("name email role isActive deactivatedAt");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Forum.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("title category pinned reports createdAt")
      .populate({ path: "author", select: "name role", model: "User" });

    const normalized = posts.map((post) => {
      const openReports = (post.reports || []).filter(
        (report) => report.status === "open",
      ).length;
      return {
        _id: post._id,
        title: post.title,
        category: post.category,
        pinned: post.pinned,
        createdAt: post.createdAt,
        author: post.author,
        openReports,
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/posts/:id/pin", async (req, res) => {
  try {
    const { pinned } = req.body;
    if (typeof pinned !== "boolean") {
      return res.status(400).json({ error: "pinned must be a boolean" });
    }

    const post = await Forum.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          pinned,
          pinnedBy: pinned ? req.user._id : null,
          pinnedAt: pinned ? new Date() : null,
        },
      },
      { new: true },
    ).select("title pinned pinnedAt");

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/marketplace/products", async (req, res) => {
  try {
    const { search = "", status = "", sellerType = "" } = req.query;
    const query = {};

    if (status === "active") query.isOutOfStock = false;
    if (status === "out") query.isOutOfStock = true;
    if (sellerType) query.sellerType = sellerType;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const products = await MarketplaceProduct.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("seller", "name role Phone")
      .select(
        "name category price stockQuantity unit seller sellerType isOutOfStock createdAt",
      )
      .lean();

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/marketplace/products/:id/stock", async (req, res) => {
  try {
    const { isOutOfStock } = req.body;
    if (typeof isOutOfStock !== "boolean") {
      return res.status(400).json({ error: "isOutOfStock must be a boolean" });
    }

    const product = await MarketplaceProduct.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isOutOfStock,
          ...(isOutOfStock ? { stockQuantity: 0 } : {}),
        },
      },
      { new: true },
    )
      .populate("seller", "name role Phone")
      .select(
        "name category price stockQuantity unit seller sellerType isOutOfStock createdAt",
      );

    if (!product) {
      return res.status(404).json({ error: "Marketplace product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/marketplace/orders", async (req, res) => {
  try {
    const { status = "", paymentStatus = "", search = "" } = req.query;
    const query = {};

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { buyerName: { $regex: search, $options: "i" } },
        { buyerPhone: { $regex: search, $options: "i" } },
      ];
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("buyer", "name Phone")
      .populate("seller", "name Phone")
      .populate("items.product", "name unit")
      .lean();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/marketplace/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true },
    ).select("status paymentStatus");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/marketplace/orders/:id/payment", async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const allowedStatuses = ["pending", "paid", "failed"];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { paymentStatus } },
      { new: true },
    ).select("status paymentStatus");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/marketplace/products/:id", async (req, res) => {
  try {
    const product = await MarketplaceProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Marketplace product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Marketplace product removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

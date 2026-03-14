const express = require("express");
const User = require("../models/user");
const Forum = require("../models/Forum");
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

module.exports = router;

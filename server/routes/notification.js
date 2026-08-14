const express = require("express");
const Notification = require("../models/notification");
const { protect } = require("../middlewares/auth");

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100,
    );
    const cursor = req.query.cursor;

    const query = { user: req.user._id };

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!Number.isNaN(cursorDate.getTime())) {
        query.createdAt = { $lt: cursorDate };
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const nextCursor =
      notifications.length === limit
        ? notifications[notifications.length - 1].createdAt
        : null;

    res.json({ notifications, nextCursor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unread-count", protect, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/read-all", protect, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() },
    );

    res.json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const auth = require("../middlewares/auth");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads", "chat");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const assertParticipant = async (chatId, userId) => {
  const chat = await Chat.findOne({
    _id: chatId,
    participants: userId,
  }).populate("participants", "name email role avatar isOnline publicKey");

  return chat;
};

// POST /api/chat
router.post("/", auth.protect, async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({ error: "participantId is required" });
    }

    if (String(participantId) === String(req.user.userId)) {
      return res
        .status(400)
        .json({ error: "Cannot create a chat with yourself" });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user.userId, participantId] },
      chatType: "private",
    }).populate("participants", "name email role avatar isOnline publicKey");

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.userId, participantId],
        chatType: "private",
      });
      await chat.populate(
        "participants",
        "name email role avatar isOnline publicKey",
      );
    }

    const unreadCount = await Message.countDocuments({
      chatId: chat._id,
      sender: { $ne: req.user.userId },
      "readBy.user": { $ne: req.user.userId },
    });

    res.status(201).json({ ...chat.toObject(), unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chat
router.get("/", auth.protect, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.userId })
      .populate("participants", "name email role avatar isOnline publicKey")
      .sort({ updatedAt: -1 });

    const chatIds = chats.map((chat) => chat._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          chatId: { $in: chatIds },
          sender: { $ne: req.user.userId },
          "readBy.user": { $ne: req.user.userId },
        },
      },
      {
        $group: {
          _id: "$chatId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadByChatId = unreadCounts.reduce((acc, item) => {
      acc[String(item._id)] = item.count;
      return acc;
    }, {});

    res.json(
      chats.map((chat) => ({
        ...chat.toObject(),
        unreadCount: unreadByChatId[String(chat._id)] || 0,
      })),
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chat/:chatId
router.get("/:chatId", auth.protect, async (req, res) => {
  try {
    const chat = await assertParticipant(req.params.chatId, req.user.userId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chat/:chatId/messages
router.get("/:chatId/messages", auth.protect, async (req, res) => {
  try {
    const chat = await assertParticipant(req.params.chatId, req.user.userId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 30), 100);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chatId: chat._id })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Message.countDocuments({ chatId: chat._id });

    res.json({
      page,
      limit,
      total,
      hasMore: skip + messages.length < total,
      messages: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chat/upload
router.post(
  "/upload",
  auth.protect,
  upload.single("file"),
  async (req, res) => {
    try {
      const { chatId } = req.body;

      if (!chatId) {
        return res.status(400).json({ error: "chatId is required" });
      }

      const chat = await assertParticipant(chatId, req.user.userId);
      if (!chat) {
        return res.status(403).json({ error: "Not authorized for this chat" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Encrypted file is required" });
      }

      const fileUrl = `/uploads/chat/${req.file.filename}`;

      res.status(201).json({
        fileUrl,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// POST /api/chat/:chatId/message
router.post("/:chatId/message", auth.protect, async (req, res) => {
  try {
    const {
      ciphertext,
      nonce,
      encryptedKeys,
      type = "text",
      fileUrl = "",
      mimeType = "",
      fileName = "",
    } = req.body;

    if (
      !ciphertext ||
      !nonce ||
      !Array.isArray(encryptedKeys) ||
      encryptedKeys.length === 0
    ) {
      return res.status(400).json({
        error:
          "ciphertext, nonce, and encryptedKeys are required for encrypted messaging",
      });
    }

    const chat = await assertParticipant(req.params.chatId, req.user.userId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const normalizedEncryptedKeys = encryptedKeys.filter(
      (entry) => entry?.user && entry?.encryptedKey,
    );

    const message = await Message.create({
      chatId: chat._id,
      sender: req.user.userId,
      ciphertext,
      nonce,
      encryptedKeys: normalizedEncryptedKeys,
      type,
      fileUrl,
      mimeType,
      fileName,
      readBy: [{ user: req.user.userId, readAt: new Date() }],
    });

    chat.lastMessage = {
      sender: req.user.userId,
      type,
      createdAt: new Date(),
    };
    await chat.save();

    const populated = await Message.findById(message._id).populate(
      "sender",
      "name avatar",
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/chat/:chatId/messages/:messageId/read
router.patch(
  "/:chatId/messages/:messageId/read",
  auth.protect,
  async (req, res) => {
    try {
      const chat = await assertParticipant(req.params.chatId, req.user.userId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const message = await Message.findOne({
        _id: req.params.messageId,
        chatId: chat._id,
      });
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (
        !message.readBy.some(
          (entry) => String(entry.user) === String(req.user.userId),
        )
      ) {
        message.readBy.push({ user: req.user.userId, readAt: new Date() });
        await message.save();
      }

      res.json(message);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;

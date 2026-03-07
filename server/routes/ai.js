const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { randomUUID } = require("crypto");
const auth = require("../middlewares/auth");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads", "ai");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || "file").replace(/[^\w.\-]+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { files: 5, fileSize: 10 * 1024 * 1024 }, // 10MB each
});

// In-memory job store (AI-ready for later async processing / model injection)
const jobs = new Map();

const buildStubReply = ({ message, files }) => {
  const hasImage = files.some((f) => (f.mimetype || "").startsWith("image/"));
  const hasDoc = files.some((f) => !(f.mimetype || "").startsWith("image/"));

  const lines = [];
  lines.push(
    "AI Assistant is ready for model integration. For now, this is a placeholder response."
  );
  if (message) {
    lines.push("");
    lines.push(`You asked: "${message}"`);
  }
  if (hasImage) {
    lines.push("");
    lines.push(
      "Image received. When a crop-disease model is integrated, this image will be analyzed for symptoms and you will get a diagnosis + treatment plan."
    );
  }
  if (hasDoc) {
    lines.push("");
    lines.push(
      "File received. When document parsers/models are integrated, soil reports and farm records will be extracted and summarized into recommendations."
    );
  }
  lines.push("");
  lines.push(
    "Tip: Include crop type, growth stage, location, and recent weather for more accurate agronomy recommendations."
  );
  return lines.join("\n");
};

// POST /api/ai/assist (chat + optional file/image uploads)
router.post(
  "/assist",
  auth.protect,
  upload.array("files", 5),
  async (req, res) => {
    try {
      const { message } = req.body;
      const files = (req.files || []).map((f) => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        filename: f.filename,
        url: `/uploads/ai/${f.filename}`,
      }));

      const jobId = randomUUID();
      const reply = buildStubReply({ message, files });

      const job = {
        id: jobId,
        status: "completed",
        createdAt: new Date().toISOString(),
        userId: String(req.user?._id || ""),
        input: { message, files },
        output: { reply },
      };
      jobs.set(jobId, job);

      return res.json({ jobId, status: job.status, reply, files });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
);

// GET /api/ai/jobs/:id (polling-ready)
router.get("/jobs/:id", auth.protect, async (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.userId !== String(req.user?._id || ""))
    return res.status(403).json({ error: "Not authorized" });
  return res.json(job);
});

module.exports = router;


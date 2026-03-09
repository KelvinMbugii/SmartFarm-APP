const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Knowledge = require('../models/Knowledge');
const auth = require('../middlewares/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads', 'knowledge');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
    cb(null, true);
  },
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Knowledge.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload article image (officer/admin only)
router.post('/upload-image', auth.protect, upload.single('image'), async (req, res) => {
  try {
    if (!['officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only officers and admins can upload article images' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const imageUrl = `/uploads/knowledge/${req.file.filename}`;
    res.status(201).json({
      url: imageUrl,
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all knowledge articles (public, but can filter)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const articles = await Knowledge.find(query)
      .populate('author', 'name email role avatar')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip(skip);

    const total = await Knowledge.countDocuments(query);

    res.json({
      articles,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Knowledge.findById(req.params.id)
      .populate('author', 'name email role avatar')
      .populate('likes', 'name');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views only for published articles
    if (article.status === 'published') {
      article.views += 1;
      await article.save();
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create article (officer/admin only)
router.post('/', auth.protect, async (req, res) => {
  try {
    if (!['officer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only officers and admins can create articles' });
    }

    const nextStatus = req.body.status === 'draft' ? 'draft' : 'published';
    const article = new Knowledge({
      ...req.body,
      status: nextStatus,
      publishedAt: nextStatus === 'published' ? new Date() : undefined,
      author: req.user._id,
    });

    await article.save();
    await article.populate('author', 'name email role avatar');

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/:id', auth.protect, async (req, res) => {
  try {
    const article = await Knowledge.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only author or admin can update
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this article' });
    }

    const wasDraft = article.status === 'draft';
    Object.assign(article, req.body);

    if (wasDraft && article.status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }

    await article.save();
    await article.populate('author', 'name email role avatar');

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
router.delete('/:id', auth.protect, async (req, res) => {
  try {
    const article = await Knowledge.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Only author or admin can delete
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/Unlike article
router.post('/:id/like', auth.protect, async (req, res) => {
  try {
    const article = await Knowledge.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = article.likes.findIndex(id => id.toString() === userId);

    if (likeIndex > -1) {
      article.likes.splice(likeIndex, 1);
    } else {
      article.likes.push(req.user._id);
    }

    await article.save();
    res.json({ likes: article.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
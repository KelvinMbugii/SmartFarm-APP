const express = require('express');
const Knowledge = require('../models/Knowledge');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get all knowledge articles (public, but can filter)
router.get('/', async (req, res) => {
    try {
        const { category, search, featured, limit = 20, page = 1 } = req.query;
        const query = {};

        if (category) query.category = category;
        if (featured === 'true') query.featured = true;
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const articles = await Knowledge.find(query)
            .populate('author', 'name email role avatar')
            .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Knowledge.countDocuments(query);

        res.json({
            articles,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
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

        // Increment views
        article.views += 1;
        await article.save();

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

        const article = new Knowledge({
            ...req.body,
            author: req.user._id
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

        Object.assign(article, req.body);
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

// Get categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Knowledge.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


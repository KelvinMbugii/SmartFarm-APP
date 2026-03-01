const express = require('express');
const Forum = require('../models/Forum');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get all forum posts
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 20, page = 1, sort = 'recent' } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        let sortOption = {};
        if (sort === 'recent') sortOption = { createdAt: -1 };
        else if (sort === 'popular') sortOption = { views: -1, likes: -1 };
        else if (sort === 'trending') sortOption = { 'comments.length': -1, createdAt: -1 };

        const posts = await Forum.find(query)
            .populate('author', 'name email role avatar')
            .populate('comments.author', 'name avatar')
            .populate('comments.replies.author', 'name avatar')
            .sort(search ? { score: { $meta: 'textScore' } } : sortOption)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Forum.countDocuments(query);

        res.json({
            posts,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id)
            .populate('author', 'name email role avatar')
            .populate('likes', 'name')
            .populate('comments.author', 'name avatar role')
            .populate('comments.likes', 'name')
            .populate('comments.replies.author', 'name avatar role')
            .populate('comments.replies.likes', 'name');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment views
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create post
router.post('/', auth.protect, async (req, res) => {
    try {
        const post = new Forum({
            ...req.body,
            author: req.user._id
        });

        await post.save();
        await post.populate('author', 'name email role avatar');

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update post
router.put('/:id', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Only author or admin can update
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        Object.assign(post, req.body);
        await post.save();
        await post.populate('author', 'name email role avatar');

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete post
router.delete('/:id', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Only author or admin can delete
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like/Unlike post
router.post('/:id/like', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userId = req.user._id.toString();
        const likeIndex = post.likes.findIndex(id => id.toString() === userId);

        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment
router.post('/:id/comment', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        post.comments.push({
            author: req.user._id,
            content: req.body.content
        });

        await post.save();
        await post.populate('comments.author', 'name avatar role');

        const newComment = post.comments[post.comments.length - 1];
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update comment
router.put('/:id/comment/:commentId', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only author or admin can update
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        comment.content = req.body.content;
        await post.save();
        await post.populate('comments.author', 'name avatar role');

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete comment
router.delete('/:id/comment/:commentId', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only author or admin can delete
        if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like/Unlike comment
router.post('/:id/comment/:commentId/like', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user._id.toString();
        const likeIndex = comment.likes.findIndex(id => id.toString() === userId);

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push(req.user._id);
        }

        await post.save();
        res.json({ likes: comment.likes.length, liked: likeIndex === -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add reply to comment
router.post('/:id/comment/:commentId/reply', auth.protect, async (req, res) => {
    try {
        const post = await Forum.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.replies.push({
            author: req.user._id,
            content: req.body.content
        });

        await post.save();
        await post.populate('comments.replies.author', 'name avatar role');

        const newReply = comment.replies[comment.replies.length - 1];
        res.status(201).json(newReply);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
    try {
        const categories = await Forum.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


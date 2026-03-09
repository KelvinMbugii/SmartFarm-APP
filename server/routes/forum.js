const express = require('express');
const Forum = require('../models/Forum');
const auth = require('../middlewares/auth');

const router = express.Router();

const isModerator = (user) => ['officer', 'admin'].includes(user?.role);

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Forum.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderation queue: reported posts/comments
router.get('/reports', auth.protect, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return res.status(403).json({ error: 'Only officers and admins can view reports' });
    }

    const { status = 'open' } = req.query;
    const posts = await Forum.find({ 'reports.status': status })
      .select('title author category reports createdAt')
      .populate('author', 'name role')
      .populate('reports.reporter', 'name role')
      .populate('reports.reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    const queue = posts.flatMap((post) =>
      post.reports
        .filter((report) => report.status === status)
        .map((report) => ({
          postId: post._id,
          postTitle: post.title,
          postAuthor: post.author,
          report,
        }))
    );

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve a report
router.put('/reports/:reportId/resolve', auth.protect, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return res.status(403).json({ error: 'Only officers and admins can resolve reports' });
    }

    const post = await Forum.findOne({ 'reports._id': req.params.reportId });
    if (!post) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const report = post.reports.id(req.params.reportId);
    report.status = 'resolved';
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    if (req.body.note) report.note = req.body.note;

    await post.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1, sort = 'recent' } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sortOption = { pinned: -1, createdAt: -1 };
    if (sort === 'popular') sortOption = { pinned: -1, views: -1, createdAt: -1 };
    else if (sort === 'trending') sortOption = { pinned: -1, createdAt: -1 };

    const posts = await Forum.find(query)
      .populate('author', 'name email role avatar')
      .populate('comments.author', 'name avatar')
      .populate('comments.replies.author', 'name avatar')
      .sort(search ? { score: { $meta: 'textScore' } } : sortOption)
      .limit(parseInt(limit, 10))
      .skip(skip);

    const total = await Forum.countDocuments(query);

    res.json({
      posts,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
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
      .populate('comments.verifiedBy', 'name role')
      .populate('comments.replies.author', 'name avatar role')
      .populate('comments.replies.likes', 'name');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

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
      author: req.user._id,
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

// Pin or unpin post (officer/admin)
router.post('/:id/pin', auth.protect, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return res.status(403).json({ error: 'Only officers and admins can pin posts' });
    }

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const shouldPin = typeof req.body.pinned === 'boolean' ? req.body.pinned : !post.pinned;
    post.pinned = shouldPin;
    post.pinnedBy = shouldPin ? req.user._id : undefined;
    post.pinnedAt = shouldPin ? new Date() : undefined;
    await post.save();

    res.json({ pinned: post.pinned, pinnedAt: post.pinnedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report post/comment
router.post('/:id/report', auth.protect, async (req, res) => {
  try {
    const { reason, targetType = 'post', targetCommentId } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (targetType === 'comment') {
      const comment = post.comments.id(targetCommentId);
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found for report' });
      }
    }

    post.reports.push({
      reporter: req.user._id,
      reason,
      targetType,
      targetCommentId: targetType === 'comment' ? targetCommentId : undefined,
    });

    await post.save();
    res.status(201).json({ message: 'Report submitted' });
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
    const likeIndex = post.likes.findIndex((id) => id.toString() === userId);

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
      content: req.body.content,
    });

    await post.save();
    await post.populate('comments.author', 'name avatar role');

    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark / unmark verified answer (officer/admin)
router.post('/:id/comment/:commentId/verify', auth.protect, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return res.status(403).json({ error: 'Only officers and admins can verify answers' });
    }

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const shouldVerify = typeof req.body.verified === 'boolean' ? req.body.verified : !comment.verifiedAnswer;
    comment.verifiedAnswer = shouldVerify;
    comment.verifiedBy = shouldVerify ? req.user._id : undefined;
    comment.verifiedAt = shouldVerify ? new Date() : undefined;

    post.solved = post.comments.some((c) => c.verifiedAnswer);

    await post.save();
    await post.populate('comments.author', 'name avatar role');
    await post.populate('comments.verifiedBy', 'name role');

    res.json(comment);
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

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    post.comments.pull(req.params.commentId);
    post.solved = post.comments.some((c) => c.verifiedAnswer);
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
    const likeIndex = comment.likes.findIndex((id) => id.toString() === userId);

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
      content: req.body.content,
    });

    await post.save();
    await post.populate('comments.replies.author', 'name avatar role');

    const newReply = comment.replies[comment.replies.length - 1];
    res.status(201).json(newReply);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
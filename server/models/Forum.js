const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'comment'],
      default: 'post',
    },
    targetCommentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    note: String,
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    verifiedAnswer: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    replies: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'general',
        'crops',
        'livestock',
        'equipment',
        'market',
        'pest-disease',
        'irrigation',
        'organic',
        'technology',
        'help',
      ],
      default: 'general',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    reports: [reportSchema],
    pinned: {
      type: Boolean,
      default: false,
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pinnedAt: Date,
    solved: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

forumPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Forum', forumPostSchema, 'forum_posts');
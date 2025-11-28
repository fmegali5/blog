const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

// ⭐ ضع هذا الـ route في الأول - الـ routes العامة قبل الـ dynamic ones
// @route   GET /api/posts
// @desc    Get all posts with pagination and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Build search query
    const searchQuery = search 
      ? { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        }
      : {};

    const posts = await Post.find(searchQuery)
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(searchQuery);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalPosts: total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get all posts by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ⭐ ضع هذا في الآخر - الـ dynamic routes بعد الـ specific routes
// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST routes
// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, tags, coverImage } = req.body;

    const post = new Post({
      title,
      content,
      excerpt,
      tags: tags || [],
      coverImage,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT routes
// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (Owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, excerpt, tags, coverImage } = req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.tags = tags || post.tags;
    post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;

    await post.save();
    await post.populate('author', 'username');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE routes
// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

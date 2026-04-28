const Post = require('../models/Post');

// CREATE POST
exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        const post = await Post.create({
            title,
            content,
            author: req.user._id  // comes from auth middleware
        });

        res.status(201).json({ message: 'Post created', post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET ALL POSTS
exports.getAllPosts = async (req, res) => {
    try {
        // populate() replaces author ID with actual user data
        const posts = await Post.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 }); // newest first

        res.status(200).json({ posts });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET SINGLE POST
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE POST
exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization check — is this user the owner?
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;
        await post.save();

        res.status(200).json({ message: 'Post updated', post });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE POST
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Authorization check
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();

        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
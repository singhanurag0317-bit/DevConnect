const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');

// Middleware to get current user from cookie (for views)
const getCurrentUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
        next();
    } catch (err) {
        next();
    }
};

// Redirect root to dashboard
router.get('/', (req, res) => res.redirect('/dashboard'));

// AUTH PAGES
router.get('/auth/login', (req, res) => {
    res.render('pages/login', { error: null });
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('pages/login', { error: 'Invalid email or password' });
        }
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.redirect('/dashboard');
    } catch (err) {
        res.render('pages/login', { error: err.message });
    }
});

router.get('/auth/register', (req, res) => {
    res.render('pages/register', { error: null });
});

router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) {
            return res.render('pages/register', { error: 'Email already registered' });
        }
        await User.create({ name, email, password });
        res.redirect('/auth/login');
    } catch (err) {
        res.render('pages/register', { error: err.message });
    }
});

router.get('/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/auth/login');
});

// DASHBOARD
router.get('/dashboard', getCurrentUser, async (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 });
    res.render('pages/dashboard', { user: req.user, posts });
});

// CREATE POST
router.get('/post/create', getCurrentUser, (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    res.render('pages/createPost', { error: null });
});

router.post('/post/create', getCurrentUser, async (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    try {
        const { title, content } = req.body;
        await Post.create({ title, content, author: req.user._id });
        res.redirect('/dashboard');
    } catch (err) {
        res.render('pages/createPost', { error: err.message });
    }
});

// SINGLE POST
router.get('/post/:id', getCurrentUser, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name _id');
        if (!post) return res.redirect('/dashboard');
        res.render('pages/post', { post, user: req.user || null });
    } catch (err) {
        res.redirect('/dashboard');
    }
});

// DELETE POST
router.post('/post/:id/delete', getCurrentUser, async (req, res) => {
    if (!req.user) return res.redirect('/auth/login');
    const post = await Post.findById(req.params.id);
    if (post && post.author.toString() === req.user._id.toString()) {
        await post.deleteOne();
    }
    res.redirect('/dashboard');
});

module.exports = router;
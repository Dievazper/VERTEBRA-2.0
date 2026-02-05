const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Post = require('../models/Post');

// Hardcoded Admin Credentials (in production, use DB)
const adminUser = {
    username: 'admin',
    passwordHash: '$2b$10$sbcD8jyAohespXTeGdd8guutLJv2zGC.tThFNOLjbHy65fulNpd0C' // 'admin'
};

// Authentication Middleware
const isAdmin = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/admin/login');
};

// GET Login Page
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', { error: null });
});

// POST Login Logic
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === adminUser.username) {
        const match = await bcrypt.compare(password, adminUser.passwordHash);
        if (match) {
            req.session.user = { username: username };
            return res.redirect('/admin/dashboard');
        }
    }

    res.render('admin/login', { error: 'Invalid credentials' });
});

// GET Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// GET Dashboard (Protected)
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('admin/dashboard', { posts });
    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }
});

// GET Create Post Page
router.get('/create', isAdmin, (req, res) => {
    res.render('admin/create-post');
});

// POST Create Post
router.post('/create', isAdmin, async (req, res) => {
    const { title, slug, body, image, category } = req.body;
    const newPost = new Post({
        title,
        slug,
        body,
        image,
        // category // Schema update might be needed if category is strictly required by prompt
    });

    try {
        await newPost.save();
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.render('admin/create-post', { error: 'Error creating post', post: req.body });
    }
});

// GET Edit Post Page
router.get('/edit/:id', isAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.redirect('/admin/dashboard');
        res.render('admin/edit-post', { post });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

// PUT Edit Post
router.put('/edit/:id', isAdmin, async (req, res) => {
    try {
        const { title, slug, body, image } = req.body;
        await Post.findByIdAndUpdate(req.params.id, {
            title,
            slug,
            body,
            image,
            // category
        });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

// DELETE Post
router.delete('/delete/:id', isAdmin, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;

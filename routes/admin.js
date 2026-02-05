const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Post = require('../models/Post');
const User = require('../models/User');

// --- INITIAL SEED ---
// Ensure one admin exists so the user isn't locked out.
(async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword
            });
            console.log('Seed: Created initial admin user (admin / admin123)');
        }
    } catch (e) {
        console.error('Seed: Error checking/creating initial user', e);
    }
})();

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

// POST Login Logic (DB Backed)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render('admin/login', { error: 'Invalid credentials' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.user = { id: user._id, username: user.username };
            return res.redirect('/admin/dashboard');
        } else {
            return res.render('admin/login', { error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.render('admin/login', { error: 'Server error' });
    }
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

// --- POST MANAGEMENT ---

// GET Create Post Page
router.get('/create', isAdmin, (req, res) => {
    res.render('admin/create-post');
});

// POST Create Post
router.post('/create', isAdmin, async (req, res) => {
    const { title, slug, body, image } = req.body;
    const newPost = new Post({ title, slug, body, image });

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
        await Post.findByIdAndUpdate(req.params.id, { title, slug, body, image });
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

// --- USER MANAGEMENT ---

// GET List Users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', { users });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

// GET Create User Page
router.get('/users/create', isAdmin, (req, res) => {
    res.render('admin/create-user');
});

// POST Create User
router.post('/users/create', isAdmin, async (req, res) => {
    const { username, password } = req.body;
    try {
        const existing = await User.findOne({ username });
        if (existing) {
            return res.send("User already exists");
        }

        // Model pre-save hook handles hashing
        const newUser = new User({ username, password });
        await newUser.save();
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.send("Error creating user");
    }
});

// DELETE User
router.delete('/users/delete/:id', isAdmin, async (req, res) => {
    try {
        // Prevent deleting self? (Optional but good practice)
        if (req.session.user.id === req.params.id) {
            // For simplicity, just redirect or show error. 
            // Ideally we shouldn't allow deleting self to prevent lockout if only one admin.
            return res.redirect('/admin/users');
        }

        await User.findByIdAndDelete(req.params.id);
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/users');
    }
});

module.exports = router;

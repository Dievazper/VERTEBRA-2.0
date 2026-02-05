const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Home Page - List Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('index', { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Single Post Page
router.get('/post/:slug', async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug });
        if (!post) {
            return res.status(404).render('404'); // Assuming a 404 view or simple message
        }
        res.render('post', { post });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

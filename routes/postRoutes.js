const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const {
    createPost,
    getAllPosts,
    getPost,
    updatePost,
    deletePost
} = require('../controllers/postController');

router.get('/', getAllPosts);               // public — anyone can read
router.get('/:id', getPost);               // public — anyone can read
router.post('/', protect, createPost);     // protected — must be logged in
router.put('/:id', protect, updatePost);   // protected — must be logged in
router.delete('/:id', protect, deletePost); // protected — must be logged in

module.exports = router;
const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');

router.get('/:id', getUserProfile);                    // public
router.put('/:id', protect, updateUserProfile);        // protected

module.exports = router;
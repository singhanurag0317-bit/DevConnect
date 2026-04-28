const User = require('../models/User');

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE YOUR OWN PROFILE
exports.updateUserProfile = async (req, res) => {
    try {
        // Can only update your own profile
        if (req.params.id !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const { name, bio } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
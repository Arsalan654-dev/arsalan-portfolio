const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { uploadFile, deleteFile } = require('../../services/cloudinary.service');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('country', 'country_name country_code')
      .populate('city', 'city_name');

    return res.status(200).json({
      success: true,
      message: 'Admin profile fetched.',
      data: user
    });
  } catch (error) {
    console.error('Get Admin Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fieldMap = { mobile: 'mobileNumber', name: 'name', mobileNumber: 'mobileNumber', country: 'country', city: 'city', address: 'address' };
    const updates = {};
    for (const [incoming, dbField] of Object.entries(fieldMap)) {
      if (req.body[incoming] !== undefined) {
        updates[dbField] = req.body[incoming];
      }
    }
    if (updates.country === '') updates.country = null;
    if (updates.city === '') updates.city = null;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    })
      .select('-password')
      .populate('country', 'country_name country_code')
      .populate('city', 'city_name');

    return res.status(200).json({
      success: true,
      message: 'Admin profile updated.',
      data: user
    });
  } catch (error) {
    console.error('Update Admin Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }

    const currentUser = await User.findById(req.user._id);
    const oldPublicId = currentUser.profilePicturePublicId;

    const result = await uploadFile(req.file, 'avatars');

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: result.url, profilePicturePublicId: result.publicId },
      { new: true }
    ).select('-password');

    if (oldPublicId) {
      await deleteFile(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Avatar updated.',
      data: user
    });
  } catch (error) {
    console.error('Update Admin Avatar Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Password not set.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change Admin Password Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

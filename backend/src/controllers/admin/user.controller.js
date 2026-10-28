const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../../models/User');
const { sendEmail } = require('../../services/email.service');
const { emailVerificationTemplate } = require('../../utils/emailTemplates');
const { storeSet } = require('../../utils/store');

exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'user' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await storeSet(`verifyEmail:${verifyToken}`, 24 * 60 * 60, user._id.toString());

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
    const template = emailVerificationTemplate(user.name, verifyUrl);
    await sendEmail({ to: user.email, ...template });

    return res.status(201).json({
      success: true,
      message: 'User created. Verification email sent.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Admin Create User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, role, isActive, isEmailVerified, sort } = req.query;

    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isEmailVerified !== undefined) filter.isEmailVerified = isEmailVerified === 'true';

    let sortOption = { createdAt: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    else if (sort === 'name_desc') sortOption = { name: -1 };
    else if (sort === 'email_asc') sortOption = { email: 1 };

    const users = await User.find(filter)
      .select('-password')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Users fetched.',
      data: users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin GetAll Users Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('country', 'country_name country_code')
      .populate('city', 'city_name');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User fetched.',
      data: user
    });
  } catch (error) {
    console.error('Admin GetById User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const allowedFields = ['name', 'mobileNumber', 'country', 'city', 'address', 'profilePicture'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated.',
      data: user
    });
  } catch (error) {
    console.error('Admin Update User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.enable = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User enabled.',
      data: user
    });
  } catch (error) {
    console.error('Enable User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.disable = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User disabled.',
      data: user
    });
  } catch (error) {
    console.error('Disable User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted.'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await User.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} users permanently deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Users Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.markDelete = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User marked as deleted (deactivated).',
      data: user
    });
  } catch (error) {
    console.error('MarkDelete User Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

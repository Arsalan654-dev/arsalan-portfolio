const fs = require('fs');
const Order = require('../../models/Order');
const User = require('../../models/User');
const { sendEmail } = require('../../services/email.service');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, paymentStatus, orderStatus, startDate, endDate, sort } = req.query;

    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (orderStatus) filter.orderStatus = orderStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    let userFilter = null;
    if (search) {
      const users = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = users.map(u => u._id);
      if (userIds.length) {
        filter.user = { $in: userIds };
      } else {
        filter.orderNumber = { $regex: search, $options: 'i' };
      }
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'amount_asc') sortOption = { totalAmount: 1 };
    else if (sort === 'amount_desc') sortOption = { totalAmount: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const orders = await Order.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('items.item');

    const total = await Order.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Orders fetched.',
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Admin GetAll Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.item');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Order fetched.',
      data: order
    });
  } catch (error) {
    console.error('Admin GetById Order Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const { subject, html, body } = req.body;
    const content = html || body;

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Files are stored on disk (diskStorage), so reference them by path.
    const attachments = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        attachments.push({
          filename: file.originalname,
          path: file.path
        });
      }
    }

    const sent = await sendEmail({
      to: order.user.email,
      subject: subject || `Regarding your order #${order.orderNumber}`,
      html: content,
      attachments: attachments.length ? attachments : undefined
    });

    // Clean up temporary uploaded files.
    for (const file of req.files || []) {
      fs.unlink(file.path, () => {});
    }

    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send email.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully.'
    });
  } catch (error) {
    console.error('Send Order Email Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.orderStatus !== 'sent') {
      return res.status(400).json({ success: false, message: 'Only sent orders can be deleted.' });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Order deleted.'
    });
  } catch (error) {
    console.error('Delete Order Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await Order.deleteMany(
      { _id: { $in: ids }, orderStatus: 'sent' }
    );

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} orders deleted (skipped not sent).`
    });
  } catch (error) {
    console.error('DeleteAll Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const User = require('../../models/User');
const Order = require('../../models/Order');
const Project = require('../../models/Project');
const Service = require('../../models/Service');
const ContactQuery = require('../../models/ContactQuery');
const Review = require('../../models/Review');

exports.getMetrics = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalServices, totalOrders, totalRevenue, totalContacts, totalReviews] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Project.countDocuments({ isDeleted: false }),
      Service.countDocuments({ isDeleted: false }),
      Order.countDocuments({ isDeleted: false }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      ContactQuery.countDocuments({ isDeleted: false }),
      Review.countDocuments({ isDeleted: false })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Dashboard metrics fetched.',
      data: {
        totalUsers,
        totalProjects,
        totalServices,
        totalOrders,
        totalRevenue: totalRevenue.length ? totalRevenue[0].total : 0,
        totalContacts,
        totalReviews
      }
    });
  } catch (error) {
    console.error('GetMetrics Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const now = new Date();
    let startDate;

    if (period === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [revenueData, orderData, userData] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid', isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return res.status(200).json({
      success: true,
      message: 'Analytics fetched.',
      data: { revenue: revenueData, orders: orderData, users: userData, period }
    });
  } catch (error) {
    console.error('GetAnalytics Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [recentOrders, recentUsers, recentContacts, recentReviews] = await Promise.all([
      Order.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name email')
        .select('orderNumber totalAmount paymentStatus createdAt'),
      User.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name email role createdAt'),
      ContactQuery.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('name email subject createdAt isReplied'),
      Review.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'name')
        .select('rating reviewText itemType createdAt')
    ]);

    const activities = [
      ...recentOrders.map(o => ({
        type: 'order',
        message: `Order #${o.orderNumber} - $${o.totalAmount}`,
        time: o.createdAt,
        data: o
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        message: `${u.name} (${u.role}) joined`,
        time: u.createdAt,
        data: u
      })),
      ...recentContacts.map(c => ({
        type: 'contact',
        message: `${c.name} - ${c.subject}`,
        time: c.createdAt,
        data: c
      })),
      ...recentReviews.map(r => ({
        type: 'review',
        message: `${r.user?.name || 'Unknown'} rated ${r.rating}/5`,
        time: r.createdAt,
        data: r
      }))
    ];

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recent = activities.slice(0, limit);

    return res.status(200).json({
      success: true,
      message: 'Recent activities fetched.',
      data: recent
    });
  } catch (error) {
    console.error('GetRecentActivities Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const ContactQuery = require('../../models/ContactQuery');
const { sendEmail } = require('../../services/email.service');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, isReplied } = req.query;

    const filter = {};
    if (isReplied !== undefined) filter.isReplied = isReplied === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await ContactQuery.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ContactQuery.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Contact queries fetched.',
      data: contacts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll ContactQueries Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const contact = await ContactQuery.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact query not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact query fetched.',
      data: contact
    });
  } catch (error) {
    console.error('GetById ContactQuery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.replyEmail = async (req, res) => {
  try {
    const { subject, html } = req.body;

    const contact = await ContactQuery.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact query not found.' });
    }

    const sent = await sendEmail({ to: contact.email, subject, html });
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send email.' });
    }

    contact.isReplied = true;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully.',
      data: contact
    });
  } catch (error) {
    console.error('Reply ContactQuery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const contact = await ContactQuery.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact query not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Contact query deleted.'
    });
  } catch (error) {
    console.error('Delete ContactQuery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

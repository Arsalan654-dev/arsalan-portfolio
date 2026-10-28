const Technology = require('../../models/Technology');
const { generateSlug } = require('../../utils/helpers');
const { deleteFile } = require('../../services/cloudinary.service');

exports.create = async (req, res) => {
  try {
    const { technology_title } = req.body;
    const slug = generateSlug(technology_title);

    const data = { technology_title, slug };
    if (req.file) {
      const { uploadFile } = require('../../services/cloudinary.service');
      const result = await uploadFile(req.file, 'technologies');
      data.icon = result.url;
    } else if (req.body.icon) {
      data.icon = req.body.icon;
    }

    const technology = await Technology.create(data);

    return res.status(201).json({
      success: true,
      message: 'Technology created.',
      data: technology
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Technology already exists.' });
    }
    console.error('Create Technology Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = {};
    if (search) filter.technology_title = { $regex: search, $options: 'i' };

    const technologies = await Technology.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Technology.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Technologies fetched.',
      data: technologies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Technologies Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const technology = await Technology.findById(req.params.id);
    if (!technology) {
      return res.status(404).json({ success: false, message: 'Technology not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Technology fetched.',
      data: technology
    });
  } catch (error) {
    console.error('GetById Technology Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { technology_title } = req.body;
    const updates = {};
    if (technology_title) {
      updates.technology_title = technology_title;
      updates.slug = generateSlug(technology_title);
    }
    if (req.file) {
      const { uploadFile } = require('../../services/cloudinary.service');
      const result = await uploadFile(req.file, 'technologies');
      updates.icon = result.url;
    } else if (req.body.icon !== undefined) {
      updates.icon = req.body.icon || null;
    }

    const technology = await Technology.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!technology) {
      return res.status(404).json({ success: false, message: 'Technology not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Technology updated.',
      data: technology
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Technology already exists.' });
    }
    console.error('Update Technology Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const technology = await Technology.findByIdAndDelete(req.params.id);

    if (!technology) {
      return res.status(404).json({ success: false, message: 'Technology not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Technology deleted.'
    });
  } catch (error) {
    console.error('Delete Technology Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Technology.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} technologies deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Technologies Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



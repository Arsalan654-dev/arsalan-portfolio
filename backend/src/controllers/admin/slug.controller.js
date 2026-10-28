const Slug = require('../../models/Slug');
const { generateSlug } = require('../../utils/helpers');

exports.create = async (req, res) => {
  try {
    const slug_title = req.body.slug_title || req.body.slug;
    const slug = generateSlug(slug_title);

    const slugDoc = await Slug.create({ slug_title, slug });

    return res.status(201).json({
      success: true,
      message: 'Slug created.',
      data: slugDoc
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Slug already exists.' });
    }
    console.error('Create Slug Error:', error);
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
    if (search) filter.slug_title = { $regex: search, $options: 'i' };

    const slugs = await Slug.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Slug.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Slugs fetched.',
      data: slugs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Slugs Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const slugDoc = await Slug.findById(req.params.id);
    if (!slugDoc) {
      return res.status(404).json({ success: false, message: 'Slug not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Slug fetched.',
      data: slugDoc
    });
  } catch (error) {
    console.error('GetById Slug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const slug_title = req.body.slug_title || req.body.slug;
    const updates = {};
    if (slug_title) {
      updates.slug_title = slug_title;
      updates.slug = generateSlug(slug_title);
    }

    const slugDoc = await Slug.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!slugDoc) {
      return res.status(404).json({ success: false, message: 'Slug not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Slug updated.',
      data: slugDoc
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Slug already exists.' });
    }
    console.error('Update Slug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const slugDoc = await Slug.findByIdAndDelete(req.params.id);

    if (!slugDoc) {
      return res.status(404).json({ success: false, message: 'Slug not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Slug deleted.'
    });
  } catch (error) {
    console.error('Delete Slug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Slug.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} slugs deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Slugs Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



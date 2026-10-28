const Category = require('../../models/Category');
const { generateSlug } = require('../../utils/helpers');

exports.create = async (req, res) => {
  try {
    const { category_title, icon } = req.body;
    const slug = generateSlug(category_title);

    const category = await Category.create({ category_title, slug, icon });

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }
    console.error('Create Category Error:', error);
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
    if (search) filter.category_title = { $regex: search, $options: 'i' };

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Categories fetched.',
      data: categories,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category fetched.',
      data: category
    });
  } catch (error) {
    console.error('GetById Category Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { category_title, icon } = req.body;
    const updates = {};
    if (category_title) {
      updates.category_title = category_title;
      updates.slug = generateSlug(category_title);
    }
    if (icon !== undefined) {
      updates.icon = icon;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated.',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }
    console.error('Update Category Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted.'
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Category.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} categories deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Categories Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



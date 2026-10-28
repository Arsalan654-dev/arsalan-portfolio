const Blog = require('../../models/Blog');
const { generateSlug } = require('../../utils/helpers');
const { uploadFile, deleteFile } = require('../../services/cloudinary.service');

exports.create = async (req, res) => {
  try {
    const { title, description, content, existingPictures } = req.body;
    const slug = generateSlug(title);

    const pictures = existingPictures ? (Array.isArray(existingPictures) ? existingPictures : JSON.parse(existingPictures)) : [];

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadFile(file, 'blogs');
        pictures.push(result.url);
      }
    }

    const blog = await Blog.create({ title, slug, description, content, pictures: [...new Set(pictures)] });

    return res.status(201).json({
      success: true,
      message: 'Blog created.',
      data: blog
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Blogs fetched.',
      data: blogs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Blogs Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog fetched.',
      data: blog
    });
  } catch (error) {
    console.error('GetById Blog Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, content, existingPictures, removedPictures } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    if (title) {
      blog.title = title;
      blog.slug = generateSlug(title);
    }
    if (description !== undefined) blog.description = description;
    if (content !== undefined) blog.content = content;

    let pictures = existingPictures ? (Array.isArray(existingPictures) ? existingPictures : JSON.parse(existingPictures)) : blog.pictures;

    if (removedPictures) {
      const toRemove = Array.isArray(removedPictures) ? removedPictures : JSON.parse(removedPictures);
      pictures = pictures.filter(p => !toRemove.includes(p));
    }

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadFile(file, 'blogs');
        pictures.push(result.url);
      }
    }

    blog.pictures = [...new Set(pictures)];
    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated.',
      data: blog
    });
  } catch (error) {
    console.error('Update Blog Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted.'
    });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Blog.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} blogs deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Blogs Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



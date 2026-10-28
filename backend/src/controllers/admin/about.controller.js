const AboutUs = require('../../models/AboutUs');
const { uploadFile, deleteFile } = require('../../services/cloudinary.service');

exports.create = async (req, res) => {
  try {
    const { title, description, existingPictures } = req.body;

    const pictures = existingPictures ? (Array.isArray(existingPictures) ? existingPictures : JSON.parse(existingPictures)) : [];

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadFile(file, 'about');
        pictures.push(result.url);
      }
    }

    const about = await AboutUs.create({ title, description, pictures: [...new Set(pictures)] });

    return res.status(201).json({
      success: true,
      message: 'About us created.',
      data: about
    });
  } catch (error) {
    console.error('Create About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const aboutList = await AboutUs.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AboutUs.countDocuments({});

    return res.status(200).json({
      success: true,
      message: 'About us entries fetched.',
      data: aboutList,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const about = await AboutUs.findById(req.params.id);
    if (!about) {
      return res.status(404).json({ success: false, message: 'About us entry not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'About us entry fetched.',
      data: about
    });
  } catch (error) {
    console.error('GetById About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, existingPictures, removedPictures } = req.body;

    const about = await AboutUs.findById(req.params.id);
    if (!about) {
      return res.status(404).json({ success: false, message: 'About us entry not found.' });
    }

    if (title !== undefined) about.title = title;
    if (description !== undefined) about.description = description;

    let pictures = existingPictures ? (Array.isArray(existingPictures) ? existingPictures : JSON.parse(existingPictures)) : about.pictures;

    if (removedPictures) {
      const toRemove = Array.isArray(removedPictures) ? removedPictures : JSON.parse(removedPictures);
      pictures = pictures.filter(p => !toRemove.includes(p));
    }

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await uploadFile(file, 'about');
        pictures.push(result.url);
      }
    }

    about.pictures = [...new Set(pictures)];
    await about.save();

    return res.status(200).json({
      success: true,
      message: 'About us entry updated.',
      data: about
    });
  } catch (error) {
    console.error('Update About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const about = await AboutUs.findByIdAndDelete(req.params.id);

    if (!about) {
      return res.status(404).json({ success: false, message: 'About us entry not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'About us entry deleted.'
    });
  } catch (error) {
    console.error('Delete About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await AboutUs.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} about us entries deleted.`
    });
  } catch (error) {
    console.error('DeleteAll About Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



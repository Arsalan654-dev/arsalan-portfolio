const Gallery = require('../../models/Gallery');
const { uploadFile, deleteFile, deleteFiles } = require('../../services/cloudinary.service');

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No images provided.' });
    }

    const images = [];
    for (const file of req.files) {
      const result = await uploadFile(file, 'gallery');
      const gallery = await Gallery.create({ image: result.url, publicId: result.publicId });
      images.push(gallery);
    }

    return res.status(201).json({
      success: true,
      message: `${images.length} images uploaded.`,
      data: images
    });
  } catch (error) {
    console.error('Upload Gallery Images Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const images = await Gallery.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments({ isDeleted: false });

    return res.status(200).json({
      success: true,
      message: 'Gallery images fetched.',
      data: images,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Gallery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found.' });
    }

    await deleteFile(image.publicId);
    await Gallery.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Image deleted.'
    });
  } catch (error) {
    console.error('Delete Gallery Image Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;

    const images = await Gallery.find({ _id: { $in: ids } });
    const publicIds = images.map(img => img.publicId).filter(Boolean);

    if (publicIds.length) {
      await deleteFiles(publicIds);
    }

    await Gallery.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} images deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Gallery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

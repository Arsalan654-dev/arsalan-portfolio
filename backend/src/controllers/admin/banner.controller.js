const Banner = require('../../models/Banner');
const { uploadFile, deleteFile, deleteFiles } = require('../../services/cloudinary.service');

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ success: false, message: 'No images provided.' });
    }

    const banners = [];
    for (const file of req.files) {
      const result = await uploadFile(file, 'banners');
      const banner = await Banner.create({ image: result.url, publicId: result.publicId });
      banners.push(banner);
    }

    return res.status(201).json({
      success: true,
      message: `${banners.length} banners uploaded.`,
      data: banners
    });
  } catch (error) {
    console.error('Upload Banners Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Banners fetched.',
      data: banners
    });
  } catch (error) {
    console.error('GetAll Banners Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    await deleteFile(banner.publicId);
    await Banner.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Banner deleted.'
    });
  } catch (error) {
    console.error('Delete Banner Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;

    const banners = await Banner.find({ _id: { $in: ids } });
    const publicIds = banners.map(b => b.publicId).filter(Boolean);

    if (publicIds.length) {
      await deleteFiles(publicIds);
    }

    await Banner.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} banners deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Banners Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

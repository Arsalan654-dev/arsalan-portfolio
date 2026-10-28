const Service = require('../../models/Service');
const Review = require('../../models/Review');
const { generateSlug } = require('../../utils/helpers');
const { uploadFile, deleteFile, deleteFiles, deleteRemovedFiles } = require('../../services/cloudinary.service');

exports.create = async (req, res) => {
  try {
    const { title, description, category, technologies, skills, serviceSlugs, livePreviewUrl, price, existingPictures, existingVideos } = req.body;

    const slug = generateSlug(title);

    const safeParseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; } catch { return [val]; }
    };

    const pictures = existingPictures ? safeParseArray(existingPictures) : [];
    const videos = existingVideos ? safeParseArray(existingVideos) : [];

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        const result = await uploadFile(file, 'services');
        if (isVideo) {
          videos.push(result.url);
        } else {
          pictures.push(result.url);
        }
      }
    }

    const uniquePictures = [...new Set(pictures)];
    const uniqueVideos = [...new Set(videos)];

    const service = await Service.create({
      title,
      slug,
      description,
      category,
      technologies: safeParseArray(technologies),
      skills: safeParseArray(skills),
      serviceSlugs: safeParseArray(serviceSlugs),
      pictures: uniquePictures,
      videos: uniqueVideos,
      livePreviewUrl,
      price
    });

    return res.status(201).json({
      success: true,
      message: 'Service created.',
      data: service
    });
  } catch (error) {
    console.error('Create Service Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A service with this title already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid field value provided.' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, category, technology, sort } = req.query;

    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (technology) filter.technologies = technology;

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'title_asc') sortOption = { title: 1 };

    const services = await Service.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('serviceSlugs', 'slug_title');

    const total = await Service.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Services fetched.',
      data: services,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Services Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('serviceSlugs', 'slug_title');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const reviews = await Review.find({ item: service._id, itemType: 'services', isDeleted: false })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Service fetched.',
      data: { ...service.toObject(), reviews }
    });
  } catch (error) {
    console.error('GetById Service Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, category, technologies, skills, serviceSlugs, livePreviewUrl, price, existingPictures, existingVideos, removedPictures, removedVideos } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    if (title) {
      service.title = title;
      service.slug = generateSlug(title);
    }
    if (description !== undefined) service.description = description;
    if (category) service.category = category;

    const safeParseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; } catch { return [val]; }
    };

    if (technologies) service.technologies = safeParseArray(technologies);
    if (skills) service.skills = safeParseArray(skills);
    if (serviceSlugs) service.serviceSlugs = safeParseArray(serviceSlugs);
    if (livePreviewUrl !== undefined) service.livePreviewUrl = livePreviewUrl;
    if (price !== undefined) service.price = price;

    let pictures = existingPictures ? safeParseArray(existingPictures) : service.pictures;
    let videos = existingVideos ? safeParseArray(existingVideos) : service.videos;

    let removedPics = [];
    if (removedPictures) {
      removedPics = safeParseArray(removedPictures);
      pictures = pictures.filter(p => !removedPics.includes(p));
    }

    let removedVids = [];
    if (removedVideos) {
      removedVids = safeParseArray(removedVideos);
      videos = videos.filter(v => !removedVids.includes(v));
    }

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        const result = await uploadFile(file, 'services');
        if (isVideo) {
          videos.push(result.url);
        } else {
          pictures.push(result.url);
        }
      }
    }

    service.pictures = [...new Set(pictures)];
    service.videos = [...new Set(videos)];

    await service.save();

    await deleteRemovedFiles([...removedPics, ...removedVids]);

    return res.status(200).json({
      success: true,
      message: 'Service updated.',
      data: service
    });
  } catch (error) {
    console.error('Update Service Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A service with this title already exists.' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid field value provided.' });
    }
    return res.status(500).json({ success: false, message: error.message || 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service deleted.'
    });
  } catch (error) {
    console.error('Delete Service Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Service.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} services deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Services Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



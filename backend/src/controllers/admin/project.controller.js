const Project = require('../../models/Project');
const Review = require('../../models/Review');
const { generateSlug } = require('../../utils/helpers');
const { uploadFile, deleteFile, deleteFiles, deleteRemovedFiles } = require('../../services/cloudinary.service');

exports.create = async (req, res) => {
  try {
    const { title, description, category, technologies, skills, projectSlugs, livePreviewUrl, price, existingPictures, existingVideos } = req.body;

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
        const result = await uploadFile(file, 'projects');
        if (isVideo) {
          videos.push(result.url);
        } else {
          pictures.push(result.url);
        }
      }
    }

    const uniquePictures = [...new Set(pictures)];
    const uniqueVideos = [...new Set(videos)];

    const project = await Project.create({
      title,
      slug,
      description,
      category,
      technologies: safeParseArray(technologies),
      skills: safeParseArray(skills),
      projectSlugs: safeParseArray(projectSlugs),
      pictures: uniquePictures,
      videos: uniqueVideos,
      livePreviewUrl,
      price
    });

    return res.status(201).json({
      success: true,
      message: 'Project created.',
      data: project
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A project with this title already exists.' });
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

    const projects = await Project.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('projectSlugs', 'slug_title');

    const total = await Project.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Projects fetched.',
      data: projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Projects Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('projectSlugs', 'slug_title');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const reviews = await Review.find({ item: project._id, itemType: 'projects', isDeleted: false })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Project fetched.',
      data: { ...project.toObject(), reviews }
    });
  } catch (error) {
    console.error('GetById Project Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, description, category, technologies, skills, projectSlugs, livePreviewUrl, price, existingPictures, existingVideos, removedPictures, removedVideos } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (title) {
      project.title = title;
      project.slug = generateSlug(title);
    }
    if (description !== undefined) project.description = description;
    if (category) project.category = category;

    const safeParseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      try { const p = JSON.parse(val); return Array.isArray(p) ? p : [p]; } catch { return [val]; }
    };

    if (technologies) project.technologies = safeParseArray(technologies);
    if (skills) project.skills = safeParseArray(skills);
    if (projectSlugs) project.projectSlugs = safeParseArray(projectSlugs);
    if (livePreviewUrl !== undefined) project.livePreviewUrl = livePreviewUrl;
    if (price !== undefined) project.price = price;

    let pictures = existingPictures ? safeParseArray(existingPictures) : project.pictures;
    let videos = existingVideos ? safeParseArray(existingVideos) : project.videos;

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
        const result = await uploadFile(file, 'projects');
        if (isVideo) {
          videos.push(result.url);
        } else {
          pictures.push(result.url);
        }
      }
    }

    project.pictures = [...new Set(pictures)];
    project.videos = [...new Set(videos)];

    await project.save();

    await deleteRemovedFiles([...removedPics, ...removedVids]);

    return res.status(200).json({
      success: true,
      message: 'Project updated.',
      data: project
    });
  } catch (error) {
    console.error('Update Project Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A project with this title already exists.' });
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
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted.'
    });
  } catch (error) {
    console.error('Delete Project Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Project.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} projects deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Projects Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



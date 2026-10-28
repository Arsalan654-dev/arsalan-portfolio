const Project = require('../models/Project');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Technology = require('../models/Technology');
const Gallery = require('../models/Gallery');
const Banner = require('../models/Banner');
const AboutUs = require('../models/AboutUs');
const Blog = require('../models/Blog');
const ContactQuery = require('../models/ContactQuery');
const Resume = require('../models/Resume');
const Review = require('../models/Review');
const Subscription = require('../models/Subscription');
const { getChatbotResponse } = require('../services/chatbot.service');
const { sanitizeHtml } = require('../utils/helpers');

exports.getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { search, category, technology, sort, minPrice, maxPrice } = req.query;

    const filter = { isDeleted: false };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (technology) filter.technologies = technology;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const projects = await Project.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .select('-__v');

    const total = await Project.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Projects fetched.',
      data: projects,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetProjects Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isDeleted: false })
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('projectSlugs', 'slug_title');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Project fetched.',
      data: project
    });
  } catch (error) {
    console.error('GetProjectBySlug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getRelatedProjects = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, isDeleted: false });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const related = await Project.find({
      _id: { $ne: project._id },
      category: project.category,
      isDeleted: false
    })
      .limit(4)
      .populate('category', 'category_title slug')
      .select('-__v');

    return res.status(200).json({
      success: true,
      message: 'Related projects fetched.',
      data: related
    });
  } catch (error) {
    console.error('GetRelatedProjects Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { search, category, technology, sort, minPrice, maxPrice } = req.query;

    const filter = { isDeleted: false };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (technology) filter.technologies = technology;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const services = await Service.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .select('-__v');

    const total = await Service.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Services fetched.',
      data: services,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetServices Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getServiceBySlug = async (req, res) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isDeleted: false })
      .populate('category', 'category_title slug')
      .populate('technologies', 'technology_title slug icon')
      .populate('skills', 'skill_title skill_option')
      .populate('serviceSlugs', 'slug_title');

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service fetched.',
      data: service
    });
  } catch (error) {
    console.error('GetServiceBySlug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getRelatedServices = async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isDeleted: false });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const related = await Service.find({
      _id: { $ne: service._id },
      category: service.category,
      isDeleted: false
    })
      .limit(4)
      .populate('category', 'category_title slug')
      .select('-__v');

    return res.status(200).json({
      success: true,
      message: 'Related services fetched.',
      data: related
    });
  } catch (error) {
    console.error('GetRelatedServices Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false }).sort({ category_title: 1 });
    return res.status(200).json({
      success: true,
      message: 'Categories fetched.',
      data: categories
    });
  } catch (error) {
    console.error('GetCategories Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find({ isDeleted: false }).sort({ technology_title: 1 });
    return res.status(200).json({
      success: true,
      message: 'Technologies fetched.',
      data: technologies
    });
  } catch (error) {
    console.error('GetTechnologies Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getGallery = async (req, res) => {
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
      message: 'Gallery fetched.',
      data: images,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetGallery Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isDeleted: false }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Banners fetched.',
      data: banners
    });
  } catch (error) {
    console.error('GetBanners Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAbout = async (req, res) => {
  try {
    const about = await AboutUs.findOne({ isDeleted: false }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'About fetched.',
      data: about
    });
  } catch (error) {
    console.error('GetAbout Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = { isDeleted: false };
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
    console.error('GetBlogs Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isDeleted: false });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog fetched.',
      data: blog
    });
  } catch (error) {
    console.error('GetBlogBySlug Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await ContactQuery.create({
      name: sanitizeHtml(name),
      email,
      subject: sanitizeHtml(subject),
      message: sanitizeHtml(message)
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: contact
    });
  } catch (error) {
    console.error('SubmitContact Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Resume fetched.',
      data: resume
    });
  } catch (error) {
    console.error('GetResume Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getItemReviews = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!['projects', 'services'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type.' });
    }

    const reviews = await Review.find({ item: itemId, itemType, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profilePicture');

    const total = await Review.countDocuments({ item: itemId, itemType, isDeleted: false });

    return res.status(200).json({
      success: true,
      message: 'Reviews fetched.',
      data: reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetItemReviews Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const existing = await Subscription.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ success: false, message: 'Email already subscribed.' });
      }
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({ success: true, message: 'Subscription reactivated.' });
    }

    await Subscription.create({ email });
    return res.status(201).json({ success: true, message: 'Subscribed successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already subscribed.' });
    }
    console.error('Subscribe Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.chatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const response = await getChatbotResponse(message);

    return res.status(200).json({
      success: true,
      message: 'Chatbot response generated.',
      data: { response }
    });
  } catch (error) {
    console.error('ChatbotMessage Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

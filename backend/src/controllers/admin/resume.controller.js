const Resume = require('../../models/Resume');
const { uploadFile, deleteFile } = require('../../services/cloudinary.service');

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }

    const existingResume = await Resume.findOne().sort({ createdAt: -1 });
    if (existingResume && existingResume.publicId) {
      await deleteFile(existingResume.publicId);
      await Resume.findByIdAndDelete(existingResume._id);
    }

    const result = await uploadFile(req.file, 'resumes');

    const resume = await Resume.create({
      file: result.url,
      publicId: result.publicId,
      originalName: req.file.originalname
    });

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded.',
      data: resume
    });
  } catch (error) {
    console.error('Upload Resume Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.get = async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume fetched.',
      data: resume
    });
  } catch (error) {
    console.error('Get Resume Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ createdAt: -1 });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found.' });
    }

    if (resume.publicId) {
      await deleteFile(resume.publicId);
    }

    await Resume.findByIdAndDelete(resume._id);

    return res.status(200).json({
      success: true,
      message: 'Resume deleted.'
    });
  } catch (error) {
    console.error('Delete Resume Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

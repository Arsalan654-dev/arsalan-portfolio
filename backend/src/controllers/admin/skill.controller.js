const Skill = require('../../models/Skill');
const { generateSlug } = require('../../utils/helpers');

exports.create = async (req, res) => {
  try {
    const skill_title = req.body.skill_title || req.body.title;
    const { skill_option } = req.body;
    const slug = generateSlug(skill_title);

    const skill = await Skill.create({ skill_title, skill_option, slug });

    return res.status(201).json({
      success: true,
      message: 'Skill created.',
      data: skill
    });
  } catch (error) {
    console.error('Create Skill Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, skill_option } = req.query;

    const filter = {};
    if (skill_option) filter.skill_option = skill_option;
    if (search) filter.skill_title = { $regex: search, $options: 'i' };

    const skills = await Skill.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Skill.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Skills fetched.',
      data: skills,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Skills Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill fetched.',
      data: skill
    });
  } catch (error) {
    console.error('GetById Skill Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const skill_title = req.body.skill_title || req.body.title;
    const { skill_option } = req.body;
    const updates = {};
    if (skill_title) {
      updates.skill_title = skill_title;
      updates.slug = generateSlug(skill_title);
    }
    if (skill_option) updates.skill_option = skill_option;

    const skill = await Skill.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill updated.',
      data: skill
    });
  } catch (error) {
    console.error('Update Skill Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill deleted.'
    });
  } catch (error) {
    console.error('Delete Skill Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Skill.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} skills deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Skills Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



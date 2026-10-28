const Country = require('../../models/Country');
const City = require('../../models/City');

exports.create = async (req, res) => {
  try {
    const country_name = req.body.country_name || req.body.name;
    const country_code = req.body.country_code || req.body.code;

    const country = await Country.create({ country_name, country_code });

    return res.status(201).json({
      success: true,
      message: 'Country created.',
      data: country
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Country already exists.' });
    }
    console.error('Create Country Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { search } = req.query;

    const filter = {};
    if (search) filter.country_name = { $regex: search, $options: 'i' };

    const countries = await Country.find(filter)
      .sort({ country_name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Country.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Countries fetched.',
      data: countries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Countries Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Country fetched.',
      data: country
    });
  } catch (error) {
    console.error('GetById Country Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const country_name = req.body.country_name || req.body.name;
    const country_code = req.body.country_code || req.body.code;
    const updates = {};
    if (country_name) updates.country_name = country_name;
    if (country_code) updates.country_code = country_code;

    const country = await Country.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Country updated.',
      data: country
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Country name already exists.' });
    }
    console.error('Update Country Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const country = await Country.findByIdAndDelete(req.params.id);

    if (!country) {
      return res.status(404).json({ success: false, message: 'Country not found.' });
    }

    await City.deleteMany({ country: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Country and its cities deleted.'
    });
  } catch (error) {
    console.error('Delete Country Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await Country.deleteMany({ _id: { $in: ids } });
    await City.deleteMany({ country: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} countries and their cities deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Countries Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



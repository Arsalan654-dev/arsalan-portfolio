const City = require('../../models/City');

exports.create = async (req, res) => {
  try {
    const city_name = req.body.city_name || req.body.name;
    const { country } = req.body;

    const city = await City.create({ city_name, country });

    return res.status(201).json({
      success: true,
      message: 'City created.',
      data: city
    });
  } catch (error) {
    console.error('Create City Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { search, country } = req.query;

    const filter = {};
    if (country) filter.country = country;
    if (search) filter.city_name = { $regex: search, $options: 'i' };

    const cities = await City.find(filter)
      .sort({ city_name: 1 })
      .skip(skip)
      .limit(limit)
      .populate('country', 'country_name country_code');

    const total = await City.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Cities fetched.',
      data: cities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll Cities Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('country', 'country_name country_code');
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'City fetched.',
      data: city
    });
  } catch (error) {
    console.error('GetById City Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const city_name = req.body.city_name || req.body.name;
    const { country } = req.body;
    const updates = {};
    if (city_name) updates.city_name = city_name;
    if (country) updates.country = country;

    const city = await City.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).populate('country', 'country_name country_code');

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'City updated.',
      data: city
    });
  } catch (error) {
    console.error('Update City Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'City deleted.'
    });
  } catch (error) {
    console.error('Delete City Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getByCountry = async (req, res) => {
  try {
    const cities = await City.find({ country: req.params.countryId })
      .select('city_name')
      .sort({ city_name: 1 });

    return res.status(200).json({
      success: true,
      message: 'Cities fetched.',
      data: cities
    });
  } catch (error) {
    console.error('GetByCountry Cities Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await City.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} cities deleted.`
    });
  } catch (error) {
    console.error('DeleteAll Cities Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};



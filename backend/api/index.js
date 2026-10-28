const connectDB = require('../src/config/db');
const { configureCloudinary } = require('../src/config/cloudinary');
const app = require('../src/app');

module.exports = async (req, res) => {
  try {
    await connectDB();
    configureCloudinary();
    return app(req, res);
  } catch (error) {
    console.error('API bootstrap failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed.'
    });
  }
};

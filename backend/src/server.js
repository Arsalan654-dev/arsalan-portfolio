const app = require('./app');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;



const start = async () => {
  try {
    await connectDB();
    configureCloudinary();
    
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const errorMiddleware = require('./middlewares/error.middleware');
const routes = require('./routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));
app.use('/services-images', express.static(path.join(__dirname, '../../services')));

app.use('/api/v1', routes);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running.' });
});

app.use(errorMiddleware);

module.exports = app;

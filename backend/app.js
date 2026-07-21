const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support larger bulk uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static upload files first
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve dynamic SVGs for missing product images (fallback)
const imageFallbackMiddleware = require('./middleware/imageFallbackMiddleware');
app.use('/uploads', imageFallbackMiddleware);

// Root Status Check
app.get('/', (req, res) => {
  res.json({ message: 'Mahaveer Smart Furniture Hub S3 Integration API' });
});

// Mount Routes
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const bulkRoutes = require('./routes/bulkRoutes');
const imageRoutes = require('./routes/imageRoutes');
const roomRecommendationRoutes = require('./modules/ai/roomRecommendation/routes/roomRecommendation.routes');
const colorAdvisorRoutes = require('./modules/ai/colorAdvisor/routes/colorAdvisor.routes');
const assistantRoutes = require('./modules/ai/assistant/routes/assistant.routes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const metaRoutes = require('./routes/metaRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bulk', bulkRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/ai', roomRecommendationRoutes);
app.use('/api/ai', colorAdvisorRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/analytics', analyticsRoutes);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;

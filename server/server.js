const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const tracking = require('./socket/trackingSocket');

const app = express();
const server = http.createServer(app);

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});
tracking(io);
app.set('io', io);

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Rate limit on login attempts
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
  })
);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'TrustCart API is running healthy' })
);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/delivery-partners', require('./routes/deliveryPartnerRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/sellers', require('./routes/trustScoreRoutes'));
app.use('/api/trust', require('./routes/trustScoreRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const port = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(port, () =>
      console.log(`TrustCart server running on http://localhost:${port}`)
    );
  })
  .catch((e) => {
    console.error('Database connection failed:', e.message);
    process.exit(1);
  });


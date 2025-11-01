const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Mock database
let orders = [];
let bookings = [];
let userIdCounter = 1;
let orderIdCounter = 1;
let bookingIdCounter = 1;

// Logger
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`)
};

// Health check
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.json({ 
    status: 'OK', 
    message: 'Cruise Ship Management API is running on Netlify Functions',
    timestamp: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  logger.info(`Login attempt: ${email}`);
  
  const users = {
    'voyager@test.com': { type: 'voyager', name: 'John Voyager' },
    'admin@test.com': { type: 'admin', name: 'Admin User' },
    'manager@test.com': { type: 'manager', name: 'Manager User' },
    'cook@test.com': { type: 'head-cook', name: 'Head Cook' },
    'supervisor@test.com': { type: 'supervisor', name: 'Supervisor' }
  };

  if (users[email] && password === 'password') {
    const user = {
      uid: 'user-' + userIdCounter++,
      email: email,
      ...users[email]
    };
    logger.info(`Login successful: ${email}`);
    res.json({ success: true, user });
  } else {
    logger.error(`Login failed: ${email}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Catering orders
app.post('/api/orders/catering', (req, res) => {
  const order = {
    id: orderIdCounter++,
    ...req.body,
    type: 'catering',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  logger.info(`Catering order created: ${order.id}`);
  res.json({ success: true, message: 'Order placed successfully', order });
});

app.get('/api/orders/catering', (req, res) => {
  const cateringOrders = orders.filter(order => order.type === 'catering');
  res.json(cateringOrders);
});

// Stationery orders
app.post('/api/orders/stationery', (req, res) => {
  const order = {
    id: orderIdCounter++,
    ...req.body,
    type: 'stationery',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  logger.info(`Stationery order created: ${order.id}`);
  res.json({ success: true, message: 'Stationery order placed successfully', order });
});

app.get('/api/orders/stationery', (req, res) => {
  const stationeryOrders = orders.filter(order => order.type === 'stationery');
  res.json(stationeryOrders);
});

// Bookings
app.post('/api/bookings/resort', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'resort',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Resort booking created: ${booking.id}`);
  res.json({ success: true, message: 'Resort booking confirmed', booking });
});

app.post('/api/bookings/movie', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'movie',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Movie booking created: ${booking.id}`);
  res.json({ success: true, message: 'Movie booking confirmed', booking });
});

app.post('/api/bookings/salon', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'salon',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Salon booking created: ${booking.id}`);
  res.json({ success: true, message: 'Salon booking confirmed', booking });
});

app.post('/api/bookings/fitness', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'fitness',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Fitness center booking created: ${booking.id}`);
  res.json({ success: true, message: 'Fitness center booking confirmed', booking });
});

app.post('/api/bookings/party', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'party',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Party hall booking created: ${booking.id}`);
  res.json({ success: true, message: 'Party hall booking confirmed', booking });
});

// Get all data for admin/manager
app.get('/api/admin/orders', (req, res) => {
  res.json(orders);
});

app.get('/api/admin/bookings', (req, res) => {
  res.json(bookings);
});

// Update order status (for head-cook and supervisor)
app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = orders.find(order => order.id == id);
  if (order) {
    order.status = status;
    logger.info(`Order ${id} status updated to: ${status}`);
    res.json({ success: true, message: 'Order status updated', order });
  } else {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
});

// Add these booking endpoints to your existing api.js

app.post('/api/bookings/resort', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'resort',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Resort booking created: ${booking.id} for user ${req.body.userName}`);
  res.json({ success: true, message: 'Resort booking confirmed', booking });
});

app.post('/api/bookings/movie', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'movie',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Movie booking created: ${booking.id} for user ${req.body.userName}`);
  res.json({ success: true, message: 'Movie booking confirmed', booking });
});

app.post('/api/bookings/salon', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'salon',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Salon booking created: ${booking.id} for user ${req.body.userName}`);
  res.json({ success: true, message: 'Salon booking confirmed', booking });
});

app.post('/api/bookings/fitness', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'fitness',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Fitness center booking created: ${booking.id} for user ${req.body.userName}`);
  res.json({ success: true, message: 'Fitness center booking confirmed', booking });
});

app.post('/api/bookings/party', (req, res) => {
  const booking = {
    id: bookingIdCounter++,
    ...req.body,
    type: 'party',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(booking);
  logger.info(`Party hall booking created: ${booking.id} for user ${req.body.userName}`);
  res.json({ success: true, message: 'Party hall booking confirmed', booking });
});

exports.handler = serverless(app);
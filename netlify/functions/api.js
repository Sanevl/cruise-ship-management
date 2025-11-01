const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// File paths for persistent storage
const dataDir = '/tmp/data'; // Netlify Functions have write access to /tmp
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');
const bookingsFile = path.join(dataDir, 'bookings.json');

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read data from files
const readData = (filePath, defaultValue = []) => {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error reading file:', error.message);
  }
  return defaultValue;
};

// Write data to files
const writeData = (filePath, data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log('Error writing file:', error.message);
    return false;
  }
};

// Initialize data with default users if files don't exist
const initializeData = () => {
  const currentUsers = readData(usersFile);
  if (currentUsers.length === 0) {
    const defaultUsers = [
      { id: 1, email: 'voyager@test.com', type: 'voyager', name: 'John Voyager', status: 'active', joinDate: '2024-01-01' },
      { id: 2, email: 'admin@test.com', type: 'admin', name: 'Admin User', status: 'active', joinDate: '2024-01-01' },
      { id: 3, email: 'manager@test.com', type: 'manager', name: 'Manager User', status: 'active', joinDate: '2024-01-01' },
      { id: 4, email: 'cook@test.com', type: 'head-cook', name: 'Head Cook', status: 'active', joinDate: '2024-01-02' },
      { id: 5, email: 'supervisor@test.com', type: 'supervisor', name: 'Supervisor', status: 'active', joinDate: '2024-01-02' }
    ];
    writeData(usersFile, defaultUsers);
  }
};

// Initialize data on cold start
initializeData();

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
    message: 'Cruise Ship Management API is running with persistent storage',
    timestamp: new Date().toISOString(),
    storage: 'File-based persistent storage'
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  logger.info(`Login attempt: ${email}`);
  
  const users = readData(usersFile);
  const user = users.find(u => u.email === email);

  if (user && password === 'password') {
    logger.info(`Login successful: ${email}`);
    res.json({ 
      success: true, 
      user: {
        uid: user.id.toString(),
        email: user.email,
        type: user.type,
        name: user.name
      }
    });
  } else {
    logger.error(`Login failed: ${email}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// User management
app.get('/api/admin/users', (req, res) => {
  const users = readData(usersFile);
  res.json(users);
});

app.post('/api/admin/users', (req, res) => {
  const users = readData(usersFile);
  const newUser = {
    id: Date.now(),
    ...req.body,
    status: 'active',
    joinDate: new Date().toLocaleDateString()
  };
  
  users.push(newUser);
  if (writeData(usersFile, users)) {
    logger.info(`User created: ${newUser.email}`);
    res.json({ success: true, user: newUser });
  } else {
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
});

app.put('/api/admin/users/:id', (req, res) => {
  const users = readData(usersFile);
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    if (writeData(usersFile, users)) {
      logger.info(`User updated: ${users[userIndex].email}`);
      res.json({ success: true, user: users[userIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  const users = readData(usersFile);
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1)[0];
    if (writeData(usersFile, users)) {
      logger.info(`User deleted: ${deletedUser.email}`);
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

// Catering orders
app.post('/api/orders/catering', (req, res) => {
  const orders = readData(ordersFile);
  const order = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    ...req.body,
    type: 'catering',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  if (writeData(ordersFile, orders)) {
    logger.info(`Catering order created: ${order.id} by ${req.body.userName}`);
    res.json({ success: true, message: 'Order placed successfully', order });
  } else {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

app.get('/api/orders/catering', (req, res) => {
  const orders = readData(ordersFile);
  const cateringOrders = orders.filter(order => order.type === 'catering');
  res.json(cateringOrders);
});

// Stationery orders
app.post('/api/orders/stationery', (req, res) => {
  const orders = readData(ordersFile);
  const order = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    ...req.body,
    type: 'stationery',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  if (writeData(ordersFile, orders)) {
    logger.info(`Stationery order created: ${order.id} by ${req.body.userName}`);
    res.json({ success: true, message: 'Stationery order placed successfully', order });
  } else {
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
});

app.get('/api/orders/stationery', (req, res) => {
  const orders = readData(ordersFile);
  const stationeryOrders = orders.filter(order => order.type === 'stationery');
  res.json(stationeryOrders);
});

// Bookings
const createBooking = (type, req, res) => {
  const bookings = readData(bookingsFile);
  const booking = {
    id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
    ...req.body,
    type: type,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(booking);
  if (writeData(bookingsFile, bookings)) {
    logger.info(`${type} booking created: ${booking.id} for user ${req.body.userName}`);
    res.json({ success: true, message: `${type} booking confirmed`, booking });
  } else {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

app.post('/api/bookings/resort', (req, res) => createBooking('resort', req, res));
app.post('/api/bookings/movie', (req, res) => createBooking('movie', req, res));
app.post('/api/bookings/salon', (req, res) => createBooking('salon', req, res));
app.post('/api/bookings/fitness', (req, res) => createBooking('fitness', req, res));
app.post('/api/bookings/party', (req, res) => createBooking('party', req, res));

// Get all data for admin
app.get('/api/admin/orders', (req, res) => {
  const orders = readData(ordersFile);
  res.json(orders);
});

app.get('/api/admin/bookings', (req, res) => {
  const bookings = readData(bookingsFile);
  res.json(bookings);
});

// Update order status
app.patch('/api/orders/:id/status', (req, res) => {
  const orders = readData(ordersFile);
  const orderId = parseInt(req.params.id);
  const { status } = req.body;
  
  const orderIndex = orders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    if (writeData(ordersFile, orders)) {
      logger.info(`Order ${orderId} status updated to: ${status}`);
      res.json({ success: true, message: 'Order status updated', order: orders[orderIndex] });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
  } else {
    res.status(404).json({ success: false, message: 'Order not found' });
  }
});

// Get user-specific data
app.get('/api/user/orders/:userId', (req, res) => {
  const orders = readData(ordersFile);
  const userOrders = orders.filter(order => order.userId === req.params.userId);
  res.json(userOrders);
});

app.get('/api/user/bookings/:userId', (req, res) => {
  const bookings = readData(bookingsFile);
  const userBookings = bookings.filter(booking => booking.userId === req.params.userId);
  res.json(userBookings);
});

// Error handling
app.use((error, req, res, next) => {
  logger.error(`Error: ${error.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

exports.handler = serverless(app);
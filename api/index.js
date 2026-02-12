const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { pool, initDB } = require('./db');
const seedData = require('./seed');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());

// JWT Config
const JWT_SECRET = process.env.JWT_SECRET || 'ecoroute_secret_key_2026_hackathon';
const JWT_EXPIRATION_HOURS = 24;

// Auth Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, name, total_co2_saved, total_orders, eco_rank, created_at FROM users WHERE id = $1',
      [payload.user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token expired' });
    }
    return res.status(401).json({ detail: 'Invalid token' });
  }
};

// Helper Functions
function calculateCO2Savings(isBatched, batchSize = 1) {
  const soloEmission = 285;
  if (isBatched && batchSize > 1) {
    const batchedEmission = soloEmission / batchSize;
    return soloEmission - batchedEmission;
  }
  return 0;
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function parseOrderItems(value) {
  if (value == null) {
    return [];
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (err) {
      console.warn('Invalid order.items JSON:', err.message);
      return [];
    }
  }
  return value;
}

function resolveBatchWindowEnd(value, now) {
  if (!value) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(now.getTime() + 5 * 60 * 1000);
  }
  return parsed;
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    // Insert user
    await pool.query(
      'INSERT INTO users (id, email, name, password_hash, total_co2_saved, total_orders, eco_rank, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [userId, email, name, passwordHash, 0, 0, 0, createdAt]
    );

    // Create token
    const token = jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: `${JWT_EXPIRATION_HOURS}h` });

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: userId,
        email,
        name,
        total_co2_saved: 0,
        total_orders: 0,
        eco_rank: 0,
        created_at: createdAt
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, email, name, password_hash, total_co2_saved, total_orders, eco_rank, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ detail: 'Invalid credentials' });
    }

    const token = jwt.sign({ user_id: user.id }, JWT_SECRET, { expiresIn: `${JWT_EXPIRATION_HOURS}h` });

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        total_co2_saved: user.total_co2_saved,
        total_orders: user.total_orders,
        eco_rank: user.eco_rank,
        created_at: user.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ detail: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    total_co2_saved: req.user.total_co2_saved,
    total_orders: req.user.total_orders,
    eco_rank: req.user.eco_rank,
    created_at: req.user.created_at
  });
});

// ==================== RESTAURANT ROUTES ====================

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  const { cuisine, eco_score } = req.query;
  
  try {
    let query = 'SELECT * FROM restaurants';
    const params = [];
    const conditions = [];

    if (cuisine) {
      params.push(cuisine);
      conditions.push(`cuisine = $${params.length}`);
    }

    if (eco_score) {
      params.push(eco_score);
      conditions.push(`eco_score = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);

    // Get menu items for each restaurant
    const restaurants = await Promise.all(result.rows.map(async (r) => {
      const menuResult = await pool.query(
        'SELECT * FROM menu_items WHERE restaurant_id = $1',
        [r.id]
      );
      return { ...r, menu: menuResult.rows };
    }));

    res.json(restaurants);
  } catch (err) {
    console.error('Get restaurants error:', err);
    res.status(500).json({ detail: 'Failed to fetch restaurants' });
  }
});

// Get batch counts
app.get('/api/restaurants/batch-counts', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT restaurant_id, COUNT(*) as count 
       FROM orders 
       WHERE status = 'waiting_for_batch' 
       GROUP BY restaurant_id`
    );
    
    const counts = {};
    result.rows.forEach(row => {
      counts[row.restaurant_id] = parseInt(row.count);
    });
    
    res.json(counts);
  } catch (err) {
    console.error('Get batch counts error:', err);
    res.status(500).json({ detail: 'Failed to fetch batch counts' });
  }
});

// Get single restaurant
app.get('/api/restaurants/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Restaurant not found' });
    }

    const menuResult = await pool.query(
      'SELECT * FROM menu_items WHERE restaurant_id = $1',
      [id]
    );

    res.json({ ...result.rows[0], menu: menuResult.rows });
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ detail: 'Failed to fetch restaurant' });
  }
});

// ==================== ORDER & BATCHING ROUTES ====================

// Check batch opportunity
app.post('/api/orders/check-batch', authenticateToken, async (req, res) => {
  const { restaurant_id, delivery_lat, delivery_lng } = req.body;

  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const result = await pool.query(
      `SELECT * FROM orders 
       WHERE restaurant_id = $1 
       AND status IN ('pending', 'preparing') 
       AND created_at >= $2 
       AND user_id != $3`,
      [restaurant_id, fifteenMinsAgo, req.user.id]
    );

    const batchedOrders = result.rows.filter(order => {
      const distance = haversineDistance(
        delivery_lat, delivery_lng,
        order.delivery_lat, order.delivery_lng
      );
      return distance <= 500;
    });

    if (batchedOrders.length > 0) {
      const batchSize = batchedOrders.length + 1;
      const co2Saved = calculateCO2Savings(true, batchSize);
      const savings = 20 + (batchSize - 2) * 5;

      return res.json({
        is_batched: true,
        batch_id: batchedOrders[0].batch_id || uuidv4(),
        other_orders_count: batchedOrders.length,
        estimated_wait_mins: Math.floor(Math.random() * 6) + 10,
        savings_rupees: savings,
        co2_saved_grams: co2Saved
      });
    }

    res.json({ is_batched: false });
  } catch (err) {
    console.error('Check batch error:', err);
    res.status(500).json({ detail: 'Failed to check batch' });
  }
});

// Create order
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { restaurant_id, items, delivery_address, delivery_lat, delivery_lng, is_batched, batch_id } = req.body;

  try {
    // Get restaurant
    const restaurantResult = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [restaurant_id]
    );

    if (restaurantResult.rows.length === 0) {
      return res.status(404).json({ detail: 'Restaurant not found' });
    }

    const restaurant = restaurantResult.rows[0];
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = is_batched ? 20 : 40;
    const now = new Date();
    let deliveryMins = restaurant.delivery_time_mins || 30;

    let orderData = {
      id: uuidv4(),
      user_id: req.user.id,
      restaurant_id,
      restaurant_name: restaurant.name,
      items: JSON.stringify(items),
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      co2_saved: 0,
      delivery_address,
      delivery_lat,
      delivery_lng,
      created_at: now.toISOString()
    };

    if (is_batched) {
      // Find existing batch or create new
      const existingBatch = await pool.query(
        `SELECT batch_id, batch_window_ends FROM orders 
         WHERE restaurant_id = $1 AND status = 'waiting_for_batch' AND batch_id IS NOT NULL 
         LIMIT 1`,
        [restaurant_id]
      );

      let finalBatchId, batchWindowEnds;
      
      if (existingBatch.rows.length > 0) {
        finalBatchId = existingBatch.rows[0].batch_id;
        const existingEnd = existingBatch.rows[0].batch_window_ends;
        batchWindowEnds = resolveBatchWindowEnd(existingEnd, now);
        if (!existingEnd || Number.isNaN(new Date(existingEnd).getTime())) {
          await pool.query(
            'UPDATE orders SET batch_window_ends = $1 WHERE batch_id = $2',
            [batchWindowEnds, finalBatchId]
          );
        }
      } else {
        finalBatchId = batch_id || uuidv4();
        batchWindowEnds = new Date(now.getTime() + 5 * 60 * 1000);
      }

      deliveryMins += 10;

      orderData.status = 'waiting_for_batch';
      orderData.is_batched = true;
      orderData.batch_id = finalBatchId;
      orderData.batch_window_ends = batchWindowEnds;
      orderData.dispatched_at = null;
      orderData.estimated_delivery = new Date(now.getTime() + (deliveryMins + 5) * 60 * 1000);
    } else {
      orderData.status = 'pending';
      orderData.is_batched = false;
      orderData.batch_id = null;
      orderData.batch_window_ends = null;
      orderData.dispatched_at = now;
      orderData.estimated_delivery = new Date(now.getTime() + deliveryMins * 60 * 1000);
    }

    const insertResult = await pool.query(
      `INSERT INTO orders (id, user_id, restaurant_id, restaurant_name, items, total_amount, 
       delivery_fee, co2_saved, delivery_address, delivery_lat, delivery_lng, status, 
       is_batched, batch_id, batch_window_ends, dispatched_at, created_at, estimated_delivery)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [orderData.id, orderData.user_id, orderData.restaurant_id, orderData.restaurant_name,
       orderData.items, orderData.total_amount, orderData.delivery_fee, orderData.co2_saved,
       orderData.delivery_address, orderData.delivery_lat, orderData.delivery_lng, orderData.status,
       orderData.is_batched, orderData.batch_id, orderData.batch_window_ends, orderData.dispatched_at,
       orderData.created_at, orderData.estimated_delivery]
    );

    // Update user order count
    await pool.query(
      'UPDATE users SET total_orders = total_orders + 1 WHERE id = $1',
      [req.user.id]
    );

    const order = insertResult.rows[0];
    order.items = parseOrderItems(order.items);

    res.json(order);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ detail: 'Failed to create order' });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const orders = result.rows.map(order => ({
      ...order,
      items: parseOrderItems(order.items)
    }));

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ detail: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    const order = result.rows[0];
    order.items = parseOrderItems(order.items);

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ detail: 'Failed to fetch order' });
  }
});

// Rush order
app.post('/api/orders/:id/rush', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    const order = result.rows[0];
    if (order.status !== 'waiting_for_batch') {
      return res.status(400).json({ detail: 'Order is not in batch waiting mode' });
    }

    const now = new Date();
    await pool.query(
      `UPDATE orders SET status = 'preparing', is_batched = false, batch_id = NULL, 
       co2_saved = 0, dispatched_at = $1, delivery_fee = 40 WHERE id = $2`,
      [now, id]
    );

    res.json({ message: 'Order converted to rush delivery', status: 'preparing' });
  } catch (err) {
    console.error('Rush order error:', err);
    res.status(500).json({ detail: 'Failed to rush order' });
  }
});

// Extend batch
app.post('/api/orders/:id/extend-batch', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    const order = result.rows[0];
    if (order.status !== 'waiting_for_batch') {
      return res.status(400).json({ detail: 'Order is not in batch waiting mode' });
    }

    const now = new Date();
    const currentEnd = resolveBatchWindowEnd(order.batch_window_ends, now);
    const newEnd = new Date(currentEnd.getTime() + 3 * 60 * 1000);

    await pool.query(
      'UPDATE orders SET batch_window_ends = $1 WHERE batch_id = $2',
      [newEnd, order.batch_id]
    );

    res.json({ message: 'Batch window extended by 3 minutes', new_end: newEnd.toISOString() });
  } catch (err) {
    console.error('Extend batch error:', err);
    res.status(500).json({ detail: 'Failed to extend batch' });
  }
});

// Dispatch batch helper
async function dispatchBatch(batchId) {
  if (!batchId) return;

  const batchOrders = await pool.query(
    'SELECT * FROM orders WHERE batch_id = $1 AND status = $2',
    [batchId, 'waiting_for_batch']
  );

  const batchSize = batchOrders.rows.length;
  if (batchSize === 0) return;

  const co2Saved = calculateCO2Savings(true, Math.max(batchSize, 2));
  const now = new Date();

  // Update all orders in batch
  await pool.query(
    `UPDATE orders SET status = 'preparing', co2_saved = $1, dispatched_at = $2 
     WHERE batch_id = $3 AND status = 'waiting_for_batch'`,
    [co2Saved, now, batchId]
  );

  // Update CO2 savings for all users
  const userIds = [...new Set(batchOrders.rows.map(o => o.user_id))];
  for (const userId of userIds) {
    const userOrderCount = batchOrders.rows.filter(o => o.user_id === userId).length;
    await pool.query(
      'UPDATE users SET total_co2_saved = total_co2_saved + $1 WHERE id = $2',
      [co2Saved * userOrderCount, userId]
    );
  }
}

// Get order tracking
app.get('/api/orders/:id/tracking', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Order not found' });
    }

    const order = result.rows[0];
    order.items = parseOrderItems(order.items);

    const restaurantResult = await pool.query(
      'SELECT * FROM restaurants WHERE id = $1',
      [order.restaurant_id]
    );
    const restaurant = restaurantResult.rows[0];

    // Waiting for batch
    if (order.status === 'waiting_for_batch') {
      const now = new Date();
      const batchWindowEnds = resolveBatchWindowEnd(order.batch_window_ends, now);
      if (!order.batch_window_ends || Number.isNaN(new Date(order.batch_window_ends).getTime())) {
        await pool.query('UPDATE orders SET batch_window_ends = $1 WHERE id = $2', [batchWindowEnds, id]);
      }

      if (now >= batchWindowEnds) {
        // Timer expired - dispatch
        await dispatchBatch(order.batch_id);
        
        // Re-fetch order
        const updatedResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        const updatedOrder = updatedResult.rows[0];
        updatedOrder.items = parseOrderItems(updatedOrder.items);
        
        // Return normal tracking for dispatched order
        return getNormalTracking(updatedOrder, restaurant, res);
      } else {
        // Still waiting
        const batchOrders = await pool.query(
          'SELECT * FROM orders WHERE batch_id = $1',
          [order.batch_id]
        );

        const batchSize = batchOrders.rows.length;
        const estimatedCo2 = calculateCO2Savings(true, Math.max(batchSize, 2));
        const timeRemaining = (batchWindowEnds - now) / 1000;

        return res.json({
          order_id: id,
          status: 'waiting_for_batch',
          batch_info: {
            batch_id: order.batch_id,
            batch_size: batchSize,
            estimated_co2_saved: estimatedCo2,
            time_remaining_seconds: Math.max(0, timeRemaining),
            batch_window_ends: order.batch_window_ends,
            members: batchOrders.rows.map(o => ({
              id: o.id,
              delivery_address: o.delivery_address || 'Nearby'
            }))
          },
          restaurant: {
            lat: restaurant.lat,
            lng: restaurant.lng,
            name: restaurant.name
          },
          delivery: {
            lat: order.delivery_lat,
            lng: order.delivery_lng,
            address: order.delivery_address
          },
          rider: { lat: restaurant.lat, lng: restaurant.lng },
          progress: 0,
          is_batched: true,
          batched_deliveries: batchOrders.rows.map(o => ({
            lat: o.delivery_lat,
            lng: o.delivery_lng,
            id: o.id
          })),
          estimated_delivery: order.estimated_delivery
        });
      }
    }

    // Normal tracking
    return getNormalTracking(order, restaurant, res);
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({ detail: 'Failed to fetch tracking' });
  }
});

async function getNormalTracking(order, restaurant, res) {
  const dispatchTime = order.dispatched_at || order.created_at;
  const dispatched = new Date(dispatchTime);
  const now = new Date();
  const elapsed = (now - dispatched) / 1000 / 60;

  const totalTime = order.is_batched ? 40 : 30;
  let progress = Math.min(elapsed / totalTime, 1.0);

  let status;
  if (progress < 0.3) {
    status = 'preparing';
  } else if (progress < 0.9) {
    status = 'out_for_delivery';
  } else {
    status = 'delivered';
  }

  if (order.status !== status && order.status !== 'waiting_for_batch') {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, order.id]);
  }

  let batchedDeliveries = [];
  let riderLat, riderLng;

  if (order.batch_id) {
    const batchOrders = await pool.query(
      'SELECT id, delivery_lat, delivery_lng, delivery_address FROM orders WHERE batch_id = $1',
      [order.batch_id]
    );
    
    batchedDeliveries = batchOrders.rows.map(o => ({
      lat: o.delivery_lat,
      lng: o.delivery_lng,
      id: o.id
    }));

    const centroidLat = batchOrders.rows.reduce((sum, o) => sum + o.delivery_lat, 0) / batchOrders.rows.length;
    const centroidLng = batchOrders.rows.reduce((sum, o) => sum + o.delivery_lng, 0) / batchOrders.rows.length;

    riderLat = restaurant.lat + (centroidLat - restaurant.lat) * progress;
    riderLng = restaurant.lng + (centroidLng - restaurant.lng) * progress;
  } else {
    riderLat = restaurant.lat + (order.delivery_lat - restaurant.lat) * progress;
    riderLng = restaurant.lng + (order.delivery_lng - restaurant.lng) * progress;
  }

  res.json({
    order_id: order.id,
    status: status,
    progress: progress,
    restaurant: {
      lat: restaurant.lat,
      lng: restaurant.lng,
      name: restaurant.name
    },
    delivery: {
      lat: order.delivery_lat,
      lng: order.delivery_lng,
      address: order.delivery_address
    },
    rider: {
      lat: riderLat,
      lng: riderLng
    },
    batched_deliveries: batchedDeliveries,
    estimated_delivery: order.estimated_delivery,
    is_batched: order.is_batched,
    co2_saved: order.co2_saved || 0
  });
}

// ==================== CARBON DASHBOARD ROUTES ====================

// Get carbon stats
app.get('/api/carbon/stats', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT total_co2_saved FROM users WHERE id = $1',
      [req.user.id]
    );

    const totalCo2 = userResult.rows[0]?.total_co2_saved || 0;

    // Get weekly data
    const weeklySavings = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - (6 - i));
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayOrders = await pool.query(
        `SELECT co2_saved FROM orders 
         WHERE user_id = $1 AND created_at >= $2 AND created_at < $3`,
        [req.user.id, dayStart.toISOString(), dayEnd.toISOString()]
      );

      const dayTotal = dayOrders.rows.reduce((sum, o) => sum + (o.co2_saved || 0), 0);
      weeklySavings.push(dayTotal);
    }

    // Count orders this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthOrders = await pool.query(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1 AND created_at >= $2',
      [req.user.id, monthStart.toISOString()]
    );

    res.json({
      total_co2_saved: totalCo2,
      trees_equivalent: totalCo2 / 21000,
      km_not_driven: totalCo2 / 120,
      orders_this_month: parseInt(monthOrders.rows[0].count),
      weekly_savings: weeklySavings
    });
  } catch (err) {
    console.error('Get carbon stats error:', err);
    res.status(500).json({ detail: 'Failed to fetch carbon stats' });
  }
});

// Get leaderboard
app.get('/api/carbon/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, total_co2_saved, total_orders 
       FROM users 
       WHERE total_orders > 0 
       ORDER BY total_co2_saved DESC 
       LIMIT 20`
    );

    const leaderboard = result.rows.map((user, index) => ({
      rank: index + 1,
      user_id: user.id,
      name: user.name,
      total_co2_saved: user.total_co2_saved,
      total_orders: user.total_orders
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ detail: 'Failed to fetch leaderboard' });
  }
});

// ==================== SEED DATA ====================

app.post('/api/seed', async (req, res) => {
  try {
    console.log('Starting database seed...');
    await seedData(pool);
    console.log('Database seeded successfully');
    res.json({ message: 'Database seeded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ 
      detail: 'Failed to seed database', 
      error: err.message,
      stack: err.stack 
    });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api', (req, res) => {
  res.json({ message: 'EcoRoute API is running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'EcoRoute API is running', version: '1.0.0' });
});

// Initialize DB and start server
const PORT = process.env.PORT || 3001;

if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

// Initialize database for serverless
let dbInitialized = false;

async function ensureDB() {
  if (!dbInitialized) {
    await initDB();
    dbInitialized = true;
  }
}

// Wrap the app to ensure DB is initialized
const serverlessApp = async (req, res) => {
  await ensureDB();
  return app(req, res);
};

// Export for serverless
module.exports = serverlessApp;

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// PostgreSQL connection pool using Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  try {
    // Ensure required extension exists for UUID defaults when available.
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    } catch (err) {
      console.warn('pgcrypto extension not available:', err.message);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        total_co2_saved FLOAT DEFAULT 0,
        total_orders INTEGER DEFAULT 0,
        eco_rank INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Backfill missing columns for existing tables
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS total_co2_saved FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS eco_rank INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        cuisine VARCHAR(100),
        rating FLOAT,
        eco_score VARCHAR(10),
        image_url TEXT,
        address TEXT,
        lat FLOAT,
        lng FLOAT,
        delivery_time_mins INTEGER,
        avg_price INTEGER
      )
    `);

    await client.query(`
      ALTER TABLE restaurants
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS cuisine VARCHAR(100),
        ADD COLUMN IF NOT EXISTS rating FLOAT,
        ADD COLUMN IF NOT EXISTS eco_score VARCHAR(10),
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS address TEXT,
        ADD COLUMN IF NOT EXISTS lat FLOAT,
        ADD COLUMN IF NOT EXISTS lng FLOAT,
        ADD COLUMN IF NOT EXISTS delivery_time_mins INTEGER,
        ADD COLUMN IF NOT EXISTS avg_price INTEGER
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price FLOAT,
        image_url TEXT,
        category VARCHAR(100),
        is_veg BOOLEAN DEFAULT true,
        prep_time_mins INTEGER
      )
    `);

    await client.query(`
      ALTER TABLE menu_items
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS price FLOAT,
        ADD COLUMN IF NOT EXISTS image_url TEXT,
        ADD COLUMN IF NOT EXISTS category VARCHAR(100),
        ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT true,
        ADD COLUMN IF NOT EXISTS prep_time_mins INTEGER
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        restaurant_id UUID REFERENCES restaurants(id),
        restaurant_name VARCHAR(255),
        items JSONB NOT NULL,
        total_amount FLOAT,
        delivery_fee FLOAT,
        co2_saved FLOAT DEFAULT 0,
        delivery_address TEXT,
        delivery_lat FLOAT,
        delivery_lng FLOAT,
        status VARCHAR(50) DEFAULT 'pending',
        is_batched BOOLEAN DEFAULT false,
        batch_id UUID,
        batch_window_ends TIMESTAMP WITH TIME ZONE,
        dispatched_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        estimated_delivery TIMESTAMP WITH TIME ZONE
      )
    `);

    await client.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS restaurant_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS total_amount FLOAT,
        ADD COLUMN IF NOT EXISTS delivery_fee FLOAT,
        ADD COLUMN IF NOT EXISTS co2_saved FLOAT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS delivery_address TEXT,
        ADD COLUMN IF NOT EXISTS delivery_lat FLOAT,
        ADD COLUMN IF NOT EXISTS delivery_lng FLOAT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS is_batched BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS batch_id UUID,
        ADD COLUMN IF NOT EXISTS batch_window_ends TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE
    `);

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };

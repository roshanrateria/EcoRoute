const { v4: uuidv4 } = require('uuid');

async function seedData(pool) {
  const client = await pool.connect();
  
  try {
    // Clear existing data
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM menu_items');
    await client.query('DELETE FROM restaurants');
    await client.query('DELETE FROM users');

    // IIT Delhi coordinates
    const baseLat = 28.5456;
    const baseLng = 77.1926;

    // Demo restaurants
    const restaurants = [
      {
        id: uuidv4(),
        name: 'Green Bowl Kitchen',
        description: 'Fresh salads, Buddha bowls, and healthy wraps. Campus favorite for clean eating.',
        cuisine: 'Healthy',
        rating: 4.7,
        eco_score: 'A+',
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        address: 'Near Main Gate, IIT Delhi',
        lat: baseLat + 0.002,
        lng: baseLng + 0.001,
        delivery_time_mins: 25,
        avg_price: 180,
        menu: [
          { id: uuidv4(), name: 'Buddha Bowl', description: 'Quinoa, roasted veggies, hummus, tahini dressing', price: 249, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', category: 'Bowls', is_veg: true, prep_time_mins: 12 },
          { id: uuidv4(), name: 'Avocado Toast', description: 'Multigrain bread, smashed avo, cherry tomatoes', price: 179, image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=400&q=80', category: 'Toasts', is_veg: true, prep_time_mins: 8 },
          { id: uuidv4(), name: 'Protein Power Wrap', description: 'Grilled paneer, greens, hummus, whole wheat wrap', price: 199, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=400&q=80', category: 'Wraps', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Fresh Fruit Smoothie', description: 'Banana, mango, oats, almond milk', price: 129, image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80', category: 'Drinks', is_veg: true, prep_time_mins: 5 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Spice Junction',
        description: 'Authentic North Indian thalis and street food. Home-style cooking at its best.',
        cuisine: 'Indian',
        rating: 4.5,
        eco_score: 'A',
        image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        address: 'Kamal Hostel Road, IIT Delhi',
        lat: baseLat - 0.001,
        lng: baseLng + 0.003,
        delivery_time_mins: 30,
        avg_price: 150,
        menu: [
          { id: uuidv4(), name: 'Paneer Butter Masala', description: 'Creamy tomato gravy with cottage cheese', price: 189, image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80', category: 'Main Course', is_veg: true, prep_time_mins: 15 },
          { id: uuidv4(), name: 'Dal Makhani', description: 'Slow-cooked black lentils in butter', price: 159, image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', category: 'Main Course', is_veg: true, prep_time_mins: 12 },
          { id: uuidv4(), name: 'Veg Biryani', description: 'Fragrant basmati rice with vegetables', price: 179, image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80', category: 'Rice', is_veg: true, prep_time_mins: 18 },
          { id: uuidv4(), name: 'Chole Bhature', description: 'Spiced chickpeas with fried bread', price: 149, image_url: 'https://images.unsplash.com/photo-1626132647523-66d180e0c2be?auto=format&fit=crop&w=400&q=80', category: 'Street Food', is_veg: true, prep_time_mins: 12 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Pizza Planet',
        description: 'Wood-fired pizzas and Italian favorites. Perfect for late-night cravings.',
        cuisine: 'Italian',
        rating: 4.3,
        eco_score: 'B',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
        address: 'SBI Bank Road, IIT Delhi',
        lat: baseLat + 0.001,
        lng: baseLng - 0.002,
        delivery_time_mins: 35,
        avg_price: 300,
        menu: [
          { id: uuidv4(), name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, fresh basil', price: 299, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80', category: 'Pizza', is_veg: true, prep_time_mins: 18 },
          { id: uuidv4(), name: 'Farmhouse Pizza', description: 'Bell peppers, onions, mushrooms, olives', price: 349, image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80', category: 'Pizza', is_veg: true, prep_time_mins: 20 },
          { id: uuidv4(), name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 129, image_url: 'https://images.unsplash.com/photo-1619535860434-cf85856d28c4?auto=format&fit=crop&w=400&q=80', category: 'Sides', is_veg: true, prep_time_mins: 8 },
          { id: uuidv4(), name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', price: 249, image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80', category: 'Pasta', is_veg: true, prep_time_mins: 15 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Dragon Wok',
        description: 'Indo-Chinese fusion. Spicy noodles and manchurian that hit different.',
        cuisine: 'Chinese',
        rating: 4.4,
        eco_score: 'A',
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
        address: 'Nilgiri Hostel, IIT Delhi',
        lat: baseLat - 0.002,
        lng: baseLng - 0.001,
        delivery_time_mins: 28,
        avg_price: 180,
        menu: [
          { id: uuidv4(), name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 169, image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80', category: 'Noodles', is_veg: true, prep_time_mins: 12 },
          { id: uuidv4(), name: 'Veg Manchurian', description: 'Crispy veg balls in spicy sauce', price: 179, image_url: 'https://images.unsplash.com/photo-1645696301019-35adcc18fc94?auto=format&fit=crop&w=400&q=80', category: 'Starters', is_veg: true, prep_time_mins: 15 },
          { id: uuidv4(), name: 'Fried Rice', description: 'Wok-tossed rice with veggies', price: 159, image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80', category: 'Rice', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Spring Rolls', description: 'Crispy rolls with vegetable filling', price: 129, image_url: 'https://images.unsplash.com/photo-1606525437679-037aca74a396?auto=format&fit=crop&w=400&q=80', category: 'Starters', is_veg: true, prep_time_mins: 12 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Burger Barn',
        description: 'Gourmet burgers and loaded fries. The ultimate comfort food destination.',
        cuisine: 'American',
        rating: 4.6,
        eco_score: 'B',
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        address: 'HUDCO, Hauz Khas',
        lat: baseLat + 0.004,
        lng: baseLng + 0.002,
        delivery_time_mins: 25,
        avg_price: 250,
        menu: [
          { id: uuidv4(), name: 'Classic Veg Burger', description: 'Crispy patty, lettuce, tomato, special sauce', price: 199, image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80', category: 'Burgers', is_veg: true, prep_time_mins: 12 },
          { id: uuidv4(), name: 'Paneer Tikka Burger', description: 'Spiced paneer patty, mint mayo', price: 229, image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=400&q=80', category: 'Burgers', is_veg: true, prep_time_mins: 14 },
          { id: uuidv4(), name: 'Loaded Fries', description: 'Fries topped with cheese and jalapeños', price: 149, image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80', category: 'Sides', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Oreo Shake', description: 'Thick shake with crushed Oreos', price: 139, image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80', category: 'Drinks', is_veg: true, prep_time_mins: 5 }
        ]
      },
      {
        id: uuidv4(),
        name: 'South Express',
        description: 'Authentic South Indian breakfast and meals. Crispy dosas and fluffy idlis.',
        cuisine: 'South Indian',
        rating: 4.8,
        eco_score: 'A+',
        image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80',
        address: 'Vindhyachal Hostel, IIT Delhi',
        lat: baseLat - 0.003,
        lng: baseLng + 0.002,
        delivery_time_mins: 22,
        avg_price: 120,
        menu: [
          { id: uuidv4(), name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 99, image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80', category: 'Dosas', is_veg: true, prep_time_mins: 12 },
          { id: uuidv4(), name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', price: 79, image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', category: 'Idlis', is_veg: true, prep_time_mins: 8 },
          { id: uuidv4(), name: 'Vada', description: 'Crispy lentil fritters', price: 69, image_url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80', category: 'Snacks', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 49, image_url: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?auto=format&fit=crop&w=400&q=80', category: 'Drinks', is_veg: true, prep_time_mins: 5 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Chai Point',
        description: 'Premium chai and snacks. Perfect for study breaks and hangouts.',
        cuisine: 'Cafe',
        rating: 4.2,
        eco_score: 'A',
        image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80',
        address: 'Central Library, IIT Delhi',
        lat: baseLat + 0.0015,
        lng: baseLng + 0.0025,
        delivery_time_mins: 15,
        avg_price: 100,
        menu: [
          { id: uuidv4(), name: 'Masala Chai', description: 'Spiced tea with ginger and cardamom', price: 49, image_url: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=400&q=80', category: 'Chai', is_veg: true, prep_time_mins: 5 },
          { id: uuidv4(), name: 'Samosa', description: 'Crispy pastry with spiced potato filling', price: 39, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80', category: 'Snacks', is_veg: true, prep_time_mins: 5 },
          { id: uuidv4(), name: 'Veg Puff', description: 'Flaky pastry with vegetable filling', price: 45, image_url: 'https://images.unsplash.com/photo-1609167830220-7164aa360951?auto=format&fit=crop&w=400&q=80', category: 'Snacks', is_veg: true, prep_time_mins: 5 },
          { id: uuidv4(), name: 'Bun Maska', description: 'Soft bun with butter', price: 49, image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', category: 'Snacks', is_veg: true, prep_time_mins: 3 }
        ]
      },
      {
        id: uuidv4(),
        name: 'Wrap & Roll',
        description: 'Kathi rolls and frankies. Quick bites packed with flavor.',
        cuisine: 'Street Food',
        rating: 4.4,
        eco_score: 'A',
        image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
        address: 'Jwalamukhi Hostel, IIT Delhi',
        lat: baseLat - 0.0015,
        lng: baseLng - 0.002,
        delivery_time_mins: 20,
        avg_price: 130,
        menu: [
          { id: uuidv4(), name: 'Paneer Kathi Roll', description: 'Grilled paneer in paratha wrap', price: 129, image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=400&q=80', category: 'Rolls', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Aloo Roll', description: 'Spiced potato in paratha wrap', price: 99, image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80', category: 'Rolls', is_veg: true, prep_time_mins: 8 },
          { id: uuidv4(), name: 'Veg Frankie', description: 'Mixed vegetables in roti wrap', price: 109, image_url: 'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?auto=format&fit=crop&w=400&q=80', category: 'Frankies', is_veg: true, prep_time_mins: 10 },
          { id: uuidv4(), name: 'Cold Coffee', description: 'Iced coffee with cream', price: 89, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80', category: 'Drinks', is_veg: true, prep_time_mins: 5 }
        ]
      }
    ];

    // Insert restaurants and menu items
    for (const r of restaurants) {
      await client.query(
        `INSERT INTO restaurants (id, name, description, cuisine, rating, eco_score, image_url, address, lat, lng, delivery_time_mins, avg_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [r.id, r.name, r.description, r.cuisine, r.rating, r.eco_score, r.image_url, r.address, r.lat, r.lng, r.delivery_time_mins, r.avg_price]
      );

      for (const item of r.menu) {
        await client.query(
          `INSERT INTO menu_items (id, restaurant_id, name, description, price, image_url, category, is_veg, prep_time_mins)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [item.id, r.id, item.name, item.description, item.price, item.image_url, item.category, item.is_veg, item.prep_time_mins]
        );
      }
    }

    // Demo users
    const demoUsers = [
      { id: uuidv4(), name: 'Rahul Mehta', email: 'rahul@iitd.ac.in', total_co2_saved: 127000, total_orders: 42 },
      { id: uuidv4(), name: 'Priya Sharma', email: 'priya@iitd.ac.in', total_co2_saved: 98500, total_orders: 35 },
      { id: uuidv4(), name: 'Arjun Singh', email: 'arjun@iitd.ac.in', total_co2_saved: 85000, total_orders: 28 },
      { id: uuidv4(), name: 'Sneha Patel', email: 'sneha@iitd.ac.in', total_co2_saved: 72000, total_orders: 24 },
      { id: uuidv4(), name: 'Vikram Kumar', email: 'vikram@iitd.ac.in', total_co2_saved: 65000, total_orders: 22 },
      { id: uuidv4(), name: 'Ananya Roy', email: 'ananya@iitd.ac.in', total_co2_saved: 58000, total_orders: 19 },
      { id: uuidv4(), name: 'Karthik Nair', email: 'karthik@iitd.ac.in', total_co2_saved: 45000, total_orders: 15 },
      { id: uuidv4(), name: 'Meera Iyer', email: 'meera@iitd.ac.in', total_co2_saved: 38000, total_orders: 13 },
      { id: uuidv4(), name: 'Rohan Gupta', email: 'rohan@iitd.ac.in', total_co2_saved: 32000, total_orders: 11 },
      { id: uuidv4(), name: 'Neha Reddy', email: 'neha@iitd.ac.in', total_co2_saved: 25000, total_orders: 9 }
    ];

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('demo123', 10);

    for (const user of demoUsers) {
      await client.query(
        `INSERT INTO users (id, email, name, password_hash, total_co2_saved, total_orders, eco_rank, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, user.email, user.name, passwordHash, user.total_co2_saved, user.total_orders, 0, new Date().toISOString()]
      );
    }

    // Create some pending orders for batching demo
    const firstRestaurant = restaurants[0];
    const batchId = uuidv4();

    for (let i = 0; i < 3; i++) {
      const orderUser = demoUsers[i % demoUsers.length];
      await client.query(
        `INSERT INTO orders (id, user_id, restaurant_id, restaurant_name, items, total_amount, delivery_fee, co2_saved, delivery_address, delivery_lat, delivery_lng, status, is_batched, batch_id, created_at, estimated_delivery)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          uuidv4(),
          orderUser.id,
          firstRestaurant.id,
          firstRestaurant.name,
          JSON.stringify([{ menu_item_id: firstRestaurant.menu[0].id, name: firstRestaurant.menu[0].name, price: firstRestaurant.menu[0].price, quantity: 1, restaurant_id: firstRestaurant.id }]),
          firstRestaurant.menu[0].price,
          20,
          142.5,
          `Hostel ${i + 1}, IIT Delhi`,
          baseLat + (Math.random() * 0.004 - 0.002),
          baseLng + (Math.random() * 0.004 - 0.002),
          'pending',
          true,
          batchId,
          new Date().toISOString(),
          new Date(Date.now() + 25 * 60 * 1000).toISOString()
        ]
      );
    }

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = seedData;

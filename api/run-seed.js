const { pool, initDB } = require('./db');
const seedData = require('./seed');

async function runSeed() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('Database initialized successfully');
    
    console.log('Starting database seed...');
    await seedData(pool);
    console.log('Database seeded successfully');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

runSeed();

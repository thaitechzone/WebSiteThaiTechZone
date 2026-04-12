// Database Initialization Script
// This script initializes the database with schema

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database at:', testResult.rows[0].now);
    console.log('');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file loaded');
    console.log('');

    // Execute schema
    console.log('🔨 Creating database tables...');
    await pool.query(schema);
    console.log('✅ Tables created successfully');
    console.log('');

    // Verify tables
    console.log('🔍 Verifying created tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('✅ Found', tablesResult.rows.length, 'tables:');
    tablesResult.rows.forEach(row => {
      console.log('   •', row.table_name);
    });
    console.log('');

    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('📊 Next steps:');
    console.log('   1. Start the server: npm start or npm run dev');
    console.log('   2. Access database via pgAdmin: http://localhost:5050');
    console.log('   3. Begin developing your API routes');
    console.log('');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('   1. Ensure Docker containers are running: docker-compose up -d');
    console.error('   2. Check .env file has correct database credentials');
    console.error('   3. Wait a few seconds for PostgreSQL to fully start');
    console.error('');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run initialization
initDatabase();

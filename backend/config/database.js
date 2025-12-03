import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || '156.67.221.100',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gulfamNasreen@!',
  database: process.env.DB_NAME || 'fluent_financial_flow',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Force IPv4 to avoid IPv6 issues
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Log database configuration (without password) for debugging
if (process.env.NODE_ENV === 'development' || !process.env.DB_HOST) {
  console.log('📊 Database Config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    hasPassword: !!dbConfig.password
  });
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('📊 Attempted connection to:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      hasPassword: !!dbConfig.password
    });
    
    // Check if environment variables are missing
    if (!process.env.DB_HOST) {
      console.error('⚠️  DB_HOST environment variable is not set!');
    }
    if (!process.env.DB_USER) {
      console.error('⚠️  DB_USER environment variable is not set!');
    }
    if (!process.env.DB_PASSWORD) {
      console.error('⚠️  DB_PASSWORD environment variable is not set!');
    }
    if (!process.env.DB_NAME) {
      console.error('⚠️  DB_NAME environment variable is not set!');
    }
    
    return false;
  }
};

// Execute query with error handling
export const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

// Execute transaction
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const [rows] = await connection.execute(query, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Export pool as default
export default pool;


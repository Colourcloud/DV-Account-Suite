const mysql = require('mysql2/promise');

async function createDatabase() {
  // Connection config without database name (to create the database)
  const config = {
    host: process.env.DB_HOST || '192.168.4.21',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  let connection;
  
  try {
    console.log('Connecting to MariaDB server...');
    connection = await mysql.createConnection(config);
    
    console.log('Creating database "muonline"...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS muonline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    console.log('Database "muonline" created successfully!');
    
    // Test connection to the new database
    console.log('Testing connection to muonline database...');
    await connection.execute('USE muonline');
    console.log('Successfully connected to muonline database!');
    
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createDatabase();

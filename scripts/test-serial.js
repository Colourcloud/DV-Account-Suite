const mysql = require('mysql2/promise');

async function testSerial() {
  const connection = await mysql.createConnection({
    host: '192.168.4.24',
    user: 'root',
    password: '1234',
    database: 'muonline',
    port: 3306
  });

  try {
    console.log('Testing serial number functionality...');
    
    // First, check current serial
    const [currentRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('Current serial:', currentRows[0]?.serial);
    
    // Increment the serial
    const [updateResult] = await connection.execute('UPDATE item_serial SET serial = serial + 1 WHERE server = 0');
    console.log('Update result:', updateResult);
    
    // Check new serial
    const [newRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('New serial:', newRows[0]?.serial);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testSerial();

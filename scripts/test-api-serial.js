const mysql = require('mysql2/promise');

async function testApiSerial() {
  const connection = await mysql.createConnection({
    host: '192.168.4.24',
    user: 'root',
    password: '1234',
    database: 'muonline',
    port: 3306
  });

  try {
    console.log('=== Testing API Serial Function ===');
    
    // Check current serial
    const [beforeRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('Before - Current serial:', beforeRows[0]?.serial);
    
    // Simulate the API function
    console.log('Getting next serial number...');
    
    // Increment first (atomic operation)
    const updateResult = await connection.execute('UPDATE item_serial SET serial = serial + 1 WHERE server = 0');
    console.log('Update result:', updateResult);
    
    // Read the new count
    const [rows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('Serial query result:', rows);
    
    const newCount = Array.isArray(rows) && rows.length > 0 ? rows[0].serial : 0
    console.log('New serial count:', newCount);
    
    // Check final serial
    const [finalRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('Final - Current serial:', finalRows[0]?.serial);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

testApiSerial();

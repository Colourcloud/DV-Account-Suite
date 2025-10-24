const mysql = require('mysql2/promise');

async function debugSerial() {
  const connection = await mysql.createConnection({
    host: '192.168.4.24',
    user: 'root',
    password: '1234',
    database: 'muonline',
    port: 3306
  });

  try {
    console.log('=== DEBUGGING SERIAL NUMBER ===');
    
    // Check current serial
    const [beforeRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('Before API call - Current serial:', beforeRows[0]?.serial);
    
    // Call the API
    console.log('\\nCalling API...');
    const response = await fetch('http://localhost:3000/api/characters/serial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    console.log('API response:', result);
    
    // Check serial after API call
    const [afterRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('After API call - Current serial:', afterRows[0]?.serial);
    
    // Manual increment to test
    console.log('\\nTesting manual increment...');
    const [manualUpdate] = await connection.execute('UPDATE item_serial SET serial = serial + 1 WHERE server = 0');
    console.log('Manual update result:', manualUpdate);
    
    const [manualRows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1');
    console.log('After manual increment - Current serial:', manualRows[0]?.serial);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

debugSerial();

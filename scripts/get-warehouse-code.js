const mysql = require('mysql2/promise');

async function getWarehouseCode() {
  const connection = await mysql.createConnection({
    host: '192.168.4.24',
    user: 'root',
    password: '1234',
    database: 'muonline',
    port: 3306
  });

  try {
    // Get all characters with warehouse data
    const [rows] = await connection.execute(`
      SELECT ci.name as character_name, aw.inventory 
      FROM character_info ci
      LEFT JOIN account_warehouse aw ON ci.account_id = aw.account_id
      WHERE aw.inventory IS NOT NULL AND aw.inventory != ''
      ORDER BY ci.name
    `);

    console.log('=== WAREHOUSE DATA ===\n');

    rows.forEach((row, index) => {
      console.log(`Character ${index + 1}: ${row.character_name}`);
      
      if (row.inventory) {
        const inventoryData = Buffer.isBuffer(row.inventory) 
          ? row.inventory.toString('utf8') 
          : row.inventory;

        console.log('\nRaw Base64:', inventoryData);
        
        if (inventoryData && inventoryData.length > 0) {
          const decoded = Buffer.from(inventoryData, 'base64').toString('utf8');
          console.log('\nDecoded Warehouse Code:');
          console.log(decoded);
        } else {
          console.log('(Empty warehouse)');
        }
      }
      console.log('\n' + '='.repeat(50) + '\n');
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getWarehouseCode();

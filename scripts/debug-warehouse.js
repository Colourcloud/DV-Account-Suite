const mysql = require('mysql2/promise');

async function getWarehouseData() {
  const connection = await mysql.createConnection({
    host: '192.168.4.24',
    user: 'root',
    password: '1234',
    database: 'muonline',
    port: 3306
  });

  try {
    // Get warehouse data for a character
    const [rows] = await connection.execute(`
      SELECT ci.name, aw.inventory 
      FROM character_info ci
      LEFT JOIN account_warehouse aw ON ci.account_id = aw.account_id
      WHERE ci.name IS NOT NULL
      LIMIT 1
    `);

    if (rows.length > 0) {
      const character = rows[0];
      console.log('Character:', character.name);
      console.log('Raw warehouse data (base64):');
      console.log(character.inventory);
      
      if (character.inventory) {
        console.log('\nSingle decode result:');
        const decoded = Buffer.from(character.inventory, 'base64').toString('utf8');
        console.log(decoded);
      } else {
        console.log('No warehouse data found');
      }
    } else {
      console.log('No characters found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getWarehouseData();

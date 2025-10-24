import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.4.24',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'muonline',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
const pool = mysql.createPool(dbConfig)

// Database connection helper
export async function getConnection() {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Database connection error:', error)
    throw error
  }
}

// Account management functions
export class AccountManager {
  // Get all accounts
  static async getAllAccounts(limit = 50, offset = 0) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        `SELECT a.*, ad.vip_status, ad.credits, ad.web_credits,
         (SELECT COUNT(*) FROM character_info ci WHERE ci.account_id = a.guid) as character_count
         FROM accounts a 
         LEFT JOIN account_data ad ON a.guid = ad.account_id 
         ORDER BY a.guid DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      )
      return rows
    } finally {
      connection.release()
    }
  }

  // Get account by username
  static async getAccountByUsername(username: string) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        `SELECT a.*, ad.vip_status, ad.credits, ad.web_credits,
         (SELECT COUNT(*) FROM character_info ci WHERE ci.account_id = a.guid) as character_count
         FROM accounts a 
         LEFT JOIN account_data ad ON a.guid = ad.account_id 
         WHERE a.account = ?`,
        [username]
      )
      return rows
    } finally {
      connection.release()
    }
  }

  // Create new account
  static async createAccount(accountData: {
    username: string
    password: string
    email: string
    vip?: boolean
  }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.execute(
        'INSERT INTO accounts (account, password, email, secured) VALUES (?, ?, ?, ?)',
        [accountData.username, accountData.password, accountData.email, 1]
      )
      return result
    } finally {
      connection.release()
    }
  }

  // Update account
  static async updateAccount(username: string, updateData: {
    password?: string
    email?: string
    vip?: boolean
    blocked?: boolean
  }) {
    const connection = await getConnection()
    try {
      const fields = []
      const values = []
      
      if (updateData.password) {
        fields.push('password = ?')
        values.push(updateData.password)
      }
      if (updateData.email) {
        fields.push('email = ?')
        values.push(updateData.email)
      }
      if (updateData.blocked !== undefined) {
        fields.push('blocked = ?')
        values.push(updateData.blocked ? 1 : 0)
      }

      if (fields.length === 0) return null

      values.push(username)
      const [result] = await connection.execute(
        `UPDATE accounts SET ${fields.join(', ')} WHERE account = ?`,
        values
      )
      return result
    } finally {
      connection.release()
    }
  }

  // Delete account
  static async deleteAccount(username: string) {
    const connection = await getConnection()
    try {
      const [result] = await connection.execute(
        'DELETE FROM accounts WHERE account = ?',
        [username]
      )
      return result
    } finally {
      connection.release()
    }
  }

  // Get account statistics
  static async getAccountStats() {
    const connection = await getConnection()
    try {
      // Get total accounts
      const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM accounts')
      
      // Get active accounts (not blocked)
      const [activeRows] = await connection.execute('SELECT COUNT(*) as total FROM accounts WHERE blocked = 0')
      
      // Get banned accounts (blocked or in accounts_banned)
      const [bannedRows] = await connection.execute(`
        SELECT COUNT(*) as total FROM accounts 
        WHERE blocked = 1 OR guid IN (SELECT account_id FROM accounts_banned)
      `)
      
      // Get VIP accounts
      const [vipRows] = await connection.execute(`
        SELECT COUNT(*) as total FROM accounts a 
        LEFT JOIN account_data ad ON a.guid = ad.account_id 
        WHERE ad.vip_status > 0
      `)

      return {
        total: (totalRows as any[])[0].total,
        active: (activeRows as any[])[0].total,
        banned: (bannedRows as any[])[0].total,
        vip: (vipRows as any[])[0].total
      }
    } finally {
      connection.release()
    }
  }
}

// Character management functions
export class CharacterManager {
  // Get all characters
  static async getAllCharacters(limit = 50, offset = 0) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        `SELECT ci.*, a.account as account_name, a.email, a.blocked, ad.vip_status
         FROM character_info ci
         LEFT JOIN accounts a ON ci.account_id = a.guid
         LEFT JOIN account_data ad ON a.guid = ad.account_id
         ORDER BY ci.level DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      )
      return rows
    } finally {
      connection.release()
    }
  }

  // Get characters by account
  static async getCharactersByAccount(accountId: number) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM character_info WHERE account_id = ?',
        [accountId]
      )
      return rows
    } finally {
      connection.release()
    }
  }

  // Get character by name
  static async getCharacterByName(characterName: string) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        `SELECT ci.*, a.account as account_name, a.email, ad.vip_status
         FROM character_info ci
         LEFT JOIN accounts a ON ci.account_id = a.guid
         LEFT JOIN account_data ad ON a.guid = ad.account_id
         WHERE ci.name = ?`,
        [characterName]
      )
      return rows
    } finally {
      connection.release()
    }
  }


  // Get the next item serial number
  static async getNextItemSerial() {
    const connection = await getConnection()
    try {
      console.log('Getting next serial number...')
      
      // Increment first (atomic operation)
      const updateResult = await connection.execute('UPDATE item_serial SET serial = serial + 1 WHERE server = 0')
      console.log('Update result:', updateResult)
      
      // Read the new count
      const [rows] = await connection.execute('SELECT serial FROM item_serial WHERE server = 0 LIMIT 1')
      console.log('Serial query result:', rows)
      
      const newCount = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).serial : 0
      console.log('New serial count:', newCount)
      
      return newCount
    } catch (error) {
      console.error('Error getting serial number:', error)
      throw error
    } finally {
      connection.release()
    }
  }

  // Update character
  static async updateCharacter(characterName: string, updateData: {
    level?: number
    level_master?: number
    strength?: number
    agility?: number
    vitality?: number
    energy?: number
    leadership?: number
    points?: number
    money?: number
    ruud_money?: number
    reset?: number
  }) {
    const connection = await getConnection()
    try {
      const fields = []
      const values = []
      
      if (updateData.level !== undefined) {
        fields.push('level = ?')
        values.push(updateData.level)
      }
      if (updateData.level_master !== undefined) {
        fields.push('level_master = ?')
        values.push(updateData.level_master)
      }
      if (updateData.strength !== undefined) {
        fields.push('strength = ?')
        values.push(updateData.strength)
      }
      if (updateData.agility !== undefined) {
        fields.push('agility = ?')
        values.push(updateData.agility)
      }
      if (updateData.vitality !== undefined) {
        fields.push('vitality = ?')
        values.push(updateData.vitality)
      }
      if (updateData.energy !== undefined) {
        fields.push('energy = ?')
        values.push(updateData.energy)
      }
      if (updateData.leadership !== undefined) {
        fields.push('leadership = ?')
        values.push(updateData.leadership)
      }
      if (updateData.points !== undefined) {
        fields.push('points = ?')
        values.push(updateData.points)
      }
      if (updateData.money !== undefined) {
        fields.push('money = ?')
        values.push(updateData.money)
      }
      if (updateData.ruud_money !== undefined) {
        fields.push('ruud_money = ?')
        values.push(updateData.ruud_money)
      }
      if (updateData.reset !== undefined) {
        fields.push('reset = ?')
        values.push(updateData.reset)
      }

      if (fields.length === 0) return null

      values.push(characterName)
      const [result] = await connection.execute(
        `UPDATE character_info SET ${fields.join(', ')} WHERE name = ?`,
        values
      )
      return result
    } finally {
      connection.release()
    }
  }

  // Delete character
  static async deleteCharacter(characterName: string) {
    const connection = await getConnection()
    try {
      const [result] = await connection.execute(
        'DELETE FROM character_info WHERE name = ?',
        [characterName]
      )
      return result
    } finally {
      connection.release()
    }
  }

  // Get character statistics
  static async getCharacterStats() {
    const connection = await getConnection()
    try {
      const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM character_info')
      const [onlineRows] = await connection.execute('SELECT COUNT(*) as online FROM character_info WHERE online = 1')
      const [vipRows] = await connection.execute(`
        SELECT COUNT(*) as vip FROM character_info ci
        LEFT JOIN accounts a ON ci.account_id = a.guid
        LEFT JOIN account_data ad ON a.guid = ad.account_id
        WHERE ad.vip_status > 0
      `)
      const [bannedRows] = await connection.execute(`
        SELECT COUNT(*) as banned FROM character_info ci
        LEFT JOIN accounts a ON ci.account_id = a.guid
        WHERE a.blocked = 1 OR ci.account_id IN (SELECT account_id FROM accounts_banned)
      `)
      
      return {
        total: (totalRows as any[])[0].total,
        online: (onlineRows as any[])[0].online,
        vip: (vipRows as any[])[0].vip,
        banned: (bannedRows as any[])[0].banned
      }
    } finally {
      connection.release()
    }
  }
}

export default pool

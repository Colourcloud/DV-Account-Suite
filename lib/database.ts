import mysql from 'mysql2/promise'
import { MUonlinePassword } from './muonline-password'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.4.24', //change to your ipv4 address
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
    hashMethod?: 'md5' | 'sha256' | 'double-md5' | 'muonline'
  }) {
    const connection = await getConnection()
    try {
      // Hash the password if it's not already hashed
      let hashedPassword = accountData.password
      
      // Check if password is already a hash (64 chars = SHA-256, 32 chars = MD5)
      if (accountData.password.length !== 32 && accountData.password.length !== 64) {
        // Password is plain text, hash it
        const method = accountData.hashMethod || 'muonline'
        hashedPassword = MUonlinePassword.hashPassword(accountData.password, method, accountData.username)
      }
      
      // Get current timestamp for register field
      const now = new Date()
      const registerTimestamp = parseInt(now.getFullYear().toString() + 
        (now.getMonth() + 1).toString().padStart(2, '0') + 
        now.getDate().toString().padStart(2, '0') + 
        now.getHours().toString().padStart(2, '0') + 
        now.getMinutes().toString().padStart(2, '0') + 
        now.getSeconds().toString().padStart(2, '0'))
      
      const [result] = await connection.execute(
        `INSERT INTO accounts (
          account, password, email, secured, blocked, 
          register, created_at, updated_at, activated,
          deletion_token, passlost_token, email_token, new_email, social_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          accountData.username, 
          hashedPassword, 
          accountData.email, 
          1, // secured
          0, // blocked
          registerTimestamp, // register
          now, // created_at
          now, // updated_at
          1, // activated
          '0', // deletion_token
          '0', // passlost_token
          '0', // email_token
          '0', // new_email
          '0'  // social_id
        ]
      )
      
      // If VIP is requested, create account_data entry
      if (accountData.vip) {
        const accountId = (result as any).insertId
        await connection.execute(
          'INSERT INTO account_data (account_id, vip_status) VALUES (?, ?)',
          [accountId, 1]
        )
      }
      
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

  // Update account data (credits, vip status, etc.)
  static async updateAccountData(username: string, updateData: {
    credits?: number
    web_credits?: number
    vip_status?: number
  }) {
    const connection = await getConnection()
    try {
      // First get the account ID
      const [accountRows] = await connection.execute(
        'SELECT guid FROM accounts WHERE account = ?',
        [username]
      )
      
      if (!accountRows || (accountRows as any[]).length === 0) {
        throw new Error('Account not found')
      }
      
      const accountId = (accountRows as any[])[0].guid
      
      const fields = []
      const values = []
      
      if (updateData.credits !== undefined) {
        fields.push('credits = ?')
        values.push(updateData.credits)
      }
      if (updateData.web_credits !== undefined) {
        fields.push('web_credits = ?')
        values.push(updateData.web_credits)
      }
      if (updateData.vip_status !== undefined) {
        fields.push('vip_status = ?')
        values.push(updateData.vip_status)
      }

      if (fields.length === 0) return null

      values.push(accountId)
      
      // Check if account_data record exists
      const [existingRows] = await connection.execute(
        'SELECT account_id FROM account_data WHERE account_id = ?',
        [accountId]
      )
      
      let result
      if (existingRows && (existingRows as any[]).length > 0) {
        // Update existing record
        result = await connection.execute(
          `UPDATE account_data SET ${fields.join(', ')} WHERE account_id = ?`,
          values
        )
      } else {
        // Create new record
        const insertFields = ['account_id', ...fields]
        const insertValues = [accountId, ...values.slice(0, -1)] // Remove the last value (accountId) since it's already in the array
        result = await connection.execute(
          `INSERT INTO account_data (${insertFields.join(', ')}) VALUES (${insertFields.map(() => '?').join(', ')})`,
          insertValues
        )
      }
      
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

  // Get characters by account username
  static async getCharactersByAccountUsername(username: string) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        `SELECT ci.*, a.account as account_name 
         FROM character_info ci
         LEFT JOIN accounts a ON ci.account_id = a.guid
         WHERE a.account = ?
         ORDER BY ci.level DESC`,
        [username]
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
        `SELECT ci.*, a.account as account_name, a.email, ad.vip_status, aw.inventory as warehouse_data
         FROM character_info ci
         LEFT JOIN accounts a ON ci.account_id = a.guid
         LEFT JOIN account_data ad ON a.guid = ad.account_id
         LEFT JOIN account_warehouse aw ON a.guid = aw.account_id
         WHERE ci.name = ?`,
        [characterName]
      )
      return rows
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

  // Update warehouse data
  static async updateWarehouse(characterName: string, warehouseData: string) {
    const connection = await getConnection()
    try {
      // First get the account_id for the character
      const [characterRows] = await connection.execute(
        'SELECT account_id FROM character_info WHERE name = ?',
        [characterName]
      )
      
      if (!characterRows || (characterRows as any[]).length === 0) {
        throw new Error('Character not found')
      }
      
      const accountId = (characterRows as any[])[0].account_id
      
      // Update the warehouse data in account_warehouse table
      const [result] = await connection.execute(
        'UPDATE account_warehouse SET inventory = ? WHERE account_id = ?',
        [warehouseData, accountId]
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

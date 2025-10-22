import mysql from 'mysql2/promise'

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '192.168.4.21',
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
        'SELECT * FROM MEMB_INFO ORDER BY memb___id DESC LIMIT ? OFFSET ?',
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
        'SELECT * FROM MEMB_INFO WHERE memb___id = ?',
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
        'INSERT INTO MEMB_INFO (memb___id, memb__pwd, mail_addr, vip) VALUES (?, ?, ?, ?)',
        [accountData.username, accountData.password, accountData.email, accountData.vip || false]
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
        fields.push('memb__pwd = ?')
        values.push(updateData.password)
      }
      if (updateData.email) {
        fields.push('mail_addr = ?')
        values.push(updateData.email)
      }
      if (updateData.vip !== undefined) {
        fields.push('vip = ?')
        values.push(updateData.vip)
      }
      if (updateData.blocked !== undefined) {
        fields.push('bloc_code = ?')
        values.push(updateData.blocked ? 1 : 0)
      }

      if (fields.length === 0) return null

      values.push(username)
      const [result] = await connection.execute(
        `UPDATE MEMB_INFO SET ${fields.join(', ')} WHERE memb___id = ?`,
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
        'DELETE FROM MEMB_INFO WHERE memb___id = ?',
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
      const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM accounts')
      const [activeRows] = await connection.execute('SELECT COUNT(*) as active FROM accounts WHERE status = "active"')
      const [vipRows] = await connection.execute('SELECT COUNT(*) as vip FROM accounts WHERE vip = 1')
      const [bannedRows] = await connection.execute('SELECT COUNT(*) as banned FROM accounts WHERE status = "banned"')

      return {
        total: (totalRows as any[])[0].total,
        active: (activeRows as any[])[0].active,
        vip: (vipRows as any[])[0].vip,
        banned: (bannedRows as any[])[0].banned
      }
    } finally {
      connection.release()
    }
  }
}

// Character management functions
export class CharacterManager {
  // Get characters by account
  static async getCharactersByAccount(accountName: string) {
    const connection = await getConnection()
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM Character WHERE AccountID = ?',
        [accountName]
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
        'SELECT * FROM Character WHERE Name = ?',
        [characterName]
      )
      return rows
    } finally {
      connection.release()
    }
  }

  // Delete character
  static async deleteCharacter(characterName: string) {
    const connection = await getConnection()
    try {
      const [result] = await connection.execute(
        'DELETE FROM Character WHERE Name = ?',
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
      const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM Character')
      const [onlineRows] = await connection.execute('SELECT COUNT(*) as online FROM Character WHERE CtlCode = 0')
      
      return {
        total: (totalRows as any[])[0].total,
        online: (onlineRows as any[])[0].online
      }
    } finally {
      connection.release()
    }
  }
}

export default pool

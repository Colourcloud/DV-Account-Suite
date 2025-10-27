import crypto from 'crypto'

/**
 * MUonline Password Utilities
 * Handles password hashing for MUonline server compatibility
 */

export class MUonlinePassword {
  /**
   * Hash a password using MD5 (standard MUonline method)
   */
  static md5(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex')
  }

  /**
   * Hash a password using SHA-256
   */
  static sha256(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex')
  }

  /**
   * Hash a password using MUonline method: SHA-256(username:password)
   */
  static muonline(username: string, password: string): string {
    const combined = `${username}:${password}`
    return crypto.createHash('sha256').update(combined).digest('hex')
  }

  /**
   * Double MD5 hash (some MUonline servers use this)
   */
  static doubleMd5(password: string): string {
    const firstHash = crypto.createHash('md5').update(password).digest('hex')
    return crypto.createHash('md5').update(firstHash).digest('hex')
  }

  /**
   * Try to identify the hash type based on length and format
   */
  static identifyHashType(hash: string): 'md5' | 'sha256' | 'double-md5' | 'muonline' | 'unknown' {
    if (hash.length === 32 && /^[a-f0-9]+$/i.test(hash)) {
      return 'md5'
    }
    if (hash.length === 64 && /^[a-f0-9]+$/i.test(hash)) {
      return 'sha256' // Could be muonline method too
    }
    if (hash.length === 32 && /^[a-f0-9]+$/i.test(hash)) {
      // Could be double MD5, but hard to distinguish from single MD5
      return 'double-md5'
    }
    return 'unknown'
  }

  /**
   * Verify if a password matches a given hash
   */
  static verifyPassword(password: string, hash: string, username?: string): boolean {
    const hashType = this.identifyHashType(hash)
    
    switch (hashType) {
      case 'md5':
        return this.md5(password) === hash
      case 'sha256':
        return this.sha256(password) === hash
      case 'double-md5':
        return this.doubleMd5(password) === hash
      case 'muonline':
        if (!username) return false
        return this.muonline(username, password) === hash
      default:
        return false
    }
  }

  /**
   * Generate a hash using the specified method
   */
  static hashPassword(password: string, method: 'md5' | 'sha256' | 'double-md5' | 'muonline' = 'md5', username?: string): string {
    switch (method) {
      case 'md5':
        return this.md5(password)
      case 'sha256':
        return this.sha256(password)
      case 'double-md5':
        return this.doubleMd5(password)
      case 'muonline':
        if (!username) throw new Error('Username required for MUonline hashing method')
        return this.muonline(username, password)
      default:
        throw new Error(`Unsupported hash method: ${method}`)
    }
  }
}


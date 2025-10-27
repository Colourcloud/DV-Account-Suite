import { NextRequest, NextResponse } from 'next/server'
import { AccountManager } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const accounts = await AccountManager.getAllAccounts(limit, offset)
    const stats = await AccountManager.getAccountStats()
    
    return NextResponse.json({
      accounts,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.total
      }
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, email, vip, hashMethod } = body
    
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const result = await AccountManager.createAccount({
      username,
      password,
      email,
      vip: vip || false,
      hashMethod: hashMethod || 'muonline' // Default to MUonline method
    })
    
    return NextResponse.json({ 
      success: true, 
      result,
      message: 'Account created successfully',
      hashMethod: hashMethod || 'muonline'
    })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

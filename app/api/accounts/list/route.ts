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

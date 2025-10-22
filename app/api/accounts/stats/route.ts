import { NextResponse } from 'next/server'
import { AccountManager } from '@/lib/database'

export async function GET() {
  try {
    const stats = await AccountManager.getAccountStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching account stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account statistics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { CharacterManager } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountName = searchParams.get('account')
    
    if (accountName) {
      const characters = await CharacterManager.getCharactersByAccount(accountName)
      return NextResponse.json(characters)
    }
    
    // If no account specified, return character stats
    const stats = await CharacterManager.getCharacterStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

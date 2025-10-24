import { NextRequest, NextResponse } from 'next/server'
import { CharacterManager } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const characters = await CharacterManager.getCharactersByAccountUsername(username)
    
    return NextResponse.json(characters)
  } catch (error) {
    console.error('Error fetching account characters:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

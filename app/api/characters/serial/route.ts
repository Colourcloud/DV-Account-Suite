import { NextRequest, NextResponse } from 'next/server'
import { CharacterManager } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - getting serial number...')
    // Get the next serial number from the database
    const serial = await CharacterManager.getNextItemSerial()
    console.log('API route - got serial:', serial)
    
    return NextResponse.json({ 
      success: true, 
      serial: serial 
    })
  } catch (error) {
    console.error('Error getting serial number:', error)
    return NextResponse.json(
      { error: 'Failed to get serial number' },
      { status: 500 }
    )
  }
}

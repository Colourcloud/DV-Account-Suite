import { NextRequest, NextResponse } from 'next/server'
import { CharacterManager } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ character: string }> }
) {
  try {
    const { character } = await params
    const characters = await CharacterManager.getCharacterByName(character)
    const characterData = Array.isArray(characters) && characters.length > 0 ? characters[0] as any : null
    
    if (!characterData) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }
    
    // Convert warehouse data from Buffer to string if it exists
    if (characterData.warehouse_data && Buffer.isBuffer(characterData.warehouse_data)) {
      characterData.warehouse_data = characterData.warehouse_data.toString('utf8')
    }
    
    return NextResponse.json(characterData)
  } catch (error) {
    console.error('Error fetching character data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ character: string }> }
) {
  try {
    const { character } = await params
    const body = await request.json()
    
    console.log('Updating character:', character, body)
    
    // Extract only the fields that can be updated
    const updateData = {
      level: body.level,
      level_master: body.level_master,
      strength: body.strength,
      agility: body.agility,
      vitality: body.vitality,
      energy: body.energy,
      leadership: body.leadership,
      points: body.points,
      money: body.money,
      ruud_money: body.ruud_money,
      reset: body.reset
    }
    
    // Remove undefined values
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )
    
    // Update the character in the database
    const result = await CharacterManager.updateCharacter(character, filteredUpdateData)
    
    if (!result) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    console.log('Character updated successfully:', result)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Character updated successfully',
      data: filteredUpdateData 
    })
  } catch (error) {
    console.error('Error updating character data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


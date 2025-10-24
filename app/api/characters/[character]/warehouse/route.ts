import { NextRequest, NextResponse } from 'next/server'
import { CharacterManager } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ character: string }> }
) {
  try {
    const { character } = await params
    const { warehouseData } = await request.json()

    if (!warehouseData) {
      return NextResponse.json(
        { error: 'Warehouse data is required' },
        { status: 400 }
      )
    }

    // Update the warehouse data in the database
    await CharacterManager.updateWarehouse(character, warehouseData)

    return NextResponse.json({ 
      success: true, 
      message: 'Warehouse updated successfully' 
    })
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    )
  }
}

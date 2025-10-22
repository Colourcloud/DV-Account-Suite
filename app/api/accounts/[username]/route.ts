import { NextRequest, NextResponse } from 'next/server'
import { AccountManager } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const account = await AccountManager.getAccountByUsername(params.username)
    
    if (!account || account.length === 0) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(account[0])
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const body = await request.json()
    const { password, email, vip, blocked } = body
    
    const result = await AccountManager.updateAccount(params.username, {
      password,
      email,
      vip,
      blocked
    })
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const result = await AccountManager.deleteAccount(params.username)
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { AccountManager } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const accounts = await AccountManager.getAccountByUsername(username)
    const accountData = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] as any : null
    
    if (!accountData) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    return NextResponse.json(accountData)
  } catch (error) {
    console.error('Error fetching account data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const body = await request.json()
    
    console.log('Updating account:', username, body)
    
    // Extract account fields
    const accountUpdateData = {
      email: body.email,
      blocked: body.blocked,
      vip: body.vip
    }
    
    // Extract account_data fields
    const accountDataUpdateData = {
      credits: body.credits,
      web_credits: body.web_credits,
      vip_status: body.vip_status
    }
    
    // Remove undefined values from account data
    const filteredAccountData = Object.fromEntries(
      Object.entries(accountUpdateData).filter(([_, value]) => value !== undefined)
    )
    
    // Remove undefined values from account_data
    const filteredAccountDataData = Object.fromEntries(
      Object.entries(accountDataUpdateData).filter(([_, value]) => value !== undefined)
    )
    
    let accountResult = null
    let accountDataResult = null
    
    // Update account if there are fields to update
    if (Object.keys(filteredAccountData).length > 0) {
      accountResult = await AccountManager.updateAccount(username, filteredAccountData)
    }
    
    // Update account_data if there are fields to update
    if (Object.keys(filteredAccountDataData).length > 0) {
      accountDataResult = await AccountManager.updateAccountData(username, filteredAccountDataData)
    }
    
    if (!accountResult && !accountDataResult) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    console.log('Account updated successfully:', { accountResult, accountDataResult })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account updated successfully',
      data: { ...filteredAccountData, ...filteredAccountDataData }
    })
  } catch (error) {
    console.error('Error updating account data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
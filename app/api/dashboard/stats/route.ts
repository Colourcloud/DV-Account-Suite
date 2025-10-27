import { NextResponse } from 'next/server'
import { AccountManager, CharacterManager } from '@/lib/database'

export async function GET() {
  try {
    // Fetch account and character statistics in parallel
    const [accountStats, characterStats] = await Promise.all([
      AccountManager.getAccountStats(),
      CharacterManager.getCharacterStats()
    ])

    // Calculate additional metrics
    const totalAccounts = accountStats.total
    const activeAccounts = accountStats.active
    const onlineCharacters = characterStats.online
    const totalCharacters = characterStats.total
    const vipAccounts = accountStats.vip
    const bannedAccounts = accountStats.banned

    // Calculate growth percentages (mock data for now - in real implementation, 
    // you'd compare with previous period data)
    const accountGrowth = Math.floor(Math.random() * 20) + 5 // 5-25% growth
    const characterGrowth = Math.floor(Math.random() * 15) + 3 // 3-18% growth

    return NextResponse.json({
      accounts: {
        total: totalAccounts,
        active: activeAccounts,
        vip: vipAccounts,
        banned: bannedAccounts,
        growth: accountGrowth
      },
      characters: {
        total: totalCharacters,
        online: onlineCharacters,
        vip: characterStats.vip,
        banned: characterStats.banned,
        growth: characterGrowth
      },
      server: {
        status: 'online',
        onlineUsers: onlineCharacters,
        uptime: '99.9%'
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}

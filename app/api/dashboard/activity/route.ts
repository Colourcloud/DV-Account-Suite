import { NextResponse } from 'next/server'
import { getConnection } from '@/lib/database'

export async function GET() {
  try {
    const connection = await getConnection()
    
    try {
      // Get recent account registrations (using guid as proxy for creation order)
      const [recentAccounts] = await connection.execute(`
        SELECT 
          'account_created' as action,
          a.account as user,
          NOW() as timestamp,
          'success' as status
        FROM accounts a 
        ORDER BY a.guid DESC 
        LIMIT 5
      `)

      // Get recent character activities (online characters, high level characters)
      const [recentCharacters] = await connection.execute(`
        SELECT 
          'character_online' as action,
          ci.name as user,
          NOW() as timestamp,
          'info' as status
        FROM character_info ci 
        WHERE ci.online = 1
        ORDER BY ci.level DESC 
        LIMIT 3
      `)

      // Get high level characters (as proxy for recent activity)
      const [highLevelChars] = await connection.execute(`
        SELECT 
          'character_levelup' as action,
          ci.name as user,
          NOW() as timestamp,
          'success' as status
        FROM character_info ci 
        WHERE ci.level > 200
        ORDER BY ci.level DESC 
        LIMIT 3
      `)

      // Get banned accounts (using blocked accounts from main table)
      const [bannedAccounts] = await connection.execute(`
        SELECT 
          'account_banned' as action,
          a.account as user,
          NOW() as timestamp,
          'error' as status
        FROM accounts a 
        WHERE a.blocked = 1
        ORDER BY a.guid DESC 
        LIMIT 3
      `)

      // Combine and sort all activities
      const allActivities = [
        ...(recentAccounts as any[]).map(acc => ({
          id: `acc_${acc.user}_${acc.timestamp}`,
          action: 'Account created',
          user: acc.user,
          time: formatTimeAgo(acc.timestamp),
          status: acc.status
        })),
        ...(recentCharacters as any[]).map(char => ({
          id: `char_${char.user}_${char.timestamp}`,
          action: 'Character online',
          user: char.user,
          time: formatTimeAgo(char.timestamp),
          status: char.status
        })),
        ...(highLevelChars as any[]).map(char => ({
          id: `level_${char.user}_${char.timestamp}`,
          action: 'High level character',
          user: char.user,
          time: formatTimeAgo(char.timestamp),
          status: char.status
        })),
        ...(bannedAccounts as any[]).map(ban => ({
          id: `ban_${ban.user}_${ban.timestamp}`,
          action: 'Account banned',
          user: ban.user,
          time: formatTimeAgo(ban.timestamp),
          status: ban.status
        }))
      ]

      // Sort by timestamp (most recent first) and limit to 15
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 15)

      return NextResponse.json(sortedActivities)
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(timestamp: string | Date): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

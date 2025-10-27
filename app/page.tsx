"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CreateAccountModal } from "@/components/create-account-modal"
import { Users, Gamepad2, Database, Shield, TrendingUp, UserPlus, Search, Settings, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  accounts: {
    total: number
    active: number
    vip: number
    banned: number
    growth: number
  }
  characters: {
    total: number
    online: number
    vip: number
    banned: number
    growth: number
  }
  server: {
    status: string
    onlineUsers: number
    uptime: string
  }
}

interface ActivityItem {
  id: string
  action: string
  user: string
  time: string
  status: string
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ])

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [statsData, activityData] = await Promise.all([
        statsResponse.json(),
        activityResponse.json()
      ])

      setStats(statsData)
      setRecentActivity(activityData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? "↗" : trend === "down" ? "↘" : "→"
  }

  const statsCards = stats ? [
    {
      title: "Total Accounts",
      value: formatNumber(stats.accounts.total),
      description: `+${stats.accounts.growth}% from last month`,
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Characters",
      value: formatNumber(stats.characters.total),
      description: `+${stats.characters.growth}% from last month`,
      icon: Gamepad2,
      trend: "up"
    },
    {
      title: "Online Users",
      value: formatNumber(stats.server.onlineUsers),
      description: `Server Status: ${stats.server.status}`,
      icon: Database,
      trend: "neutral"
    },
    {
      title: "VIP Accounts",
      value: formatNumber(stats.accounts.vip),
      description: `${stats.accounts.active} active accounts`,
      icon: Shield,
      trend: "up"
    },
    {
      title: "Banned Accounts",
      value: formatNumber(stats.accounts.banned),
      description: `${stats.characters.banned} banned characters`,
      icon: AlertCircle,
      trend: "down"
    },
    {
      title: "Server Uptime",
      value: stats.server.uptime,
      description: "Last updated: " + lastUpdated.toLocaleTimeString(),
      icon: TrendingUp,
      trend: "neutral"
    }
  ] : []

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to DV Account Suite - MUonline Server Management
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <UserPlus className="mr-2 h-4 w-4" />
            {showCreateForm ? 'Cancel' : 'Add Account'}
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">Error loading dashboard data: {error}</p>
          </div>
        </div>
      )}

      <CreateAccountModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSuccess={() => {
          fetchDashboardData() // Refresh dashboard data
        }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest account and character management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        User: {activity.user}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          activity.status === "success" ? "default" :
                          activity.status === "warning" ? "secondary" :
                          activity.status === "error" ? "destructive" : "outline"
                        }
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
          <Link href="/accounts">
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Accounts
            </Button>
            </Link>
            <Link href="/characters">
            <Button className="w-full justify-start" variant="outline">
              <Gamepad2 className="mr-2 h-4 w-4" />
              View Characters
            </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

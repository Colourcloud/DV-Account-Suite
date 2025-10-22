import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Gamepad2, Database, Shield, TrendingUp, UserPlus, Search, Settings } from "lucide-react"

export default function Home() {
  const stats = [
    {
      title: "Total Accounts",
      value: "1,234",
      description: "+12% from last month",
      icon: Users,
      trend: "up"
    },
    {
      title: "Active Characters",
      value: "5,678",
      description: "+8% from last month",
      icon: Gamepad2,
      trend: "up"
    },
    {
      title: "Server Status",
      value: "453",
      description: "Current Online Users",
      icon: Database,
      trend: "neutral"
    }
  ]

  const recentActivity = [
    {
      id: 1,
      action: "Account created",
      user: "player123",
      time: "2 minutes ago",
      status: "success"
    },
    {
      id: 2,
      action: "Character deleted",
      user: "testuser",
      time: "5 minutes ago",
      status: "warning"
    },
    {
      id: 3,
      action: "Password changed",
      user: "admin",
      time: "10 minutes ago",
      status: "info"
    },
    {
      id: 4,
      action: "Account banned",
      user: "cheater",
      time: "15 minutes ago",
      status: "error"
    }
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to DV Account Suite - MUonline Server Management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
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
        ))}
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
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Accounts
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Gamepad2 className="mr-2 h-4 w-4" />
              View Characters
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Database Tools
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Security Settings
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

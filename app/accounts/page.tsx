import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, UserPlus, Edit, Trash2, Shield, Ban, CheckCircle } from "lucide-react"
import { AccountManager } from "@/lib/database"
import Link from "next/link"

export default async function AccountsPage() {
  // Fetch account statistics from database
  let stats = {
    total: 0,
    active: 0,
    vip: 0,
    banned: 0
  }

  // Fetch accounts data from database
  let accounts: any[] = []
  let error: string | null = null

  try {
    stats = await AccountManager.getAccountStats()
    accounts = await AccountManager.getAllAccounts(50, 0) as any[] // Get first 50 accounts
  } catch (err) {
    console.error('Error fetching account data:', err)
    error = 'Failed to load account data'
  }

  const getStatusBadge = (blocked: number) => {
    if (blocked === 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
    } else {
      return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>
    }
  }

  const getAccountRowStyle = (blocked: number) => {
    if (blocked === 1) {
      return "opacity-60 bg-red-50/30 dark:bg-red-950/20"
    }
    return ""
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
          <p className="text-muted-foreground">
            Manage player accounts, permissions, and security settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Accounts</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.banned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Accounts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vip}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                Manage and monitor player accounts
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Characters</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>VIP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No accounts found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account: any) => (
                <TableRow key={account.guid} className={getAccountRowStyle(account.blocked)}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/avatars/${account.account}.png`} />
                        <AvatarFallback>{account.account?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{account.account}</span>
                          {account.blocked === 1 && (
                            <Ban className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{account.email || 'No email'}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(account.blocked)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{account.character_count || 0} chars</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(account.last_login)}
                  </TableCell>
                  <TableCell>
                    {account.vip_status > 0 ? (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        VIP
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link href={`/accounts/${account.account}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <Ban className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  )
}

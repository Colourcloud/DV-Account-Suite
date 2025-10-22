import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, UserPlus, Edit, Trash2, Shield, Ban, CheckCircle, Gamepad2 } from "lucide-react"

export default function CharactersPage() {
  const characters = [
    {
      id: 1,
      name: "DarkKnight",
      account: "admin",
      class: "Dark Knight",
      level: 85,
      status: "online",
      map: "Lorencia",
      lastLogin: "2 hours ago",
      created: "2024-01-15",
      vip: true
    },
    {
      id: 2,
      name: "TestMage",
      account: "admin",
      class: "Fairy Elf",
      level: 45,
      status: "offline",
      map: "Devias",
      lastLogin: "1 day ago",
      created: "2024-02-10",
      vip: false
    },
    {
      id: 3,
      name: "AdminChar",
      account: "admin",
      class: "Summoner",
      level: 99,
      status: "online",
      map: "Arena",
      lastLogin: "30 minutes ago",
      created: "2023-12-01",
      vip: true
    },
    {
      id: 4,
      name: "Newbie",
      account: "admin",
      class: "Dark Knight",
      level: 12,
      status: "offline",
      map: "Lorencia",
      lastLogin: "5 hours ago",
      created: "2024-03-01",
      vip: false
    },
    {
      id: 4,
      name: "Jaromme",
      account: "admin",
      class: "Dark Lord",
      level: 400,
      status: "offline",
      map: "Lorencia",
      lastLogin: "5 hours ago",
      created: "2024-03-01",
      vip: false
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Online</Badge>
      case "offline":
        return <Badge variant="secondary">Offline</Badge>
      case "banned":
        return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getClassImage = (className: string) => {
    switch (className) {
      case "Dark Knight":
        return "/class/knight.jpg"
      case "Dark Wizard":
        return "/class/dark-wizard.jpg"
      case "Fairy Elf":
        return "/class/elf.jpg"
      case "Magic Gladiator":
        return "/class/magic-gladiator.jpg"
      case "Dark Lord":
        return "/class/darklord.jpg"
      case "Summoner":
        return "/class/summoner.jpg"
      case "Rage Fighter":
        return "/class/rage-fighter.jpg"
      default:
        return "/class/default.jpg"
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Character Management</h1>
          <p className="text-muted-foreground">
            Manage player characters, levels, and in-game status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Character
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Characters</CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Characters</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Characters</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Characters</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Characters</CardTitle>
              <CardDescription>
                Manage and monitor player characters
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search characters..."
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="dark-knight">Dark Knight</SelectItem>
                  <SelectItem value="dark-wizard">Dark Wizard</SelectItem>
                  <SelectItem value="fairy-elf">Fairy Elf</SelectItem>
                  <SelectItem value="magic-gladiator">Magic Gladiator</SelectItem>
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
                <TableHead>Character</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>VIP</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characters.map((character) => (
                <TableRow key={character.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getClassImage(character.class)} 
                        alt={character.class}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-muted-foreground">ID: {character.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{character.account}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{character.class}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="font-medium">{character.level}</span>
                      <span className="text-sm text-muted-foreground ml-1">lvl</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(character.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{character.map}</Badge>
                  </TableCell>
                  <TableCell>
                    {character.vip ? (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        VIP
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

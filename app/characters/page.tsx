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
import { CharacterManager } from "@/lib/database"
import { getRaceToClass, getClassImage, getWorldName } from "@/lib/class-utils"
import Link from "next/link"    

export default async function CharactersPage() {
  // Fetch characters and stats from database
  const characters = await CharacterManager.getAllCharacters(100, 0) as any[]
  const stats = await CharacterManager.getCharacterStats()

  const getStatusBadge = (online: number, blocked: number) => {
    if (blocked === 1) {
      return <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>
    }
    if (online === 1) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Online</Badge>
    }
    return <Badge variant="secondary">Offline</Badge>
  }

  const getCharacterRowStyle = (blocked: number) => {
    if (blocked === 1) {
      return "opacity-60 bg-red-50/30 dark:bg-red-950/20"
    }
    return ""
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
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Characters</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.online}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Characters</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.banned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Characters</CardTitle>
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
              {characters.map((character: any) => {
                const className = getRaceToClass(character.race)
                const worldName = getWorldName(character.world)
                
                return (
                  <TableRow key={character.guid} className={getCharacterRowStyle(character.blocked)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={getClassImage(className)} 
                          alt={className}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium flex items-center space-x-2">
                            <span>{character.name}</span>
                            {character.blocked === 1 && (
                              <Ban className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">ID: {character.guid}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{character.account_name}</span>
                        {character.blocked === 1 && (
                          <Ban className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{className}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="font-medium">{character.level}</span>
                        <span className="text-sm text-muted-foreground ml-1">lvl</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(character.online, character.blocked)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{worldName}</Badge>
                    </TableCell>
                    <TableCell>
                      {character.vip_status && character.vip_status > 0 ? (
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          VIP
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                      <Link href={`/characters/${character.name.toLowerCase()}`}>
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

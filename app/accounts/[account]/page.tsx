"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, RotateCcw, Shield, Crown, Coins, Users, Loader2, Ban, User, Mail, Lock, Star, Gamepad2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getRaceToClass, getClassImage, formatZen } from "@/lib/class-utils"

interface AccountStats {
  guid: number
  account: string
  password: string
  email: string
  secured: number
  blocked: number
  vip_status: number
  credits: number
  web_credits: number
  character_count: number
}

interface UIAccountStats {
  guid: number
  username: string
  email: string
  isSecured: boolean
  isBlocked: boolean
  vipStatus: boolean
  vipLevel: number
  credits: number
  webCredits: number
  characterCount: number
}

interface CharacterInfo {
  name: string
  level: number
  level_master: number
  reset: number
  race: number
  strength: number
  agility: number
  vitality: number
  energy: number
  leadership: number
  money: number
  ruud_money: number
  online: number
  account_name: string
}

export default function AccountPage({ params }: { params: Promise<{ account: string }> }) {
  const [accountData, setAccountData] = useState<UIAccountStats | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<UIAccountStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [characters, setCharacters] = useState<CharacterInfo[]>([])
  const [charactersLoading, setCharactersLoading] = useState(false)
  const { toast } = useToast()

  // Helper function to convert database data to UI format
  const convertToUIFormat = (dbData: AccountStats): UIAccountStats => {
    return {
      guid: dbData.guid,
      username: dbData.account,
      email: dbData.email,
      isSecured: dbData.secured === 1,
      isBlocked: dbData.blocked === 1,
      vipStatus: dbData.vip_status > 0,
      vipLevel: dbData.vip_status || 0,
      credits: dbData.credits || 0,
      webCredits: dbData.web_credits || 0,
      characterCount: dbData.character_count || 0
    }
  }

  // Helper function to convert UI data back to database format
  const convertToDBFormat = (uiData: UIAccountStats): Partial<AccountStats> => {
    return {
      email: uiData.email,
      blocked: uiData.isBlocked ? 1 : 0,
      vip_status: uiData.vipLevel,
      credits: uiData.credits,
      web_credits: uiData.webCredits
    }
  }

  // Fetch account data on component mount
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const resolvedParams = await params
        const response = await fetch(`/api/accounts/${resolvedParams.account}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Account not found')
          }
          throw new Error('Failed to fetch account data')
        }
        
        const dbData: AccountStats = await response.json()
        const uiData = convertToUIFormat(dbData)
        setAccountData(uiData)
        setEditedData(uiData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [params])

  // Fetch characters for the account
  useEffect(() => {
    const fetchCharacters = async () => {
      if (!accountData) return
      
      try {
        setCharactersLoading(true)
        const resolvedParams = await params
        const response = await fetch(`/api/accounts/${resolvedParams.account}/characters`)
        
        if (response.ok) {
          const characterData: CharacterInfo[] = await response.json()
          setCharacters(characterData)
        }
      } catch (err) {
        console.error('Error fetching characters:', err)
      } finally {
        setCharactersLoading(false)
      }
    }

    fetchCharacters()
  }, [accountData, params])

  const handleInputChange = (field: keyof UIAccountStats, value: string | number | boolean) => {
    setEditedData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null)
  }

  const handleSave = async () => {
    if (!editedData) return
    
    try {
      setIsSaving(true)
      setError(null)
      
      const dbData = convertToDBFormat(editedData)
      const resolvedParams = await params
      
      console.log('Saving account data:', {
        account: resolvedParams.account,
        dbData,
        originalData: accountData,
        editedData
      })
      
      const response = await fetch(`/api/accounts/${resolvedParams.account}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbData),
      })
      
      console.log('Save response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Save failed:', errorText)
        throw new Error(`Failed to save account data: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Save successful:', result)
      
      setAccountData(editedData)
      setIsEditing(false)
      
      toast({
        title: "Success!",
        description: "Account updated successfully!",
        variant: "success",
      })
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedData(accountData)
    setIsEditing(false)
  }

  const handleReset = () => {
    setEditedData(accountData)
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading account data...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error || !accountData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Shield className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Account</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Details</h1>
            <p className="text-muted-foreground">
              Manage account information and credits
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => {
                setIsEditing(true)
                setError(null)
              }}
            >
              <User className="mr-2 h-4 w-4" />
              Edit Account
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <Shield className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Header */}
      <Card className="mb-6 pt-0">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{accountData.username}</h2>
                {accountData.vipStatus && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP {accountData.vipLevel}
                  </Badge>
                )}
                {accountData.isBlocked && (
                  <Badge variant="destructive">
                    <Ban className="w-3 h-3 mr-1" />
                    Banned
                  </Badge>
                )}
                {accountData.isSecured && (
                  <Badge variant="secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    Secured
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Account ID: {accountData.guid} • Characters: {accountData.characterCount}
              </p>
              <p className="text-sm text-muted-foreground">
                Credits: {accountData.credits.toLocaleString()} • Web Credits: {accountData.webCredits.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Basic account details and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={accountData.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Username cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? editedData?.email || '' : accountData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isBlocked">Account Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Account is banned/blocked
                  </p>
                </div>
                <Select
                  value={isEditing ? editedData?.isBlocked.toString() || accountData.isBlocked.toString() : accountData.isBlocked.toString()}
                  onValueChange={(value) => handleInputChange('isBlocked', value === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits & VIP Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Credits & VIP
            </CardTitle>
            <CardDescription>
              Account credits and VIP status management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input
                id="credits"
                type="number"
                value={isEditing ? editedData?.credits || 0 : accountData.credits}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
                max="999999999"
                placeholder="Max: 999,999,999"
              />
              <p className="text-xs text-muted-foreground">
                Current: {accountData.credits.toLocaleString()} • Max: 999M
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webCredits">Web Credits</Label>
              <Input
                id="webCredits"
                type="number"
                value={isEditing ? editedData?.webCredits || 0 : accountData.webCredits}
                onChange={(e) => handleInputChange('webCredits', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
                max="999999999"
                placeholder="Max: 999,999,999"
              />
              <p className="text-xs text-muted-foreground">
                Current: {accountData.webCredits.toLocaleString()} • Max: 999M
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vipStatus">VIP Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Account has VIP privileges
                  </p>
                </div>
                <Select
                  value={isEditing ? editedData?.vipStatus.toString() || accountData.vipStatus.toString() : accountData.vipStatus.toString()}
                  onValueChange={(value) => handleInputChange('vipStatus', value === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vipLevel">VIP Level</Label>
                <Input
                  id="vipLevel"
                  type="number"
                  value={isEditing ? editedData?.vipLevel || 0 : accountData.vipLevel}
                  onChange={(e) => handleInputChange('vipLevel', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                  max="10"
                  placeholder="0-10"
                />
                <p className="text-xs text-muted-foreground">
                  VIP Level: 0 = No VIP, 1-10 = VIP Level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Account Statistics
            </CardTitle>
            <CardDescription>
              Account activity and character information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account ID</Label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {accountData.guid}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Character Count</Label>
                <div className="p-2 bg-muted rounded-md text-sm">
                  {accountData.characterCount}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${accountData.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-sm">
                  {accountData.isBlocked ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Security Status</Label>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${accountData.isSecured ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-sm">
                  {accountData.isSecured ? 'Secured' : 'Unsecured'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common account management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled={!isEditing}>
              <Coins className="mr-2 h-4 w-4" />
              Reset Credits
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled={!isEditing}>
              <Crown className="mr-2 h-4 w-4" />
              Set VIP Status
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled={!isEditing}>
              <Shield className="mr-2 h-4 w-4" />
              Reset Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Character List Section */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gamepad2 className="mr-2 h-5 w-5" />
              Characters ({characters.length})
            </CardTitle>
            <CardDescription>
              Characters belonging to this account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {charactersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading characters...</span>
                </div>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-8">
                <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Characters Found</h3>
                <p className="text-muted-foreground">
                  This account doesn't have any characters yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {characters.map((character) => (
                  <Card key={character.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full border border-blue-400 flex items-center justify-center">
                          <img 
                            src={getClassImage(getRaceToClass(character.race))} 
                            alt={getRaceToClass(character.race)}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold truncate">{character.name}</h4>
                            {character.online === 1 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Level {character.level} • {getRaceToClass(character.race)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Master: {character.level_master} • Resets: {character.reset || 0}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <div>Zen: {formatZen(character.money)}</div>
                          <div>Ruud: {formatZen(character.ruud_money || 0)}</div>
                        </div>
                        <Link href={`/characters/${character.name}`}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

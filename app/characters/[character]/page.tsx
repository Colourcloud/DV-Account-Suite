"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save, RotateCcw, Shield, Crown, Zap, Heart, Brain, Users, Coins, Star, Gamepad2, Loader2, Ban } from "lucide-react"
import Link from "next/link"
import { getRaceToClass, getClassImage, formatZen } from "@/lib/class-utils"
import { useToast } from "@/hooks/use-toast"
import { WarehouseGrid } from "@/components/warehouse-grid"
import { ItemCreatorForm } from "@/components/item-creator-form"
import { ITEMS_DATABASE } from "@/lib/items-data"

interface CharacterStats {
  name: string
  level: number
  level_master: number
  reset: number
  points: number
  race: number
  strength: number
  agility: number
  vitality: number
  energy: number
  leadership: number
  money: number
  ruud_money: number
  vip_status: number
  account_name: string
  email: string
  blocked: number
  warehouse_data?: Buffer | string
}

interface UICharacterStats {
  name: string
  level: number
  masterLevel: number
  resetCount: number
  remainingStatPoints: number
  classType: string
  strength: number
  agility: number
  vitality: number
  energy: number
  command: number
  zenAmount: number
  ruudAmount: number
  vipStatus: boolean
  isGameMaster: boolean
  isBanned: boolean
  warehouseData?: Buffer | string
}

const characterClasses = [
  "Dark Knight",
  "Dark Wizard", 
  "Fairy Elf",
  "Magic Gladiator",
  "Dark Lord",
  "Summoner",
  "Rage Fighter",
  "Grow Lancer",
  "Rune Wizard",
  "Slayer",
  "Gun Crusher",
  "Lightning Mage",
  "Magic Knight",
  "Dark Raven",
  "Blue Wizard"
]

export default function CharacterPage({ params }: { params: Promise<{ character: string }> }) {
  const [characterData, setCharacterData] = useState<UICharacterStats | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<UICharacterStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [startItemPlacement, setStartItemPlacement] = useState<((item: any) => void) | null>(null)
  const { toast } = useToast()

  // Memoize the warehouse update callback
  const handleWarehouseUpdate = useCallback(async (newData: string) => {
    try {
      const response = await fetch(`/api/characters/${characterData?.name}/warehouse`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ warehouseData: newData }),
      })

      if (response.ok) {
        toast({
          title: "Warehouse Updated",
          description: "Item has been successfully added to the warehouse.",
        })
      } else {
        throw new Error('Failed to update warehouse')
      }
    } catch (error) {
      console.error('Error updating warehouse:', error)
      toast({
        title: "Error",
        description: "Failed to save item to warehouse. Please try again.",
        variant: "destructive"
      })
    }
  }, [characterData?.name, toast])

  // Memoize the item placement ready callback
  const handleItemPlacementReady = useCallback((placementFn: (item: any) => void) => {
    setStartItemPlacement(() => placementFn)
  }, [])

  // Helper function to convert database data to UI format
  const convertToUIFormat = (dbData: CharacterStats): UICharacterStats => {
    return {
      name: dbData.name,
      level: dbData.level,
      masterLevel: dbData.level_master,
      resetCount: dbData.reset,
      remainingStatPoints: dbData.points,
      classType: getRaceToClass(dbData.race),
      strength: dbData.strength,
      agility: dbData.agility,
      vitality: dbData.vitality,
      energy: dbData.energy,
      command: dbData.leadership,
      zenAmount: dbData.money,
      ruudAmount: dbData.ruud_money || 0,
      vipStatus: dbData.vip_status > 0,
      isGameMaster: dbData.blocked === 0 && dbData.name.toLowerCase().includes('gm'), // Simple GM detection
      isBanned: dbData.blocked === 1, // Account is banned
      warehouseData: dbData.warehouse_data
    }
  }

  // Helper function to convert UI data back to database format
  const convertToDBFormat = (uiData: UICharacterStats): Partial<CharacterStats> => {
    return {
      level: uiData.level,
      level_master: uiData.masterLevel,
      strength: uiData.strength,
      agility: uiData.agility,
      vitality: uiData.vitality,
      energy: uiData.energy,
      leadership: uiData.command,
      points: uiData.remainingStatPoints,
      money: uiData.zenAmount,
      ruud_money: uiData.ruudAmount,
      reset: uiData.resetCount
    }
  }

  // Fetch character data on component mount
  useEffect(() => {
    const fetchCharacterData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const resolvedParams = await params
        const response = await fetch(`/api/characters/${resolvedParams.character}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Character not found')
          }
          throw new Error('Failed to fetch character data')
        }
        
        const dbData: CharacterStats = await response.json()
        const uiData = convertToUIFormat(dbData)
        setCharacterData(uiData)
        setEditedData(uiData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCharacterData()
  }, [params])

  const handleInputChange = (field: keyof UICharacterStats, value: string | number | boolean) => {
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
      
      console.log('Saving character data:', {
        character: resolvedParams.character,
        dbData,
        originalData: characterData,
        editedData
      })
      
      const response = await fetch(`/api/characters/${resolvedParams.character}`, {
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
        throw new Error(`Failed to save character data: ${response.status} ${errorText}`)
      }
      
      const result = await response.json()
      console.log('Save successful:', result)
      
      setCharacterData(editedData)
      setIsEditing(false)
      
      toast({
        title: "Success!",
        description: "Character updated successfully!",
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
    setEditedData(characterData)
    setIsEditing(false)
  }

  const handleReset = () => {
    setEditedData(characterData)
  }

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading character data...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error || !characterData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <Shield className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Error Loading Character</h3>
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
          <Link href="/characters">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Character Details</h1>
            <p className="text-muted-foreground">
              Manage character stats and properties
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
              disabled={characterData.isBanned}
            >
              <Gamepad2 className="mr-2 h-4 w-4" />
              {characterData.isBanned ? 'Edit Disabled' : 'Edit Character'}
            </Button>
          )}
        </div>
      </div>

      {/* Banned Account Warning */}
      {characterData.isBanned && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-300">
              <Ban className="h-4 w-4" />
              <span className="font-medium">This character belongs to a banned account. Editing is restricted.</span>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Character Header */}
      <Card className="mb-6 pt-0">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={getClassImage(characterData.classType)} alt={characterData.classType} />
              <AvatarFallback>{characterData.classType.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold">{characterData.name}</h2>
                {characterData.vipStatus && (
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Crown className="w-3 h-3 mr-1" />
                    VIP
                  </Badge>
                )}
                {characterData.isGameMaster && (
                  <Badge variant="default" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    <Shield className="w-3 h-3 mr-1" />
                    GM
                  </Badge>
                )}
                {characterData.isBanned && (
                  <Badge variant="destructive">
                    <Ban className="w-3 h-3 mr-1" />
                    Banned
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Level {characterData.level} • Master Level {characterData.masterLevel} • {characterData.classType}
              </p>
              <p className="text-sm text-muted-foreground">
                Resets: {characterData.resetCount || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Basic Stats
            </CardTitle>
            <CardDescription>
              Core character level and progression information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  type="number"
                  value={isEditing ? editedData?.level || 0 : characterData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="1"
                  max="400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="masterLevel">Master Level</Label>
                <Input
                  id="masterLevel"
                  type="number"
                  value={isEditing ? editedData?.masterLevel || 0 : characterData.masterLevel}
                  onChange={(e) => handleInputChange('masterLevel', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resetCount">Reset Count</Label>
                <Input
                  id="resetCount"
                  type="number"
                  value={isEditing ? editedData?.resetCount || 0 : characterData.resetCount}
                  onChange={(e) => handleInputChange('resetCount', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classType">Class Type</Label>
              <Select
                value={isEditing ? editedData?.classType || characterData.classType : characterData.classType}
                onValueChange={(value) => handleInputChange('classType', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {characterClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attribute Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              Attributes
            </CardTitle>
            <CardDescription>
              Character attribute points and stats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  type="number"
                  value={isEditing ? editedData?.strength || 0 : characterData.strength}
                  onChange={(e) => handleInputChange('strength', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agility">Agility</Label>
                <Input
                  id="agility"
                  type="number"
                  value={isEditing ? editedData?.agility || 0 : characterData.agility}
                  onChange={(e) => handleInputChange('agility', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vitality">Vitality</Label>
                <Input
                  id="vitality"
                  type="number"
                  value={isEditing ? editedData?.vitality || 0 : characterData.vitality}
                  onChange={(e) => handleInputChange('vitality', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="energy">Energy</Label>
                <Input
                  id="energy"
                  type="number"
                  value={isEditing ? editedData?.energy || 0 : characterData.energy}
                  onChange={(e) => handleInputChange('energy', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="command">Command</Label>
              <Input
                id="command"
                type="number"
                  value={isEditing ? editedData?.command || 0 : characterData.command}
                onChange={(e) => handleInputChange('command', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remainingStatPoints">Remaining Stat Points</Label>
              <Input
                id="remainingStatPoints"
                type="number"
                  value={isEditing ? editedData?.remainingStatPoints || 0 : characterData.remainingStatPoints}
                onChange={(e) => handleInputChange('remainingStatPoints', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Economy & Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Economy & Status
            </CardTitle>
            <CardDescription>
              Character wealth and special status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zenAmount">Zen Amount</Label>
              <Input
                id="zenAmount"
                type="number"
                  value={isEditing ? editedData?.zenAmount || 0 : characterData.zenAmount}
                onChange={(e) => handleInputChange('zenAmount', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
                max="2000000000"
                placeholder="Max: 2,000,000,000"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatZen(characterData.zenAmount)} • Max: 2B
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ruudAmount">Ruud Amount</Label>
              <Input
                id="ruudAmount"
                type="number"
                value={isEditing ? editedData?.ruudAmount || 0 : characterData.ruudAmount}
                onChange={(e) => handleInputChange('ruudAmount', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                min="0"
                max="999999999"
                placeholder="Max: 999,999,999"
              />
              <p className="text-xs text-muted-foreground">
                Current: {formatZen(characterData.ruudAmount)} • Max: 999M
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vipStatus">VIP Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Character has VIP privileges
                  </p>
                </div>
                <Select
                  value={isEditing ? editedData?.vipStatus.toString() || characterData.vipStatus.toString() : characterData.vipStatus.toString()}
                  onValueChange={(value) => handleInputChange('vipStatus', value === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isGameMaster">Game Master</Label>
                  <p className="text-sm text-muted-foreground">
                    Character has GM privileges
                  </p>
                </div>
                <Select
                  value={isEditing ? editedData?.isGameMaster.toString() || characterData.isGameMaster.toString() : characterData.isGameMaster.toString()}
                  onValueChange={(value) => handleInputChange('isGameMaster', value === 'true')}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
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
              Common character management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled={!isEditing}>
              <Users className="mr-2 h-4 w-4" />
              Reset Stats
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled={!isEditing}>
              <Shield className="mr-2 h-4 w-4" />
              Reset to Default
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse and Item Creator Section */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Section */}
        <div>
          <WarehouseGrid 
            accountId={1} // TODO: Get actual account ID from character data
            characterName={characterData.name}
            warehouseData={characterData.warehouseData as string}
            onWarehouseUpdate={handleWarehouseUpdate}
            onItemPlacementReady={handleItemPlacementReady}
          />
        </div>

        {/* Item Creator Section */}
        <div>
          <ItemCreatorForm 
            onItemCreate={(itemData) => {
              if (startItemPlacement) {
                // Get item data from the database
                const itemFromDb = ITEMS_DATABASE.find(item => item.id === itemData.itemId)
                if (itemFromDb) {
                  const pendingItem = {
                    id: itemData.itemId,
                    name: itemData.itemName,
                    width: itemFromDb.width,
                    height: itemFromDb.height,
                    level: itemData.itemLevel,
                    durability: itemData.durability,
                    luck: itemData.luck,
                    skill: itemData.skill,
                    masterySetItem: itemData.masterySetItem,
                    masteryBonus: itemData.masteryBonus,
                    option: itemData.option,
                    excellentOption: itemData.calculatedOptionValue,
                    ancientOption: itemData.masterySetItem ? 9 : 0,
                    wing5thOption1: itemData.wing5thOption1,
                    wing5thOption2: itemData.wing5thOption2,
                    socket1: itemData.socket1,
                    socket2: itemData.socket2,
                    socket3: itemData.socket3,
                    socket4: itemData.socket4,
                    socket5: itemData.socket5
                  }
                  
                  startItemPlacement(pendingItem)
                  
                  toast({
                    title: "Item Ready for Placement",
                    description: `Click on the warehouse grid to place ${itemData.itemName} (+${itemData.itemLevel})`,
                  })
                }
              } else {
                toast({
                  title: "Error",
                  description: "Warehouse not ready for item placement",
                  variant: "destructive"
                })
              }
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

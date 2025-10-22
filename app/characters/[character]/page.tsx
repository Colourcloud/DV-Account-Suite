"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save, RotateCcw, Shield, Crown, Zap, Heart, Brain, Users, Coins, Star, Gamepad2 } from "lucide-react"
import Link from "next/link"

interface CharacterStats {
  name: string
  level: number
  masterLevel: number
  resetCount: number
  grandResetCount: number
  remainingStatPoints: number
  classType: string
  strength: number
  agility: number
  vitality: number
  energy: number
  command: number
  zenAmount: number
  vipStatus: boolean
  isGameMaster: boolean
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

export default function CharacterPage({ params }: { params: { character: string } }) {
  // Mock character data - in real app this would come from API
  const [characterData, setCharacterData] = useState<CharacterStats>({
    name: "Jaromme",
    level: 400,
    masterLevel: 50,
    resetCount: 5,
    grandResetCount: 2,
    remainingStatPoints: 150,
    classType: "Dark Lord",
    strength: 2500,
    agility: 1800,
    vitality: 2200,
    energy: 3000,
    command: 100,
    zenAmount: 500000000,
    vipStatus: true,
    isGameMaster: false
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<CharacterStats>(characterData)

  const handleInputChange = (field: keyof CharacterStats, value: string | number | boolean) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    setCharacterData(editedData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedData(characterData)
    setIsEditing(false)
  }

  const handleReset = () => {
    setEditedData(characterData)
  }

  const formatZen = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  const getClassImage = (className: string) => {
    const classMap: { [key: string]: string } = {
      "Dark Knight": "/class/knight.jpg",
      "Dark Wizard": "/class/white_wizard.jpg",
      "Fairy Elf": "/class/elf.jpg",
      "Magic Gladiator": "/class/creator.jpg",
      "Dark Lord": "/class/darklord.jpg",
      "Summoner": "/class/summoner.jpg",
      "Rage Fighter": "/class/illusion.jpg",
      "Grow Lancer": "/class/lem.jpg"
    }
    return classMap[className] || "/class/knight.jpg"
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
              <Button variant="outline" onClick={handleCancel}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Gamepad2 className="mr-2 h-4 w-4" />
              Edit Character
            </Button>
          )}
        </div>
      </div>

      {/* Character Header */}
      <Card className="mb-6">
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
              </div>
              <p className="text-muted-foreground">
                Level {characterData.level} • Master Level {characterData.masterLevel} • {characterData.classType}
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
                  value={isEditing ? editedData.level : characterData.level}
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
                  value={isEditing ? editedData.masterLevel : characterData.masterLevel}
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
                  value={isEditing ? editedData.resetCount : characterData.resetCount}
                  onChange={(e) => handleInputChange('resetCount', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grandResetCount">Grand Reset Count</Label>
                <Input
                  id="grandResetCount"
                  type="number"
                  value={isEditing ? editedData.grandResetCount : characterData.grandResetCount}
                  onChange={(e) => handleInputChange('grandResetCount', parseInt(e.target.value) || 0)}
                  disabled={!isEditing}
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="classType">Class Type</Label>
              <Select
                value={isEditing ? editedData.classType : characterData.classType}
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
                  value={isEditing ? editedData.strength : characterData.strength}
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
                  value={isEditing ? editedData.agility : characterData.agility}
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
                  value={isEditing ? editedData.vitality : characterData.vitality}
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
                  value={isEditing ? editedData.energy : characterData.energy}
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
                value={isEditing ? editedData.command : characterData.command}
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
                value={isEditing ? editedData.remainingStatPoints : characterData.remainingStatPoints}
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
                value={isEditing ? editedData.zenAmount : characterData.zenAmount}
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
                  value={isEditing ? editedData.vipStatus.toString() : characterData.vipStatus.toString()}
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
                  value={isEditing ? editedData.isGameMaster.toString() : characterData.isGameMaster.toString()}
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
    </DashboardLayout>
  )
}

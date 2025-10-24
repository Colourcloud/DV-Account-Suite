"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, PackagePlus } from "lucide-react"
import { ITEMS_DATABASE, ItemData } from "@/lib/items-data"

// Item categories mapping
const ITEM_CATEGORIES = [
  { label: "Swords", value: "0", group: 0 },
  { label: "Axe", value: "1", group: 1 },
  { label: "Mace/Scepters", value: "2", group: 2 },
  { label: "Spears/Lance", value: "3", group: 3 },
  { label: "Bows", value: "4", group: 4 },
  { label: "Staff", value: "5", group: 5 },
  { label: "Shield", value: "6", group: 6 },
  { label: "Helmets", value: "7", group: 7 },
  { label: "Armors", value: "8", group: 8 },
  { label: "Pants", value: "9", group: 9 },
  { label: "Gloves", value: "10", group: 10 },
  { label: "Boots", value: "11", group: 11 },
  { label: "Wings/Capes", value: "12", group: 12 },
  { label: "Misc Items", value: "13", group: 13 },
]

interface ItemCreatorFormProps {
  onItemCreate?: (itemData: { 
    categoryGroup: number
    itemId: number
    itemName: string
    itemLevel: number
    luck: boolean
    durability: number
  }) => void
}

export function ItemCreatorForm({ onItemCreate }: ItemCreatorFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [filteredItems, setFilteredItems] = useState<ItemData[]>([])
  const [itemLevel, setItemLevel] = useState<string>("0")
  const [luck, setLuck] = useState<boolean>(false)
  const [durability, setDurability] = useState<string>("255")

  // Filter items when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredItems([])
      setSelectedItemId("")
      return
    }

    const categoryGroup = parseInt(selectedCategory)
    
    // Filter items by group from ITEMS_DATABASE
    const items = ITEMS_DATABASE.filter(item => item.group === categoryGroup)

    // Sort by item name
    items.sort((a, b) => a.id - b.id)
    
    setFilteredItems(items)
    setSelectedItemId("")
  }, [selectedCategory])

  const handleCreateItem = () => {
    if (!selectedCategory || !selectedItemId) {
      return
    }

    const itemId = parseInt(selectedItemId)
    const item = ITEMS_DATABASE.find(item => item.id === itemId)
    
    if (item && onItemCreate) {
      onItemCreate({
        categoryGroup: parseInt(selectedCategory),
        itemId: itemId,
        itemName: item.name,
        itemLevel: parseInt(itemLevel),
        luck: luck,
        durability: parseInt(durability)
      })
    }
  }

  const selectedItem = selectedItemId 
    ? ITEMS_DATABASE.find(item => item.id === parseInt(selectedItemId)) 
    : null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PackagePlus className="mr-2 h-5 w-5" />
          Item Creator
        </CardTitle>
        <CardDescription>
          Create and add items to character inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Item Category and Name Selection - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Item Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Item Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {ITEM_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Name Selection */}
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={setSelectedItemId}
                disabled={!selectedCategory}
              >
                <SelectTrigger id="item-name" className="w-full">
                  <SelectValue placeholder={
                    selectedCategory 
                      ? "Select item..." 
                      : "Select category first"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Item count indicator */}
          {selectedCategory && filteredItems.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {filteredItems.length} items available
            </p>
          )}

          {/* Item Level and Durability - Side by Side */}
          <div className="grid grid-cols-2 gap-4">
            {/* Item Level Selection */}
            <div className="space-y-2">
              <Label htmlFor="item-level">Item Level</Label>
              <Select value={itemLevel} onValueChange={setItemLevel}>
                <SelectTrigger id="item-level" className="w-full">
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      +{i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Durability Input */}
            <div className="space-y-2">
              <Label htmlFor="durability">Durability</Label>
              <Input
                id="durability"
                type="number"
                min="0"
                max="255"
                value={durability}
                onChange={(e) => {
                  const value = parseInt(e.target.value)
                  if (value >= 0 && value <= 255) {
                    setDurability(e.target.value)
                  } else if (value > 255) {
                    setDurability("255")
                  } else if (e.target.value === "") {
                    setDurability("0")
                  }
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Luck Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="luck"
              checked={luck}
              onChange={(e) => setLuck(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="luck" className="cursor-pointer">
              Luck (success rate of Jewel of Soul +25%, critical damage rate +5%)
            </Label>
          </div>

          {/* Create Button */}
          <Button 
            onClick={handleCreateItem}
            disabled={!selectedCategory || !selectedItemId}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item to Inventory
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, PackagePlus } from "lucide-react"
import { ITEMS_DATABASE, ItemData } from "@/lib/items-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
  { label: "Jewels", value: "14", group: 14 },
]

// Option values and their corresponding strings
const OPTION_VALUES = [1, 3, 7, 15, 31, 63]

const WEAPON_OPTION_STRINGS = [
  "Obtains (Mana/8) when monster is killed",
  "Obtains (Life/8) when monster is killed", 
  "Increase 7 Attack (Wizardy) speed",
  "ATK Dmg increases by 2%",
  "ATK Dmg increases by 1 every 20Lv",
  "Increase Excellent Damage Chance by 10%"
]

const ARMOUR_OPTION_STRINGS = [
  "Increase the amount of Zen acquired for hunting monsters by 30%",
  "Increases Defense Success Rate +10%",
  "Reflect Damage by 5%",
  "Decreases Damage by 4%",
  "Increase Maximum Mana by 4%",
  "Increase Maximum Life by 4%"
]

const WINGS_OPTION_STRINGS = [
  "Add Full Option to your wings"
]

// 5th Wing Options
const WING_5TH_OPTIONS = [
  { value: "254", label: "None" },
  { value: "1", label: "Increases HP Full Recovery Rate by 7%" },
  { value: "2", label: "Increases Enemy DMG Return Rate by 7%" },
  { value: "3", label: "Increases Enemy DEF Ignore Rate by 7%" },
  { value: "4", label: "Increases Attack (Magic) Speed by 12" },
  { value: "5", label: "Increases Excellent DMG Rate by 7%" },
  { value: "6", label: "Increase Double DMG Rate by 7%" },
  { value: "7", label: "Increases Strength by 65" },
  { value: "8", label: "Increases Health by 65" },
  { value: "9", label: "Increases Energy by 65" },
  { value: "10", label: "Increase Agility by 65" }
]

interface ItemCreatorFormProps {
  onItemCreate?: (itemData: { 
    categoryGroup: number
    itemId: number
    itemName: string
    itemLevel: number
    luck: boolean
    skill: boolean
    masterySetItem: boolean
    masteryBonus: string
    durability: number
    option: number
    selectedOptions: boolean[]
    calculatedOptionValue: number
    wing5thOption1: string
    wing5thOption2: string
  }) => void
}

export function ItemCreatorForm({ onItemCreate }: ItemCreatorFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [filteredItems, setFilteredItems] = useState<ItemData[]>([])
  const [itemLevel, setItemLevel] = useState<string>("1")
  const [luck, setLuck] = useState<boolean>(false)
  const [skill, setSkill] = useState<boolean>(false)
  const [masterySetItem, setMasterySetItem] = useState<boolean>(false)
  const [durability, setDurability] = useState<string>("255")
  const [option, setOption] = useState<string>("0")
  const [selectedOptions, setSelectedOptions] = useState<boolean[]>([false, false, false, false, false, false])
  
  // Harmony Options state
  const [harmonyOption1, setHarmonyOption1] = useState<string>("")
  const [harmonyOption1Value, setHarmonyOption1Value] = useState<string>("")
  const [harmonyOption2, setHarmonyOption2] = useState<string>("")
  const [harmonyOption2Value, setHarmonyOption2Value] = useState<string>("")
  const [harmonyOption3, setHarmonyOption3] = useState<string>("")
  const [harmonyOption3Value, setHarmonyOption3Value] = useState<string>("")
  
  // Wing Options state
  const [wing5thOption1, setWing5thOption1] = useState<string>("254")
  const [wing5thOption2, setWing5thOption2] = useState<string>("254")
  
  // Mastery Bonus state
  const [masteryBonus, setMasteryBonus] = useState<string>("0")
  
  // Current tab state
  const [currentTab, setCurrentTab] = useState<string>("weapon")

  // Function to calculate option value based on number of selected options
  const calculateOptionValue = (selectedOptions: boolean[]) => {
    const selectedCount = selectedOptions.filter(selected => selected).length
    
    // Special handling for wings - if any option is selected, always return 63
    if (currentTab === "wings" && selectedCount > 0) {
      return 63
    }
    
    // Map the number of selected options to the correct values for weapon/armour
    const valueMap = {
      0: 0,   // No options selected
      1: 1,   // 1 option selected
      2: 3,   // 2 options selected
      3: 7,   // 3 options selected
      4: 15,  // 4 options selected
      5: 31,  // 5 options selected
      6: 63   // 6 options selected
    }
    
    return valueMap[selectedCount as keyof typeof valueMap] || 0
  }

  // Function to handle option toggle with progressive selection logic
  const handleOptionToggle = (index: number) => {
    const newOptions = [...selectedOptions]
    
    if (newOptions[index]) {
      // If unchecking, uncheck this and all subsequent options
      for (let i = index; i < newOptions.length; i++) {
        newOptions[i] = false
      }
    } else {
      // Special handling for wings - allow direct selection without progressive logic
      if (currentTab === "wings") {
        // For wings, uncheck all other options first, then check the selected one
        for (let i = 0; i < newOptions.length; i++) {
          newOptions[i] = false
        }
        newOptions[index] = true
      } else {
        // For weapon/armour, use progressive selection logic
        let canSelect = true
        for (let i = 0; i < index; i++) {
          if (!newOptions[i]) {
            canSelect = false
            break
          }
        }
        
        if (canSelect) {
          newOptions[index] = true
        }
      }
    }
    
    setSelectedOptions(newOptions)
  }

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
      // Calculate the option value from selected options
      const calculatedOptionValue = calculateOptionValue(selectedOptions)
      
      const itemData = {
        categoryGroup: parseInt(selectedCategory),
        itemId: itemId,
        itemName: item.name,
        itemLevel: parseInt(itemLevel),
        luck: luck,
        skill: skill,
        masterySetItem: masterySetItem,
        masteryBonus: masteryBonus,
        durability: parseInt(durability),
        option: parseInt(option),
        selectedOptions: selectedOptions,
        calculatedOptionValue: calculatedOptionValue,
        wing5thOption1: wing5thOption1,
        wing5thOption2: wing5thOption2
      }
      
      // Generate the item code string
      const itemCode = `{${itemData.categoryGroup};${itemData.itemId};0;${itemData.itemLevel};0;${itemData.option};${itemData.durability};0;${itemData.skill ? 1 : 0};${itemData.luck ? 1 : 0};7;${calculatedOptionValue};${itemData.masterySetItem ? 9 : 0};0;0;65535;65535;65535;65535;65535;${itemData.masterySetItem ? masteryBonus : 0};0;0;0;0;0;0;0;0;0;255;255;255;255;255;255;0;0;${wing5thOption1};${wing5thOption2};254;254}`
      
      onItemCreate(itemData)
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

          {/* Option Selection */}
          <div className="space-y-2">
            <Label htmlFor="option">Item Option</Label>
            <Select value={option} onValueChange={setOption}>
              <SelectTrigger id="option" className="w-full">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i === 0 ? "No Option" : `+${i * 4}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Skill Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="skill"
              checked={skill}
              onChange={(e) => setSkill(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="skill" className="cursor-pointer">
              Skill
            </Label>
          </div>

          {/* Mastery Set Item Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="masterySetItem"
              checked={masterySetItem}
              onChange={(e) => setMasterySetItem(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
            />
            <Label htmlFor="masterySetItem" className="cursor-pointer">
              Mastery Set Item
            </Label>
          </div>

          {/* Mastery Bonus Dropdown - Only show when Mastery Set Item is checked */}
          {masterySetItem && (
            <div className="space-y-2">
              <Label htmlFor="mastery-bonus">Mastery Bonus</Label>
              <Select value={masteryBonus} onValueChange={setMasteryBonus}>
                <SelectTrigger id="mastery-bonus" className="w-full">
                  <SelectValue placeholder="Select mastery bonus..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1: +7 Stats, 25 Damage Decrease</SelectItem>
                  <SelectItem value="2">2: +7 Stats, 50 Damage Decrease</SelectItem>
                  <SelectItem value="3">3: +15 Stats, 75 Damage Decrease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Options Tabs */}
          <div className="space-y-4 border-t py-2 mt-6">
            <Label className="text-base font-medium">Additional Options</Label>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="weapon">Weapon</TabsTrigger>
                <TabsTrigger value="armour">Armour</TabsTrigger>
                <TabsTrigger value="wings">Wings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weapon" className="space-y-3">
                <div className="space-y-3">
                  {WEAPON_OPTION_STRINGS.map((optionString, index) => {
                    // Check if this option can be selected (all previous options must be selected)
                    const canSelect = index === 0 || selectedOptions.slice(0, index).every(selected => selected)
                    const isDisabled = !canSelect && !selectedOptions[index]
                    
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`option-${index}`}
                          checked={selectedOptions[index]}
                          onChange={() => handleOptionToggle(index)}
                          disabled={isDisabled}
                          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className={`text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {optionString}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="armour" className="space-y-3">
                <div className="space-y-3">
                  {ARMOUR_OPTION_STRINGS.map((optionString, index) => {
                    // Check if this option can be selected (all previous options must be selected)
                    const canSelect = index === 0 || selectedOptions.slice(0, index).every(selected => selected)
                    const isDisabled = !canSelect && !selectedOptions[index]
                    
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`option-${index}`}
                          checked={selectedOptions[index]}
                          onChange={() => handleOptionToggle(index)}
                          disabled={isDisabled}
                          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className={`text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {optionString}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="wings" className="space-y-3">
                <div className="space-y-3">
                  {WINGS_OPTION_STRINGS.map((optionString, index) => {
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`option-${index}`}
                          checked={selectedOptions[index]}
                          onChange={() => handleOptionToggle(index)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                        <Label 
                          htmlFor={`option-${index}`} 
                          className="text-sm cursor-pointer"
                        >
                          {optionString}
                        </Label>
                      </div>
                    )
                  })}
                  
                  {/* 5th Wing Options */}
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="wing-5th-option-1">5th Wing Option 1</Label>
                        <Select value={wing5thOption1} onValueChange={setWing5thOption1}>
                          <SelectTrigger id="wing-5th-option-1" className="w-full">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WING_5TH_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="wing-5th-option-2">5th Wing Option 2</Label>
                        <Select value={wing5thOption2} onValueChange={setWing5thOption2}>
                          <SelectTrigger id="wing-5th-option-2" className="w-full">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WING_5TH_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Harmony Options Section */}
          <div className="mt-8 border-t py-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="harmony-options">
                <AccordionTrigger className="text-base font-medium text-purple-400">
                  Harmony Options
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {/* Harmony Option 1 Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-1">Harmony Option 1</Label>
                        <Select value={harmonyOption1} onValueChange={setHarmonyOption1}>
                          <SelectTrigger id="harmony-option-1" className="w-full">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                            <SelectItem value="option3">Option 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-1-value">Harmony Option 1 Value</Label>
                        <Select value={harmonyOption1Value} onValueChange={setHarmonyOption1Value}>
                          <SelectTrigger id="harmony-option-1-value" className="w-full">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Harmony Option 2 Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-2">Harmony Option 2</Label>
                        <Select value={harmonyOption2} onValueChange={setHarmonyOption2}>
                          <SelectTrigger id="harmony-option-2" className="w-full">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                            <SelectItem value="option3">Option 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-2-value">Harmony Option 2 Value</Label>
                        <Select value={harmonyOption2Value} onValueChange={setHarmonyOption2Value}>
                          <SelectTrigger id="harmony-option-2-value" className="w-full">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Harmony Option 3 Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-3">Harmony Option 3</Label>
                        <Select value={harmonyOption3} onValueChange={setHarmonyOption3}>
                          <SelectTrigger id="harmony-option-3" className="w-full">
                            <SelectValue placeholder="Select option..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="option1">Option 1</SelectItem>
                            <SelectItem value="option2">Option 2</SelectItem>
                            <SelectItem value="option3">Option 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="harmony-option-3-value">Harmony Option 3 Value</Label>
                        <Select value={harmonyOption3Value} onValueChange={setHarmonyOption3Value}>
                          <SelectTrigger id="harmony-option-3-value" className="w-full">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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


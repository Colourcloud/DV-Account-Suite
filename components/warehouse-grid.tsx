"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Package, Plus, Trash2, RefreshCw, MoreHorizontal } from "lucide-react"
import { getItemById, ItemData, getItemImagePathById } from "@/lib/items-data"
import { decodeWarehouseData, positionToGridCoords, WarehouseItemData, convertWarehouseItemsToGrid, decodeExcellentOptions, getItemTypeFromId, encodeWarehouseData, canPlaceItem, placeItemInGrid, gridCoordsToPosition, decodeWing5thOptions } from "@/lib/warehouse-utils"

interface WarehouseItem {
  id: number
  group: number
  index: number
  slot: number
  skill: number
  width: number
  height: number
  serial: number
  option: number
  drop: number
  name: string
  level: number
  dmgMin: number
  dmgMax: number
  attackSpeed: number
  durability: number
  magicDurability: number
  magicPower: number
  reqLevel: number
  reqStrength: number
  reqDexterity: number
  reqEnergy: number
  reqVitality: number
  reqCommand: number
  setType: number
  classes: number[]
  luck: number
  excellentOption: number
  ancientOption: number
  masteryBonus?: string
  wing5thOption1?: string
  wing5thOption2?: string
  socket1?: string
  socket2?: string
  socket3?: string
  socket4?: string
  socket5?: string
  position?: { x: number; y: number }
  quantity?: number
}

interface PendingItem {
  id: number
  name: string
  width: number
  height: number
  level: number
  durability: number
  luck: boolean
  skill: boolean
  masterySetItem: boolean
  masteryBonus: string
  option: number
  excellentOption: number
  ancientOption: number
  wing5thOption1?: string
  wing5thOption2?: string
  socket1?: string
  socket2?: string
  socket3?: string
  socket4?: string
  socket5?: string
}

interface WarehouseGridProps {
  accountId: number
  characterName: string
  warehouseData?: string // Base64 encoded warehouse data from database
  onWarehouseUpdate?: (newWarehouseData: string) => void
  onItemPlacementReady?: (startPlacement: (item: PendingItem) => void) => void
}

const WAREHOUSE_WIDTH = 8
const WAREHOUSE_HEIGHT = 15
const TOTAL_SLOTS = WAREHOUSE_WIDTH * WAREHOUSE_HEIGHT

export function WarehouseGrid({ accountId, characterName, warehouseData, onWarehouseUpdate, onItemPlacementReady }: WarehouseGridProps) {
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([])
  const [grid, setGrid] = useState<(WarehouseItem | null)[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null)
  const [isPlacingItem, setIsPlacingItem] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const [debugInfo, setDebugInfo] = useState<{
    inventoryData: WarehouseItemData[]
    newItemCode: string
    encodedData: string
  } | null>(null)

  // Initialize empty grid
  useEffect(() => {
    const emptyGrid: (WarehouseItem | null)[][] = []
    for (let y = 0; y < WAREHOUSE_HEIGHT; y++) {
      emptyGrid[y] = new Array(WAREHOUSE_WIDTH).fill(null)
    }
    setGrid(emptyGrid)
  }, [])

  // Load warehouse items
  useEffect(() => {
    const loadWarehouseItems = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let items: WarehouseItem[] = []
        
        if (warehouseData) {
          console.log('Warehouse data received:', warehouseData)
          // Decode the warehouse data
          const decodedItems = decodeWarehouseData(warehouseData)
          console.log('Decoded items:', decodedItems)
          
          // DEBUG: Print decoded data for all existing items
          console.log('=== DEBUG: Loading Existing Warehouse Items ===')
          console.log('Total existing items:', decodedItems.length)
          decodedItems.forEach((item, index) => {
            console.log(`Existing Item ${index + 1}:`, {
              position: item.position,
              itemId: item.itemId,
              level: item.level,
              durability: item.durability,
              skill: item.skill,
              luck: item.luck,
              option: item.option,
              excellentOption: item.excellentOption,
              ancientOption: item.ancientOption,
              serial: item.serial,
              serial2: item.serial2
            })
          })
          
          // Create item codes for all existing items
          const existingItemCodes = decodedItems.map(item => {
            const values = new Array(43).fill(0)
            values[0] = item.position
            values[1] = item.itemId
            values[2] = 0
            values[3] = item.serial
            values[4] = 0
            values[5] = item.level
            values[6] = item.durability
            values[7] = 0
            values[8] = item.skill
            values[9] = item.luck
            values[10] = item.option
            values[11] = item.excellentOption
            values[12] = item.ancientOption
            values[13] = 0
            // Add padding
            values[15] = 0
            values[16] = 65535
            values[17] = 65535
            values[18] = 65535
            values[19] = 65535
            values[20] = 0
            values[21] = 0
            values[22] = 0
            values[23] = 0
            values[24] = 0
            values[25] = 0
            values[26] = 0
            values[27] = 0
            values[28] = 0
            values[29] = 0
            values[30] = 0
            values[31] = 255
            values[32] = 255
            values[33] = 255
            values[34] = 255
            values[35] = 255
            values[36] = 255
            values[37] = 0
            values[38] = 0
            values[39] = 254
            values[40] = 254
            values[41] = 254
            values[42] = 254
            
            return `{${values.join(';')}}`
          })
          
          console.log('=== DEBUG: Existing Item Codes ===')
          existingItemCodes.forEach((code, index) => {
            console.log(`Existing Item ${index + 1} Code:`, code)
          })
          
          // Store debug info for existing items
          setDebugInfo({
            inventoryData: decodedItems,
            newItemCode: '',
            encodedData: warehouseData
          })
          
          // Convert decoded items to WarehouseItem format
          const convertedItems = convertWarehouseItemsToGrid(decodedItems)
          console.log('Converted items:', convertedItems)
          
          // Enhance with item data from the items database
          items = convertedItems.map(item => {
            const itemData = getItemById(item.id)
            console.log('Item ID:', item.id, 'Item data found:', !!itemData, itemData?.name)
            
            return {
              ...item,
              group: itemData?.group || item.group,
              index: itemData?.index || item.index,
              slot: itemData?.slot || item.slot,
              skill: itemData?.skill || item.skill,
              width: itemData?.width || item.width,
              height: itemData?.height || item.height,
              drop: itemData?.drop || item.drop,
              name: itemData?.name || item.name,
              dmgMin: itemData?.dmgMin || item.dmgMin,
              dmgMax: itemData?.dmgMax || item.dmgMax,
              attackSpeed: itemData?.attackSpeed || item.attackSpeed,
              magicDurability: itemData?.magicDurability || item.magicDurability,
              magicPower: itemData?.magicPower || item.magicPower,
              reqLevel: itemData?.reqLevel || item.reqLevel,
              reqStrength: itemData?.reqStrength || item.reqStrength,
              reqDexterity: itemData?.reqDexterity || item.reqDexterity,
              reqEnergy: itemData?.reqEnergy || item.reqEnergy,
              reqVitality: itemData?.reqVitality || item.reqVitality,
              reqCommand: itemData?.reqCommand || item.reqCommand,
              setType: itemData?.setType || item.setType,
              classes: itemData?.classes || item.classes,
              luck: item.luck,
              excellentOption: item.excellentOption,
              masteryBonus: item.masteryBonus
            }
          })
          console.log('Final items:', items)
        } else {
          // Fallback to empty warehouse if no data provided
          items = []
        }
        
        console.log('Setting warehouse items:', items)
        setWarehouseItems(items)
        console.log('Placing items in grid...')
        placeItemsInGrid(items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load warehouse items')
      } finally {
        setIsLoading(false)
      }
    }

    loadWarehouseItems()
  }, [accountId, warehouseData])

  const placeItemsInGrid = (items: WarehouseItem[]) => {
    console.log('placeItemsInGrid called with items:', items)
    const newGrid: (WarehouseItem | null)[][] = []
    for (let y = 0; y < WAREHOUSE_HEIGHT; y++) {
      newGrid[y] = new Array(WAREHOUSE_WIDTH).fill(null)
    }

    items.forEach((item, index) => {
      console.log(`Placing item ${index}:`, item)
      if (item.position) {
        const { x, y } = item.position
        console.log(`Item position: x=${x}, y=${y}, size=${item.width}x${item.height}`)
        for (let dy = 0; dy < item.height; dy++) {
          for (let dx = 0; dx < item.width; dx++) {
            if (y + dy < WAREHOUSE_HEIGHT && x + dx < WAREHOUSE_WIDTH) {
              newGrid[y + dy][x + dx] = item
              console.log(`Placed at grid[${y + dy}][${x + dx}]`)
            }
          }
        }
      } else {
        console.log('Item has no position!')
      }
    })

    console.log('Final grid state:')
    for (let y = 0; y < 3; y++) {
      let row = ''
      for (let x = 0; x < 3; x++) {
        row += newGrid[y][x] ? 'X' : '.'
      }
      console.log(`Row ${y}: ${row}`)
    }

    setGrid(newGrid)
  }

  const getItemColor = (item: WarehouseItem) => {
    // Color coding based on item level or rarity
    if (item.level >= 100) return "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200"
    if (item.level >= 50) return "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200"
    if (item.level >= 20) return "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200"
    return "bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200"
  }

  const getCellContent = (x: number, y: number) => {
    const item = grid[y]?.[x]
    if (!item) return null

    const isTopLeft = item.position && item.position.x === x && item.position.y === y

    return (
      <HoverCard key={`${x}-${y}`} openDelay={200} closeDelay={200}>
        <HoverCardTrigger asChild>
          <div className="w-full h-full">
            {isTopLeft && (
              <div 
                className={`
                  w-full h-full border border-gray-800 p-0.5 bg-[nd#010020]
                  flex flex-col items-center justify-center cursor-pointer
                  hover:shadow-md transition-shadow relative
                `}
                onContextMenu={(e) => handleItemRightClick(e, item)}
              >
                <img 
                  src={getItemImagePathById(item.id)} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
                <div className="font-semibold truncate w-full text-center leading-tight text-[10px] hidden flex-col items-center justify-center">
                  {item.name}
                  {item.quantity && item.quantity > 1 && (
                    <div className="text-[8px] font-bold">
                      {item.quantity}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 bg-black/60">
          <div className="space-y-3">
            {/* Item Image */}
            <div className="flex justify-center text-center">
              <img 
                src={getItemImagePathById(item.id)} 
                alt={item.name}
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
            
            {/* Item Name + Level */}
            <div className="text-center text-green-400">
              <div className="font-semibold text-sm flex flex-row items-center gap-1 justify-center">
                {item.excellentOption > 0 ? (
                  <>
                    <span>Excellent</span> {item.name}
                  </>
                ) : (
                  item.name
                )} 
                <span>+{item.level}</span>
              </div>
            </div>
            
            {/* Durability */}
            <div className="text-sm text-center">
              <span className="font-medium">Durability:</span> [{item.durability}/{getItemById(item.id)?.durability || item.durability}]
              {/* Required Stats */}
              <div className="">
                {item.reqLevel > 0 && (
                  <div className="text-sm text-center">
                    <span className="font-medium">Required Level:</span> {item.reqLevel}
                  </div>
                )}
                {item.reqStrength > 0 && (
                  <div className="text-sm text-center">
                    <span className="font-medium">Required Strength:</span> {item.reqStrength}
                  </div>
                )}
              </div>
              {item.attackSpeed > 0 && (
              <div className="text-sm text-center">
                <span className="font-medium">Attack Speed:</span> {item.attackSpeed}
              </div>
            )}
            </div>


            {/* Luck Information - only show if luck = 1 */}
            {item.luck === 1 && (
              <div className="text-center">
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <span className="font-light">Luck (success rate of Jewel of Soul +25%)</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <span className="font-light">Luck (critical damage rate +5%)</span>
                </div>
                {item.option > 0 && (
                  <div className="text-sm text-center">
                    <span className="font-light text-blue-400">
                      {item.dmgMin > 0 ? 'Additional Dmg' : 'Additional Def'}: +{item.option * 4}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Excellent Options - only show if item has excellent options */}
            {item.excellentOption > 0 && (
              <div className="">
                <div className="text-sm font-medium text-center text-purple-400">
                  Excellent Options:
                </div>
                {decodeExcellentOptions(item.excellentOption, getItemTypeFromId(item.id)).reverse().map((option, index) => (
                  <div key={index} className="text-sm text-blue-400 text-center font-light">
                    {option}
                  </div>
                ))}
              </div>
            )}

            {/* Wing 5th Options - only show if item has wing options */}
            {decodeWing5thOptions(item.wing5thOption1, item.wing5thOption2).length > 0 && (
              <div className="">
                <div className="text-sm font-medium text-center text-orange-400">
                  Wing 5th Options:
                </div>
                {decodeWing5thOptions(item.wing5thOption1, item.wing5thOption2).map((option, index) => (
                  <div key={index} className="text-sm text-yellow-400 text-center font-light">
                    {option}
                  </div>
                ))}
              </div>
            )}

            {/* Mastery Bonus Option - only show if mastery bonus > 0
            {item.masteryBonus && parseInt(item.masteryBonus) > 0 && (
              <div className="">
                <div className="text-sm font-medium text-center text-purple-400">
                  Mastery Bonus Option:
                </div>
                {parseInt(item.masteryBonus) === 3 && (
                  <div className="text-sm text-purple-300 text-center font-light">
                    <div>Increase all stats by +15</div>
                    <div>Damage Decrease 75</div>
                  </div>
                )}
                {parseInt(item.masteryBonus) === 2 && (
                  <div className="text-sm text-purple-300 text-center font-light">
                    <div>Increase all stats by +7</div>
                    <div>Damage Decrease 50</div>
                  </div>
                )}
                {parseInt(item.masteryBonus) === 1 && (
                  <div className="text-sm text-purple-300 text-center font-light">
                    <div>Increase all stats by +7</div>
                    <div>Damage Decrease 25</div>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </HoverCardContent>
      </HoverCard>
    )
  }

  const getUsedSlots = () => {
    return warehouseItems.reduce((total, item) => total + (item.width * item.height), 0)
  }

  const getAvailableSlots = () => {
    return TOTAL_SLOTS - getUsedSlots()
  }

  // Function to start placing an item
  const startItemPlacement = useCallback((item: PendingItem) => {
    setPendingItem(item)
    setIsPlacingItem(true)
  }, [])

  // Function to handle grid cell clicks
  const handleGridClick = async (x: number, y: number) => {
    if (!isPlacingItem || !pendingItem) return

    // Check if the item can fit at this position
    if (canPlaceItem(grid, x, y, pendingItem.width, pendingItem.height)) {
      try {
        // Generate a simple serial number (timestamp-based for uniqueness)
        const serial = Date.now() + Math.floor(Math.random() * 1000)

        // Create the new warehouse item
        const newWarehouseItem: WarehouseItem = {
          id: pendingItem.id,
          group: Math.floor(pendingItem.id / 512),
          index: pendingItem.id % 512,
          slot: 0,
          skill: pendingItem.skill ? 1 : 0,
          width: pendingItem.width,
          height: pendingItem.height,
          serial: 0,
          option: pendingItem.option,
          drop: 1,
          name: pendingItem.name,
          level: pendingItem.level,
          dmgMin: 0,
          dmgMax: 0,
          attackSpeed: 0,
          durability: pendingItem.durability,
          magicDurability: 0,
          magicPower: 0,
          reqLevel: 0,
          reqStrength: 0,
          reqDexterity: 0,
          reqEnergy: 0,
          reqVitality: 0,
          reqCommand: 0,
          setType: 0,
          classes: [1, 1, 1, 1, 1, 1, 1],
          luck: pendingItem.luck ? 1 : 0,
          excellentOption: pendingItem.excellentOption,
          ancientOption: pendingItem.ancientOption,
          masteryBonus: pendingItem.masteryBonus,
          wing5thOption1: pendingItem.wing5thOption1,
          wing5thOption2: pendingItem.wing5thOption2,
          socket1: pendingItem.socket1,
          socket2: pendingItem.socket2,
          socket3: pendingItem.socket3,
          socket4: pendingItem.socket4,
          socket5: pendingItem.socket5,
          position: { x, y }
        }

        // Update the grid
        const newGrid = placeItemInGrid(grid, x, y, newWarehouseItem)
        setGrid(newGrid)

        // Add to warehouse items
        const newWarehouseItems = [...warehouseItems, newWarehouseItem]
        setWarehouseItems(newWarehouseItems)

      // Convert to warehouse data format and encode
      const warehouseDataItems: WarehouseItemData[] = newWarehouseItems.map((item, index) => {
        const isNewItem = index === newWarehouseItems.length - 1
        return {
          position: gridCoordsToPosition(item.position!.x, item.position!.y),
          itemId: item.id,
          level: item.level,
          durability: item.durability,
          skill: item.skill,
          luck: item.luck,
          option: item.option,
          excellentOption: item.excellentOption,
          ancientOption: isNewItem ? pendingItem.ancientOption : (item.ancientOption || 0),
          serial: 0, // Set to 0 as requested
          serial2: 0,
          masteryBonus: isNewItem ? pendingItem.masteryBonus : (item.masteryBonus || "0"),
          wing5thOption1: isNewItem ? pendingItem.wing5thOption1 : (item.wing5thOption1 || "254"),
          wing5thOption2: isNewItem ? pendingItem.wing5thOption2 : (item.wing5thOption2 || "254"),
          socket1: isNewItem ? (pendingItem.socket1 || "65535") : (item.socket1 || "65535"),
          socket2: isNewItem ? (pendingItem.socket2 || "65535") : (item.socket2 || "65535"),
          socket3: isNewItem ? (pendingItem.socket3 || "65535") : (item.socket3 || "65535"),
          socket4: isNewItem ? (pendingItem.socket4 || "65535") : (item.socket4 || "65535"),
          socket5: isNewItem ? (pendingItem.socket5 || "65535") : (item.socket5 || "65535")
        }
      })

      const encodedData = encodeWarehouseData(warehouseDataItems)
      
      // DEBUG: Print the entire decoded inventory data
      console.log('=== DEBUG: Full Decoded Inventory Data ===')
      console.log('Total items:', warehouseDataItems.length)
      warehouseDataItems.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          position: item.position,
          itemId: item.itemId,
          level: item.level,
          durability: item.durability,
          skill: item.skill,
          luck: item.luck,
          option: item.option,
          excellentOption: item.excellentOption,
          ancientOption: item.ancientOption,
          serial: item.serial,
          serial2: item.serial2
        })
      })
      
      // DEBUG: Print the newly created item code
      const newItemCode = `{${[
        gridCoordsToPosition(x, y),  // position
        pendingItem.id,              // itemId
        0,                           // unknown
        0,                           // serial
        0,                           // unknown
        pendingItem.level,           // level
        pendingItem.durability,      // durability
        0,                           // unknown
        pendingItem.skill ? 1 : 0,   // skill
        pendingItem.luck ? 1 : 0,    // luck
        pendingItem.option,          // option
        pendingItem.excellentOption, // excellentOption
        pendingItem.ancientOption,   // ancientOption (masterySetItem)
        0,                           // unknown
        0,                           // unknown
        65535, 65535, 65535, 65535, 65535, pendingItem.masterySetItem ? (parseInt(pendingItem.masteryBonus) || 0) : 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255, 255, 255, 0, 0, pendingItem.wing5thOption1 || '254', pendingItem.wing5thOption2 || '254', 254, 254, 254 // wing options + padding (43 total)
      ].join(';')}},`
      
      console.log('=== DEBUG: Newly Created Item Code ===')
      console.log('New item code:', newItemCode)
      console.log('Encoded warehouse data:', encodedData.substring(0, 200) + '...')
      
      // Store debug info for UI display
      setDebugInfo({
        inventoryData: warehouseDataItems,
        newItemCode: newItemCode,
        encodedData: encodedData
      })
        
        // Notify parent component of the update
        if (onWarehouseUpdate) {
          onWarehouseUpdate(encodedData)
        }

        // Force push to database immediately
        try {
          const response = await fetch(`/api/characters/${characterName}/warehouse`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ warehouseData: encodedData }),
          })

          if (response.ok) {
            console.log('Warehouse data saved to database successfully')
          } else {
            console.error('Failed to save warehouse data to database')
          }
        } catch (error) {
          console.error('Error saving warehouse data:', error)
        }

        // Reset placement state
        setPendingItem(null)
        setIsPlacingItem(false)
      } catch (error) {
        console.error('Error placing item:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  // Function to cancel item placement
  const cancelItemPlacement = () => {
    setPendingItem(null)
    setIsPlacingItem(false)
  }

  // Function to handle right-click on item
  const handleItemRightClick = (e: React.MouseEvent, item: WarehouseItem) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedItem(item)
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuOpen(true)
  }

  // Function to delete an item
  const handleDeleteItem = async () => {
    if (!selectedItem) return

    try {
      console.log('Deleting item:', selectedItem)
      console.log('Current warehouse items count:', warehouseItems.length)
      
      // Remove item from warehouse items using multiple criteria to ensure we get the right item
      const updatedItems = warehouseItems.filter(item => {
        // Use position and item ID to uniquely identify the item
        const isMatch = (
          item.position && 
          selectedItem.position &&
          item.position.x === selectedItem.position.x &&
          item.position.y === selectedItem.position.y &&
          item.id === selectedItem.id &&
          item.level === selectedItem.level
        )
        console.log('Item match check:', {
          item: { id: item.id, position: item.position, level: item.level },
          selected: { id: selectedItem.id, position: selectedItem.position, level: selectedItem.level },
          isMatch
        })
        return !isMatch
      })
      
      console.log('Updated items count:', updatedItems.length)
      setWarehouseItems(updatedItems)

      // Update the grid
      const newGrid: (WarehouseItem | null)[][] = []
      for (let y = 0; y < WAREHOUSE_HEIGHT; y++) {
        newGrid[y] = new Array(WAREHOUSE_WIDTH).fill(null)
      }

      // Place remaining items in grid
      updatedItems.forEach(item => {
        if (item.position) {
          const { x, y } = item.position
          for (let dy = 0; dy < item.height; dy++) {
            for (let dx = 0; dx < item.width; dx++) {
              if (y + dy < WAREHOUSE_HEIGHT && x + dx < WAREHOUSE_WIDTH) {
                newGrid[y + dy][x + dx] = item
              }
            }
          }
        }
      })

      setGrid(newGrid)

      // Convert to warehouse data format and encode
      const warehouseDataItems: WarehouseItemData[] = updatedItems.map(item => ({
        position: gridCoordsToPosition(item.position!.x, item.position!.y),
        itemId: item.id,
        level: item.level,
        durability: item.durability,
        skill: item.skill,
        luck: item.luck,
        option: item.option,
        excellentOption: item.excellentOption,
        ancientOption: item.ancientOption || 0,
        serial: 0,
        serial2: 0,
        masteryBonus: item.masteryBonus || "0",
        wing5thOption1: item.wing5thOption1 || "254",
        wing5thOption2: item.wing5thOption2 || "254"
      }))

      const encodedData = encodeWarehouseData(warehouseDataItems)
      console.log('Encoded warehouse data after deletion:', encodedData.substring(0, 100))
      
      // Notify parent component of the update
      if (onWarehouseUpdate) {
        onWarehouseUpdate(encodedData)
      }

      // Update database
      try {
        console.log('Sending warehouse update to database...')
        const response = await fetch(`/api/characters/${characterName}/warehouse`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ warehouseData: encodedData }),
        })

        if (response.ok) {
          console.log('Warehouse data updated after deletion successfully')
        } else {
          console.error('Failed to update warehouse data after deletion:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error updating warehouse data:', error)
      }

      // Close context menu and reset state
      setContextMenuOpen(false)
      setSelectedItem(null)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Expose the startItemPlacement function to parent component
  useEffect(() => {
    if (onItemPlacementReady) {
      onItemPlacementReady(startItemPlacement)
    }
  }, [onItemPlacementReady, startItemPlacement])

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuOpen(false)
    }

    if (contextMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenuOpen])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Warehouse
          </CardTitle>
          <CardDescription>
            Loading warehouse items...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Warehouse
          </CardTitle>
          <CardDescription>
            Error loading warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Warehouse
            </CardTitle>
            <CardDescription>
              {characterName}'s storage ({getUsedSlots()}/{TOTAL_SLOTS} slots used)
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {isPlacingItem && pendingItem ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-400">
                  Placing: {pendingItem.name} ({pendingItem.width}x{pendingItem.height})
                </span>
                <Button variant="outline" size="sm" onClick={cancelItemPlacement}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Warehouse Grid - Fixed 8x15 Layout */}
        <div className="border border-gray-800 dark:border-gray-800 rounded-md p-2 bg-black dark:bg-black mx-auto max-w-fit">
          <div 
            className="grid gap-0.5"
            style={{
              gridTemplateColumns: `repeat(${WAREHOUSE_WIDTH}, 40px)`,
              gridTemplateRows: `repeat(${WAREHOUSE_HEIGHT}, 40px)`
            }}
          >
            {Array.from({ length: WAREHOUSE_HEIGHT }, (_, y) =>
              Array.from({ length: WAREHOUSE_WIDTH }, (_, x) => {
                const item = grid[y]?.[x]
                const isTopLeft = item && item.position && item.position.x === x && item.position.y === y

                // Skip rendering cells covered by an item that are not the top-left anchor
                if (item && !isTopLeft) {
                  return null
                }

                const style: React.CSSProperties = {
                  gridColumnStart: x + 1,
                  gridRowStart: y + 1,
                }

                if (isTopLeft && item) {
                  style.gridColumnEnd = `span ${item.width}`
                  style.gridRowEnd = `span ${item.height}`
                }

                // Check if this cell is part of a valid placement area for pending item
                const isValidPlacement = isPlacingItem && pendingItem && 
                  canPlaceItem(grid, x, y, pendingItem.width, pendingItem.height)
                
                const isPlacementPreview = isPlacingItem && pendingItem && 
                  x >= 0 && y >= 0 && x < WAREHOUSE_WIDTH && y < WAREHOUSE_HEIGHT &&
                  x < pendingItem.width && y < pendingItem.height

                return (
                  <div
                    key={`${x}-${y}`}
                    className={`border border-[#242424] ${
                      isTopLeft && item ? 'w-full h-full' : 'w-10 h-10'
                    } flex items-center justify-center cursor-pointer ${
                      item ? 'bg-black dark:bg-black' : 
                      isValidPlacement ? 'bg-green-900/30 hover:bg-green-800/50' :
                      isPlacementPreview ? 'bg-blue-900/30' :
                      'bg-[#0f0f0f] hover:bg-gray-800'
                    }`}
                    style={style}
                    onClick={() => handleGridClick(x, y)}
                  >
                    {item ? getCellContent(x, y) : null}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Warehouse Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Used: {getUsedSlots()} slots</span>
            <span>Available: {getAvailableSlots()} slots</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {warehouseItems.length} items
            </Badge>
          </div>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border">
            <h4 className="text-sm font-semibold text-green-400 mb-2">🐛 Debug Information</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-blue-400 font-medium">Total Items:</span> {debugInfo.inventoryData.length}
              </div>
              
              <div>
                <span className="text-blue-400 font-medium">New Item Code:</span>
                <div className="mt-1 p-2 bg-black rounded font-mono text-green-300 break-all">
                  {debugInfo.newItemCode}
                </div>
              </div>
              
              <div>
                <span className="text-blue-400 font-medium">Encoded Data (first 200 chars):</span>
                <div className="mt-1 p-2 bg-black rounded font-mono text-yellow-300 break-all">
                  {debugInfo.encodedData.substring(0, 200)}...
                </div>
              </div>
              
              <div>
                <span className="text-blue-400 font-medium">All Items Data:</span>
                <div className="mt-1 max-h-32 overflow-y-auto">
                  {debugInfo.inventoryData.map((item, index) => (
                    <div key={index} className="p-1 bg-gray-800 rounded mb-1 text-xs">
                      <span className="text-purple-400">Item {index + 1}:</span> 
                      <span className="text-white ml-2">
                        ID:{item.itemId} Pos:{item.position} Lvl:{item.level} Dur:{item.durability} 
                        Skill:{item.skill} Luck:{item.luck} Opt:{item.option}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Context Menu */}
      {contextMenuOpen && selectedItem && (
        <div 
          className="fixed z-50 bg-background border rounded-md shadow-lg p-1 min-w-[160px]"
          style={{
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
          }}
          onMouseLeave={() => setContextMenuOpen(false)}
        >
          <div 
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Item
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Item</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setContextMenuOpen(false)
                  setSelectedItem(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteItem}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
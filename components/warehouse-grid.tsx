"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Package, Plus, Trash2, RefreshCw } from "lucide-react"
import { getItemById, ItemData, getItemImagePathById } from "@/lib/items-data"
import { decodeWarehouseData, positionToGridCoords, WarehouseItemData, convertWarehouseItemsToGrid, decodeExcellentOptions, getItemTypeFromId, encodeWarehouseData, canPlaceItem, placeItemInGrid, gridCoordsToPosition } from "@/lib/warehouse-utils"

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
              excellentOption: item.excellentOption
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
              <div className={`
                w-full h-full border border-gray-800 p-0.5 bg-[nd#010020]
                flex flex-col items-center justify-center cursor-pointer
                hover:shadow-md transition-shadow relative
              `}>
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
        // Get the next serial number from the database
        const response = await fetch('/api/characters/serial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to get serial number')
        }
        
        const { serial } = await response.json()
        console.log('Got serial number:', serial)

        // Create the new warehouse item
        const newWarehouseItem: WarehouseItem = {
          id: pendingItem.id,
          group: Math.floor(pendingItem.id / 512),
          index: pendingItem.id % 512,
          slot: 0,
          skill: 0,
          width: pendingItem.width,
          height: pendingItem.height,
          serial: serial,
          option: 0,
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
          excellentOption: 0,
          position: { x, y }
        }

        // Update the grid
        const newGrid = placeItemInGrid(grid, x, y, newWarehouseItem)
        setGrid(newGrid)

        // Add to warehouse items
        const newWarehouseItems = [...warehouseItems, newWarehouseItem]
        setWarehouseItems(newWarehouseItems)

      // Convert to warehouse data format and encode
      const warehouseDataItems: WarehouseItemData[] = newWarehouseItems.map(item => ({
        position: gridCoordsToPosition(item.position!.x, item.position!.y),
        itemId: item.id,
        level: item.level,
        durability: item.durability,
        skill: item.skill,
        luck: item.luck,
        option: item.option,
        excellentOption: item.excellentOption,
        ancientOption: 0,
        serial: 0, // Set to 0 as requested
        serial2: 0
      }))

      const encodedData = encodeWarehouseData(warehouseDataItems)
        
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
        console.error('Error getting serial number:', error)
        // You might want to show an error message to the user here
      }
    }
  }

  // Function to cancel item placement
  const cancelItemPlacement = () => {
    setPendingItem(null)
    setIsPlacingItem(false)
  }

  // Expose the startItemPlacement function to parent component
  useEffect(() => {
    if (onItemPlacementReady) {
      onItemPlacementReady(startItemPlacement)
    }
  }, [onItemPlacementReady, startItemPlacement])

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
      </CardContent>
    </Card>
  )
}
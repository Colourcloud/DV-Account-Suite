"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Package, Loader2, ShoppingCart, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getItemById, getItemImagePathById } from "@/lib/items-data"
import { decodeExcellentOptions, getItemTypeFromId } from "@/lib/warehouse-utils"
import { useToast } from "@/hooks/use-toast"

interface ShopItem {
  itemCat: number
  itemIndex: number
  itemLevel: number
  itemDur: number
  itemSkill: number
  itemLuck: number
  itemOption: number
  itemExel: number
  itemAncient: number
  price: number
  tabId: number
}

interface ShopInventoryItem {
  id: number
  group: number
  index: number
  name: string
  level: number
  durability: number
  skill: number
  luck: number
  option: number
  excellentOption: number
  ancientOption: number
  width: number
  height: number
  tabId: number
  position?: { x: number; y: number }
}

interface ShopFile {
  filename: string
  displayName: string
}

const SHOP_WIDTH = 8
const SHOP_HEIGHT = 15

export default function ShopEditorPage() {
  const [shopFiles, setShopFiles] = useState<ShopFile[]>([])
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [shopItems, setShopItems] = useState<ShopInventoryItem[]>([])
  const [allShopItems, setAllShopItems] = useState<ShopInventoryItem[]>([])
  const [availableTabs, setAvailableTabs] = useState<number[]>([])
  const [selectedTab, setSelectedTab] = useState<string>("0")
  const [grid, setGrid] = useState<(ShopInventoryItem | null)[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ShopInventoryItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 })
  const { toast } = useToast()

  // Load shop files list
  useEffect(() => {
    const loadShopFiles = async () => {
      try {
        const files: ShopFile[] = [
          { filename: "Shop(0)_Hanzo_the_Blacksmith.xml", displayName: "Shop 0 - Hanzo the Blacksmith" },
          { filename: "Shop(1)_Lumen_the_Barmaid.xml", displayName: "Shop 1 - Lumen the Barmaid" },
          { filename: "Shop(2)_Pasi_the_Mage.xml", displayName: "Shop 2 - Pasi the Mage" },
          { filename: "Shop(3)_Wandering_Merchant.xml", displayName: "Shop 3 - Wandering Merchant" },
          { filename: "Shop(4)_Wandering_Merchant_Alex.xml", displayName: "Shop 4 - Wandering Merchant Alex" },
          { filename: "Shop(5)_Lotion_Girl_Amy.xml", displayName: "Shop 5 - Lotion Girl Amy" },
          { filename: "Shop(6)_Caren_the_Barmaid.xml", displayName: "Shop 6 - Caren the Barmaid" },
          { filename: "Shop(7)_Wizard_Izabel.xml", displayName: "Shop 7 - Wizard Izabel" },
          { filename: "Shop(8)_Weapons_Merchant_Zienna.xml", displayName: "Shop 8 - Weapons Merchant Zienna" },
          { filename: "Shop(9)_Eo_the_Craftsman.xml", displayName: "Shop 9 - Eo the Craftsman" },
          { filename: "Shop(10)_Elf_Lala.xml", displayName: "Shop 10 - Elf Lala" },
          { filename: "Shop(11)_Wandering_Merchant_Martin.xml", displayName: "Shop 11 - Wandering Merchant Martin" },
          { filename: "Shop(12)_Thompson_Kenel.xml", displayName: "Shop 12 - Thompson Kenel" },
          { filename: "Shop(13)_Natasha_Firecracker_Merchant.xml", displayName: "Shop 13 - Natasha Firecracker Merchant" },
          { filename: "Shop(14)_Oracle_Layla.xml", displayName: "Shop 14 - Oracle Layla" },
          { filename: "Shop(15)_Siege_Supplier.xml", displayName: "Shop 15 - Siege Supplier" },
          { filename: "Shop(16)_Arena_Guard.xml", displayName: "Shop 16 - Arena Guard" },
          { filename: "Shop(17)_Silvia.xml", displayName: "Shop 17 - Silvia" },
          { filename: "Shop(18)_Leah.xml", displayName: "Shop 18 - Leah" },
          { filename: "Shop(19)_Marseille.xml", displayName: "Shop 19 - Marseille" },
          { filename: "Shop(20)_Christine_the_Merchant.xml", displayName: "Shop 20 - Christine the Merchant" },
          { filename: "Shop(21)_Leina_the_Merchant.xml", displayName: "Shop 21 - Leina the Merchant" },
          { filename: "Shop(22)_Weapons_Merchant_Bolo.xml", displayName: "Shop 22 - Weapons Merchant Bolo" },
          { filename: "Shop(23)_Jin.xml", displayName: "Shop 23 - Jin" },
          { filename: "Shop(24)_Wizard_Gillard.xml", displayName: "Shop 24 - Wizard Gillard" },
          { filename: "Shop(50)_Ruud_Shop.xml", displayName: "Shop 50 - Ruud Shop" },
        ]
        
        setShopFiles(files)
      } catch (err) {
        console.error("Error loading shop files:", err)
        setError("Failed to load shop files")
      }
    }

    loadShopFiles()
  }, [])

  // Function to place items in grid
  const placeItemsInGrid = useCallback((items: ShopInventoryItem[]) => {
    const newGrid: (ShopInventoryItem | null)[][] = []
    for (let y = 0; y < SHOP_HEIGHT; y++) {
      newGrid[y] = new Array(SHOP_WIDTH).fill(null)
    }

    items.forEach((item) => {
      if (item.position) {
        const { x, y } = item.position
        for (let dy = 0; dy < item.height; dy++) {
          for (let dx = 0; dx < item.width; dx++) {
            if (y + dy < SHOP_HEIGHT && x + dx < SHOP_WIDTH) {
              newGrid[y + dy][x + dx] = item
            }
          }
        }
      }
    })

    setGrid(newGrid)
  }, [])

  // Function to recalculate positions for items in a tab (fresh grid)
  const recalculatePositionsForTab = (items: ShopInventoryItem[], tabId: string): ShopInventoryItem[] => {
    // Create a fresh grid for this tab
    const occupiedGrid: boolean[][] = []
    for (let y = 0; y < SHOP_HEIGHT; y++) {
      occupiedGrid[y] = new Array(SHOP_WIDTH).fill(false)
    }

    const canPlaceAt = (x: number, y: number, width: number, height: number): boolean => {
      if (x + width > SHOP_WIDTH || y + height > SHOP_HEIGHT) {
        return false
      }
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          if (occupiedGrid[y + dy][x + dx]) {
            return false
          }
        }
      }
      return true
    }

    const findPosition = (width: number, height: number): { x: number; y: number } | null => {
      for (let y = 0; y <= SHOP_HEIGHT - height; y++) {
        for (let x = 0; x <= SHOP_WIDTH - width; x++) {
          if (canPlaceAt(x, y, width, height)) {
            return { x, y }
          }
        }
      }
      return null
    }

    const markOccupied = (x: number, y: number, width: number, height: number) => {
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          occupiedGrid[y + dy][x + dx] = true
        }
      }
    }

    // Recalculate positions for each item
    return items.map((item) => {
      const position = findPosition(item.width, item.height)
      if (position) {
        markOccupied(position.x, position.y, item.width, item.height)
        return { ...item, position }
      } else {
        console.warn(`Item ${item.name} doesn't fit in grid for tab ${tabId}`)
        return item
      }
    })
  }

  // Handle tab change - filter items and re-place in grid
  useEffect(() => {
    if (allShopItems.length > 0) {
      const selectedTabNum = parseInt(selectedTab)
      
      const filteredItems = allShopItems.filter(item => {
        // Handle both string and number comparisons
        const tabIdStr = item.tabId.toString()
        return tabIdStr === selectedTab || item.tabId === selectedTabNum
      })
      
      // Recalculate positions for this tab's items (fresh grid)
      const itemsWithPositions = recalculatePositionsForTab(filteredItems, selectedTab)
      
      setShopItems(itemsWithPositions)
      placeItemsInGrid(itemsWithPositions)
    }
  }, [selectedTab, allShopItems, placeItemsInGrid])

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

  // Load and parse shop XML
  const loadShop = async (filename: string) => {
    try {
      setIsLoading(true)
      setError(null)
      setSelectedShop(filename)

      const response = await fetch(`/shops/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to load shop file: ${filename}`)
      }

      const xmlText = await response.text()
      
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, "text/xml")
      
      // Get all tabs
      const tabs = xmlDoc.getElementsByTagName("Tab")
      const tabsList: number[] = []
      const parsedItems: ShopItem[] = []

      // Parse each tab and its items
      for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
        const tab = tabs[tabIndex]
        const tabId = parseInt(tab.getAttribute("Id") || "0")
        tabsList.push(tabId)

        // Get items within this tab
        const items = tab.getElementsByTagName("Item")
        console.log(`Tab ${tabId} has ${items.length} items`)
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const itemCat = parseInt(item.getAttribute("ItemCat") || "0")
          const itemIndex = parseInt(item.getAttribute("ItemIndex") || "0")
          
          if (itemCat === 0 && itemIndex === 0) continue
          
          console.log(`Parsing Tab ${tabId} Item ${i}: Cat=${itemCat}, Index=${itemIndex}`)

          parsedItems.push({
            itemCat,
            itemIndex,
            itemLevel: parseInt(item.getAttribute("ItemLevel") || "0"),
            itemDur: parseInt(item.getAttribute("ItemDur") || "0"),
            itemSkill: parseInt(item.getAttribute("ItemSkill") || "0"),
            itemLuck: parseInt(item.getAttribute("ItemLuck") || "0"),
            itemOption: parseInt(item.getAttribute("ItemOption") || "0"),
            itemExel: parseInt(item.getAttribute("ItemExel") || "-1"),
            itemAncient: parseInt(item.getAttribute("ItemAncient") || "0"),
            price: parseInt(item.getAttribute("Price") || "0"),
            tabId,
          })
        }
      }

      // Sort tabs and set available tabs
      const sortedTabs = [...tabsList].sort((a, b) => a - b)
      setAvailableTabs(sortedTabs)
      setSelectedTab(sortedTabs[0]?.toString() || "0")

      // Convert to inventory format WITHOUT position calculation
      // Positions will be calculated per-tab by recalculatePositionsForTab
      const inventoryItems: ShopInventoryItem[] = []

      parsedItems.forEach((item) => {
        const itemId = item.itemCat * 512 + item.itemIndex
        const itemData = getItemById(itemId)

        if (!itemData) {
          console.warn(`Item not found: ID=${itemId}, Cat=${item.itemCat}, Index=${item.itemIndex}, Tab=${item.tabId}`)
          // Create a fallback item so it still shows in the grid
          inventoryItems.push({
            id: itemId,
            group: item.itemCat,
            index: item.itemIndex,
            name: `Unknown Item (${item.itemCat}-${item.itemIndex})`,
            level: item.itemLevel,
            durability: item.itemDur,
            skill: item.itemSkill,
            luck: item.itemLuck,
            option: item.itemOption,
            excellentOption: item.itemExel === -1 ? 0 : item.itemExel,
            ancientOption: item.itemAncient,
            width: 1,
            height: 1,
            tabId: item.tabId,
          })
          return
        }

        inventoryItems.push({
          id: itemId,
          group: item.itemCat,
          index: item.itemIndex,
          name: itemData.name,
          level: item.itemLevel,
          durability: item.itemDur === 0 ? itemData.durability : item.itemDur,
          skill: item.itemSkill,
          luck: item.itemLuck,
          option: item.itemOption,
          excellentOption: item.itemExel === -1 ? 0 : item.itemExel,
          ancientOption: item.itemAncient,
          width: itemData.width,
          height: itemData.height,
          tabId: item.tabId,
        })
      })

      setAllShopItems(inventoryItems)
      
      // Log items per tab for debugging
      console.log('Items loaded per tab:')
      sortedTabs.forEach(tabId => {
        const tabItems = inventoryItems.filter(item => item.tabId === tabId)
        console.log(`Tab ${tabId}: ${tabItems.length} items`)
      })
      
      // Filter by selected tab and calculate positions
      const tabToShow = sortedTabs[0]?.toString() || "0"
      const filteredItems = inventoryItems.filter(item => item.tabId.toString() === tabToShow)
      console.log(`Showing tab ${tabToShow} with ${filteredItems.length} items`)
      
      // Calculate positions for the first tab
      const itemsWithPositions = recalculatePositionsForTab(filteredItems, tabToShow)
      setShopItems(itemsWithPositions)
      placeItemsInGrid(itemsWithPositions)
    } catch (err) {
      console.error("Error loading shop:", err)
      setError(err instanceof Error ? err.message : "Failed to load shop")
    } finally {
      setIsLoading(false)
    }
  }

  const handleItemRightClick = (e: React.MouseEvent, item: ShopInventoryItem) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedItem(item)
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setContextMenuOpen(true)
  }

  const handleDeleteItem = async () => {
    if (!selectedItem || !selectedShop) return

    try {
      // Get the actual XML values - if durability matches item's default, use 0 (XML convention)
      const itemData = getItemById(selectedItem.id)
      const xmlItemDur = (itemData && selectedItem.durability === itemData.durability) ? 0 : selectedItem.durability
      
      const response = await fetch(`/api/shops/delete-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopFile: selectedShop,
          tabId: selectedItem.tabId,
          itemCat: selectedItem.group,
          itemIndex: selectedItem.index,
          itemLevel: selectedItem.level,
          itemDur: xmlItemDur,
          itemSkill: selectedItem.skill,
          itemLuck: selectedItem.luck,
          itemOption: selectedItem.option,
          itemExel: selectedItem.excellentOption > 0 ? selectedItem.excellentOption : -1,
          itemAncient: selectedItem.ancientOption,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      toast({
        title: "Item deleted",
        description: `${selectedItem.name} has been removed from the shop.`,
      })

      // Reload the shop to reflect changes
      await loadShop(selectedShop)

      setContextMenuOpen(false)
      setSelectedItem(null)
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error("Error deleting item:", err)
      toast({
        title: "Error",
        description: "Failed to delete item from shop.",
        variant: "destructive",
      })
    }
  }

  const getCellContent = (x: number, y: number) => {
    const item = grid[y]?.[x]
    if (!item) return null

    const isTopLeft = item.position && item.position.x === x && item.position.y === y
    if (!isTopLeft) return null

    return (
      <HoverCard key={`${x}-${y}`} openDelay={200} closeDelay={200}>
        <HoverCardTrigger asChild>
          <div className="w-full h-full">
            <div 
              className="w-full h-full border border-gray-800 p-0.5 bg-black flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow relative"
              onContextMenu={(e) => handleItemRightClick(e, item)}
            >
              {item.name.startsWith('Unknown Item') ? (
                <div className="font-semibold truncate w-full text-center leading-tight text-[8px] flex flex-col items-center justify-center text-gray-400 px-1">
                  {item.name}
                </div>
              ) : (
                <>
                  <img
                    src={getItemImagePathById(item.id)}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = target.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                  <div className="font-semibold truncate w-full text-center leading-tight text-[10px] hidden flex-col items-center justify-center">
                    {item.name}
                  </div>
                </>
              )}
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 bg-black/60">
          <div className="space-y-3">
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

            <div className="text-center text-green-400">
              <div className="font-semibold text-sm flex flex-row items-center gap-1 justify-center">
                {item.excellentOption > 0 ? (
                  <>
                    <span>Excellent</span> {item.name}
                  </>
                ) : (
                  item.name
                )}
                {item.level > 0 && <span>+{item.level}</span>}
              </div>
            </div>

            <div className="text-sm text-center">
              <span className="font-medium">Durability:</span> [{item.durability}/{getItemById(item.id)?.durability || item.durability}]
              {(() => {
                const itemData = getItemById(item.id)
                if (!itemData) return null
                return (
                  <>
                    {itemData.reqLevel > 0 && (
                      <div className="text-sm text-center mt-1">
                        <span className="font-medium">Required Level:</span> {itemData.reqLevel}
                      </div>
                    )}
                    {itemData.reqStrength > 0 && (
                      <div className="text-sm text-center">
                        <span className="font-medium">Required Strength:</span> {itemData.reqStrength}
                      </div>
                    )}
                    {itemData.attackSpeed > 0 && (
                      <div className="text-sm text-center">
                        <span className="font-medium">Attack Speed:</span> {itemData.attackSpeed}
                      </div>
                    )}
                  </>
                )
              })()}
            </div>

            {item.skill === 1 && (
              <div className="text-center">
                <div className="text-sm text-yellow-400">
                  <span className="font-medium">Skill Item</span>
                </div>
              </div>
            )}

            {item.option > 0 && (
              <div className="text-sm text-center">
                <span className="font-light text-blue-400">
                  {(() => {
                    const itemData = getItemById(item.id)
                    if (itemData && itemData.dmgMin > 0) {
                      return `Additional Dmg: +${item.option * 4}`
                    } else {
                      return `Additional Def: +${item.option * 4}`
                    }
                  })()}
                </span>
              </div>
            )}

            {item.luck === 1 && (
              <div className="text-center">
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <span className="font-light">Luck (success rate of Jewel of Soul +25%)</span>
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <span className="font-light">Luck (critical damage rate +5%)</span>
                </div>
              </div>
            )}

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
    return shopItems.reduce((total, item) => total + (item.width * item.height), 0)
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Shop Editor
          </h1>
          <p className="text-muted-foreground">
            Browse and view shop inventories
          </p>
        </div>
        {selectedShop && (
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{shopItems.length} items</Badge>
            <span className="text-sm text-muted-foreground">
              Used: {getUsedSlots()}/{SHOP_WIDTH * SHOP_HEIGHT} slots
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[700px_1fr] gap-6">
        {/* Left Column - Shop List and Additional Card */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Shops
              </CardTitle>
              <CardDescription>
                Select a shop to view inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {shopFiles.map((shop) => (
                  <Button
                    key={shop.filename}
                    variant={selectedShop === shop.filename ? "secondary" : "outline"}
                    className="w-full justify-start h-auto flex flex-col items-start py-1 my-1.5"
                    onClick={() => loadShop(shop.filename)}
                  >
                    <div className="font-medium text-left">{shop.displayName}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Card Below Shop List */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Items</CardTitle>
              <CardDescription>
                Add Items to your shops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Placeholder for additional content */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Shop Grid View */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedShop ? (
                shopFiles.find(s => s.filename === selectedShop)?.displayName || selectedShop
              ) : (
                "Select a shop to view inventory"
              )}
            </CardTitle>
            <CardDescription>
              {selectedShop ? "Shop inventory grid view" : "Choose a shop from the list"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : selectedShop ? (
              <>
                {availableTabs.length > 1 && (
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-4 mx-auto flex justify-center">
                    <TabsList>
                      {availableTabs.map((tabId) => (
                        <TabsTrigger key={tabId} value={tabId.toString()}>
                          Tab {tabId}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}
                <div className="border border-gray-800 dark:border-gray-800 rounded-md p-2 bg-black dark:bg-black mx-auto max-w-fit">
                  <div
                    className="grid gap-0.5"
                    style={{
                      gridTemplateColumns: `repeat(${SHOP_WIDTH}, 40px)`,
                      gridTemplateRows: `repeat(${SHOP_HEIGHT}, 40px)`,
                    }}
                  >
                    {Array.from({ length: SHOP_HEIGHT }, (_, y) =>
                      Array.from({ length: SHOP_WIDTH }, (_, x) => {
                        const item = grid[y]?.[x]
                        const isTopLeft = item && item.position && item.position.x === x && item.position.y === y

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

                        return (
                          <div
                            key={`${x}-${y}`}
                            className={`border border-[#242424] ${
                              isTopLeft && item ? 'w-full h-full' : 'w-10 h-10'
                            } flex items-center justify-center ${
                              item ? 'bg-black dark:bg-black' : 'bg-[#0f0f0f] hover:bg-gray-800'
                            }`}
                            style={style}
                          >
                            {item ? getCellContent(x, y) : null}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                Please select a shop from the list to view its inventory
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              Are you sure you want to delete "{selectedItem.name}" from this shop? This action cannot be undone.
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
    </DashboardLayout>
  )
}

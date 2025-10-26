/**
 * Warehouse utilities for parsing warehouse data
 */

const WAREHOUSE_WIDTH = 8
const WAREHOUSE_HEIGHT = 15

export interface WarehouseItemData {
  position: number
  itemId: number
  level: number
  durability: number
  skill: number
  luck: number
  option: number
  excellentOption: number
  ancientOption: number
  serial: number
  serial2: number
}

/**
 * Parses warehouse data from base64 string format
 * @param warehouseData - Base64 encoded warehouse data from database
 * @returns Array of warehouse item data
 */
export function decodeWarehouseData(warehouseData: string): WarehouseItemData[] {
  try {
    if (!warehouseData) {
      return []
    }
    
    // Decode base64 ONCE (data is single-encoded in database)
    const decodedString = Buffer.from(warehouseData, 'base64').toString('utf8')
    console.log('Decoded string:', decodedString.substring(0, 200))
    
    // Split by comma to get individual items: {item1},{item2},{item3}
    const itemStrings = decodedString.split('},{')
    console.log('Item strings count:', itemStrings.length)
    
    const items: WarehouseItemData[] = []
    
    for (const itemString of itemStrings) {
      // Clean each item string: remove { and } and trailing comma
      const cleanedItem = itemString.replace(/^\{/, '').replace(/\},?$/, '')
      console.log('Cleaned item:', cleanedItem.substring(0, 50))
      
      // Parse the semicolon-separated values for this item
      const values = cleanedItem.split(';').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
      console.log('Values count:', values.length, 'First 10:', values.slice(0, 10))
      
      if (values.length >= 40) {
        const itemData = parseItemFromValues(values)
        console.log('Parsed item:', itemData)
        if (itemData && itemData.itemId > 0) {
          console.log('Adding item:', itemData)
          items.push(itemData)
        } else {
          console.log('Rejecting item - itemId:', itemData?.itemId)
        }
      } else {
        console.log('Not enough values:', values.length)
      }
    }
    
    console.log('Total items parsed:', items.length)
    
    return items
  } catch (error) {
    console.error('Error decoding warehouse data:', error)
    return []
  }
}


/**
 * Parses a single item from the semicolon-separated values
 * @param values - Array of numeric values for the item
 * @returns Parsed item data or null if invalid
 */
function parseItemFromValues(values: number[]): WarehouseItemData | null {
  try {
    if (values.length < 40) {
      return null
    }
    
    return {
      position: values[0],           // 1: Slot Position
      itemId: values[1],             // 2: item ID
      level: values[5],              // 6: Item level
      durability: values[6],         // 7: Durability
      skill: values[8],              // 9: skill
      luck: values[9],               // 10: Luck
      option: values[10],            // 11: Option
      excellentOption: values[11],   // 12: Excellent Option
      ancientOption: values[12],     // 13: Ancient Option
      serial: values[3],             // 4: Serial
      serial2: values[4]             // 5: Serial (second)
    }
  } catch (error) {
    console.error('Error parsing item from values:', error)
    return null
  }
}

/**
 * Converts warehouse position to grid coordinates
 * @param position - Position in warehouse (0-119 for 8x15 grid)
 * @returns Object with x, y coordinates
 */
export function positionToGridCoords(position: number): { x: number; y: number } {
  const WAREHOUSE_WIDTH = 8
  const x = position % WAREHOUSE_WIDTH
  const y = Math.floor(position / WAREHOUSE_WIDTH)
  return { x, y }
}

/**
 * Converts grid coordinates to warehouse position
 * @param x - X coordinate (0-7)
 * @param y - Y coordinate (0-14)
 * @returns Position in warehouse (0-119)
 */
export function gridCoordsToPosition(x: number, y: number): number {
  const WAREHOUSE_WIDTH = 8
  return y * WAREHOUSE_WIDTH + x
}

/**
 * Converts decoded warehouse item data to the format expected by the warehouse grid
 * @param warehouseItems - Array of decoded warehouse items
 * @returns Array of items formatted for the warehouse grid
 */
export function convertWarehouseItemsToGrid(warehouseItems: WarehouseItemData[]): any[] {
  return warehouseItems.map(item => ({
    id: item.itemId,
    position: positionToGridCoords(item.position),
    level: item.level,
    durability: item.durability,
    skill: item.skill,
    luck: item.luck,
    option: item.option,
    excellentOption: item.excellentOption,
    ancientOption: item.ancientOption,
    serial: item.serial,
    // Add default dimensions - these will be overridden by item data from database
    width: 1,
    height: 1
  }))
}


/**
 * Decodes excellent options from binary flag value
 * @param excellentValue - The excellent option value from database (1,3,7,15,31,63)
 * @param itemType - Type of item to determine which options to show
 * @returns Array of excellent option descriptions
 */
export function decodeExcellentOptions(excellentValue: number, itemType: 'weapon' | 'armor' | 'accessory' = 'weapon'): string[] {
  const options: string[] = []
  
  if (excellentValue === 0) return options
  
  // For weapons, check each bit flag
  if (itemType === 'weapon') {
    // Check each bit position (1, 2, 4, 8, 16, 32)
    const bitFlags = [1, 2, 4, 8, 16, 32]
    const descriptions = [
      "Obtains (Mana/8) when monster is killed",
      "Obtains (Life/8) when monster is killed", 
      "Increase 7 Attack (Wizardy) speed",
      "ATK Dmg increases by 2%",
      "ATK Dmg increases by 1 every 20Lv",
      "Increase Excellent Damage Chance by 10%"
    ]
    
    bitFlags.forEach((flag, index) => {
      if ((excellentValue & flag) === flag) {
        options.push(descriptions[index])
      }
    })
  }
  
  // For armor, check each bit flag
  if (itemType === 'armor') {
    // Check each bit position (1, 2, 4, 8, 16, 32)
    const bitFlags = [1, 2, 4, 8, 16, 32]
    const descriptions = [
      "Increase the amount of Zen acquired for hunting monsters by 30%",
      "Increases Defense Success Rate +10%",
      "Reflect Damage by 5%",
      "Decreases Damage by 4%",
      "Increase Maximum Mana by 4%",
      "Increase Maximum Life by 4%"
    ]
    
    bitFlags.forEach((flag, index) => {
      if ((excellentValue & flag) === flag) {
        options.push(descriptions[index])
      }
    })
  }
  
  // For accessories, check each bit flag
  if (itemType === 'accessory') {
    // Check each bit position (1, 2, 4, 8, 16, 32)
    const bitFlags = [1, 2, 4, 8, 16, 32]
    const descriptions = [
      "Increase Maximum Mana +50",
      "Increase Maximum Life +50",
      "Increase Defense Success Rate +10%",
      "Reflect Damage +5%",
      "Damage Decrease +4%",
      "Increase Zen After Hunt +40%"
    ]
    
    bitFlags.forEach((flag, index) => {
      if ((excellentValue & flag) === flag) {
        options.push(descriptions[index])
      }
    })
  }
  
  return options
}

/**
 * Determines the item type based on the item's category ID
 * @param itemId - The item ID to determine type for
 * @returns Item type for excellent options
 */
export function getItemTypeFromId(itemId: number): 'weapon' | 'armor' | 'accessory' {
  // Get the category ID from itemId
  // ItemId format: (group * 512) + index
  const categoryId = Math.floor(itemId / 512)
  
  // Categories 0-5 are weapons
  if (categoryId >= 0 && categoryId <= 5) {
    return 'weapon'
  }
  
  // Categories 6-11 are armor
  if (categoryId >= 6 && categoryId <= 11) {
    return 'armor'
  }
  
  // Categories 12+ are accessories
  return 'accessory'
}


/**
 * Encodes warehouse items back to base64 format
 * @param items - Array of warehouse items to encode
 * @returns Base64 encoded warehouse data
 */
export function encodeWarehouseData(items: WarehouseItemData[]): string {
  try {
    if (!items || items.length === 0) {
      return ''
    }

    // Convert items to the semicolon-separated format
    const itemStrings = items.map(item => {
      // Create the 40-element array with the important first 15 values and padding
      const values = new Array(40).fill(0)
      
      // Important first 15 values
      values[0] = item.position        // 0: Slot Position
      values[1] = item.itemId          // 1: Item ID  
      values[2] = 0                    // 2: Unknown (usually 0)
      values[3] = 0                   // 3: Serial (set to 0)
      values[4] = 0                    // 4: Unknown (usually 0)
      values[5] = item.level           // 5: Item level
      values[6] = item.durability      // 6: Durability
      values[7] = 0                    // 7: Unknown (usually 0)
      values[8] = item.skill           // 8: Skill
      values[9] = item.luck            // 9: Luck
      values[10] = item.option         // 10: Option
      values[11] = item.excellentOption // 11: Excellent Option
      values[12] = item.ancientOption  // 12: Ancient Option
      values[13] = 0                   // 13: Unknown (usually 0)
      values[14] = 0                   // 14: Unknown (usually 0)
      values[15] = 0                   // 15: Unknown (usually 0)
      
      // Fill the rest with standard padding values
      values[16] = 65535               // 16: Standard padding
      values[17] = 65535               // 17: Standard padding
      values[18] = 65535               // 18: Standard padding
      values[19] = 65535               // 19: Standard padding
      values[20] = 65535               // 20: Standard padding
      values[21] = 255                 // 21: Standard padding
      values[22] = 0                   // 22: Standard padding
      values[23] = 0                   // 23: Standard padding
      values[24] = 0                   // 24: Standard padding
      values[25] = 0                   // 25: Standard padding
      values[26] = 0                   // 26: Standard padding
      values[27] = 0                   // 27: Standard padding
      values[28] = 0                   // 28: Standard padding
      values[29] = 0                   // 29: Standard padding
      values[30] = 255                 // 30: Standard padding
      values[31] = 255                 // 31: Standard padding
      values[32] = 255                 // 32: Standard padding
      values[33] = 255                 // 33: Standard padding
      values[34] = 255                 // 34: Standard padding
      values[35] = 255                 // 35: Standard padding
      values[36] = 0                   // 36: Standard padding
      values[37] = 0                   // 37: Standard padding
      values[38] = 254                 // 38: Standard padding
      values[39] = 254                 // 39: Standard padding
      
      return `{${values.join(';')}}`
    })

    // Join all items with commas
    const warehouseString = itemStrings.join(',')
    
    // Single encode to base64 (to match database format)
    const encoded = Buffer.from(warehouseString, 'utf8').toString('base64')
    
    return encoded
  } catch (error) {
    console.error('Error encoding warehouse data:', error)
    return ''
  }
}

/**
 * Checks if an item can fit at the specified position in the warehouse
 * @param grid - Current warehouse grid state
 * @param x - X coordinate to check
 * @param y - Y coordinate to check
 * @param width - Item width
 * @param height - Item height
 * @returns True if the item can fit at the position
 */
export function canPlaceItem(
  grid: (any | null)[][], 
  x: number, 
  y: number, 
  width: number, 
  height: number
): boolean {
  // Check bounds
  if (x < 0 || y < 0 || x + width > WAREHOUSE_WIDTH || y + height > WAREHOUSE_HEIGHT) {
    return false
  }

  // Check if all required slots are empty
  for (let dy = 0; dy < height; dy++) {
    for (let dx = 0; dx < width; dx++) {
      if (grid[y + dy]?.[x + dx] !== null) {
        return false
      }
    }
  }

  return true
}

/**
 * Places an item at the specified position in the grid
 * @param grid - Current warehouse grid state
 * @param x - X coordinate to place item
 * @param y - Y coordinate to place item
 * @param item - Item to place
 * @returns Updated grid with item placed
 */
export function placeItemInGrid(
  grid: (any | null)[][], 
  x: number, 
  y: number, 
  item: any
): (any | null)[][] {
  const newGrid = grid.map(row => [...row])
  
  // Place the item in all required slots
  for (let dy = 0; dy < item.height; dy++) {
    for (let dx = 0; dx < item.width; dx++) {
      if (newGrid[y + dy] && newGrid[y + dy][x + dx] !== undefined) {
        newGrid[y + dy][x + dx] = item
      }
    }
  }

  return newGrid
}

/**
 * Warehouse utilities for parsing warehouse data
 */

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
    
    // Decode base64 TWICE (data is double-encoded)
    const firstDecode = Buffer.from(warehouseData, 'base64').toString('utf8')
    console.log('First decode:', firstDecode.substring(0, 100))
    
    const decodedString = Buffer.from(firstDecode, 'base64').toString('utf8')
    console.log('Second decode:', decodedString.substring(0, 200))
    
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
    serial: item.serial
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
  
  // TODO: Add armor and accessory excellent options when needed
  
  return options
}

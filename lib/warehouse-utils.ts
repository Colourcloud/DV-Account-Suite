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
  masteryBonus?: string
  wing5thOption1?: string
  wing5thOption2?: string
  socket1?: string
  socket2?: string
  socket3?: string
  socket4?: string
  socket5?: string
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
      
      // Support both old 40-value format (from database) and new 43-value format (newly created items)
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
    // Support both old 40-value format and new 43-value format
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
      serial2: values[4],            // 5: Serial (second)
      masteryBonus: values.length > 20 ? values[20].toString() : "0",  // 21: Mastery Bonus
      wing5thOption1: values.length > 38 ? values[38].toString() : "254",  // 39: Wing 5th Option 1
      wing5thOption2: values.length > 39 ? values[39].toString() : "254",  // 40: Wing 5th Option 2
      socket1: values.length > 15 ? values[15].toString() : "65535",  // 16: Socket 1
      socket2: values.length > 16 ? values[16].toString() : "65535",  // 17: Socket 2
      socket3: values.length > 17 ? values[17].toString() : "65535",  // 18: Socket 3
      socket4: values.length > 18 ? values[18].toString() : "65535",  // 19: Socket 4
      socket5: values.length > 19 ? values[19].toString() : "65535"   // 20: Socket 5
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
    masteryBonus: item.masteryBonus,
    wing5thOption1: item.wing5thOption1,
    wing5thOption2: item.wing5thOption2,
    socket1: item.socket1,
    socket2: item.socket2,
    socket3: item.socket3,
    socket4: item.socket4,
    socket5: item.socket5,
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
 * Decodes wing 5th options from their numeric values
 * @param wing5thOption1 - The first wing 5th option value
 * @param wing5thOption2 - The second wing 5th option value
 * @returns Array of wing option descriptions
 */
export function decodeWing5thOptions(wing5thOption1?: string, wing5thOption2?: string): string[] {
  const options: string[] = []
  
  const wingOptions = [
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
  
  if (wing5thOption1 && wing5thOption1 !== "254") {
    const option1 = wingOptions.find(opt => opt.value === wing5thOption1)
    if (option1) {
      options.push(option1.label)
    }
  }
  
  if (wing5thOption2 && wing5thOption2 !== "254") {
    const option2 = wingOptions.find(opt => opt.value === wing5thOption2)
    if (option2) {
      options.push(option2.label)
    }
  }
  
  return options
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
      // Create the 43-element array with the important first 15 values and padding
      const values = new Array(43).fill(0)
      
      // Important first 15 values
      values[0] = item.position        // 0: Slot Position
      values[1] = item.itemId          // 1: Item ID  
      values[2] = 0                    // 2: Unknown (usually 0)
      values[3] = item.serial          // 3: Serial
      values[4] = item.serial2         // 4: Serial (second)
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
      
      // Socket System values (positions 16-20 in the item code)
      values[15] = parseInt(item.socket1 || '65535')  // 16: Socket 1
      values[16] = parseInt(item.socket2 || '65535')  // 17: Socket 2
      values[17] = parseInt(item.socket3 || '65535')  // 18: Socket 3
      values[18] = parseInt(item.socket4 || '65535')  // 19: Socket 4
      values[19] = parseInt(item.socket5 || '65535')  // 20: Socket 5
      values[20] = parseInt(item.masteryBonus || '0')  // 20: Mastery Bonus
      values[21] = 0                   // 21: Standard padding
      values[22] = 0                   // 22: Standard padding
      values[23] = 0                   // 23: Standard padding
      values[24] = 0                   // 24: Standard padding
      values[25] = 0                   // 25: Standard padding
      values[26] = 0                   // 26: Standard padding
      values[27] = 0                   // 27: Standard padding
      values[28] = 0                   // 28: Standard padding
      values[29] = 0                   // 29: Standard padding
      values[30] = 255                 // 31: Standard padding
      values[31] = 255                 // 32: Standard padding
      values[32] = 255                 // 33: Standard padding
      values[33] = 255                 // 34: Standard padding
      values[34] = 255                 // 35: Standard padding
      values[35] = 255                 // 36: Standard padding
      values[36] = 0                   // 37: Standard padding
      values[37] = 0                   // 38: Standard padding
      values[38] = parseInt(item.wing5thOption1 || '254')  // 39: Wing 5th Option 1
      values[39] = parseInt(item.wing5thOption2 || '254')  // 40: Wing 5th Option 2
      values[40] = 254                 // 41: Standard padding
      values[41] = 254                 // 42: Standard padding
      values[42] = 254                 // 43: Standard padding
      
      return `{${values.join(';')}}`
    })

    // Join all items with commas and add trailing comma at the end
    const warehouseString = itemStrings.join(',') + ','
    
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

/**
 * Decodes socket options from socket values
 * @param socket1 - Socket 1 value
 * @param socket2 - Socket 2 value
 * @param socket3 - Socket 3 value
 * @param socket4 - Socket 4 value
 * @param socket5 - Socket 5 value
 * @returns Array of socket option descriptions
 */
export function decodeSocketOptions(socket1?: string, socket2?: string, socket3?: string, socket4?: string, socket5?: string): string[] {
  const options: string[] = []
  
  const socketOptions: { [key: string]: string } = {
    "65535": "No Socket",
    "65534": "Empty Socket",
    // Fire Seeds
    "200": "(Fire) Increases DMG and Wizardy DMG for every 20 Levels. Increases by +1.5",
    "201": "(Fire) Attack Speed Increase by 11",
    "202": "(Fire) Maximum Attack/Wizardy Increase by 45",
    "203": "(Fire) Minimum Attack/Wizardy Increase by 35",
    "204": "(Fire) Attack/Wizardy Increase by 35",
    "205": "(Fire) AG Cost Decrease by 45%",
    // Water Seeds
    "210": "(Water) Block Rate Increase 14%",
    "211": "(Water) Defence Increase +41",
    "212": "(Water) Shield Protection Increases 350%",
    "213": "(Water) Damage Reduction 8%",
    "214": "(Water) Damage Reflection 9%",
    // Ice Seeds
    "216": "(Ice) Monster Destruction for the life increases +372",
    "217": "(Ice) Monster Destruction for the mana increases +601",
    "218": "(Ice) Skill Attack Increases +57",
    "219": "(Ice) Attack Rating Increases +42",
    "220": "(Ice) Item Durability Increases +40%",
    // Wind Seeds
    "221": "(Wind) Automatic Life Recovery Increases +21",
    "222": "(Wind) Maximum Life Increases +165",
    "223": "(Wind) Maximum Mana Increases +215",
    "224": "(Wind) Automatic Mana Recovery Increases +37",
    "225": "(Wind) Maximum AG Increases +126",
    "226": "(Wind) AG Value Increases +13",
    // Lightning Seeds
    "229": "(Lightning) Excellent Damage Increases +36",
    "230": "(Lightning) Excellent Damage Rate Increases +14%",
    "231": "(Lightning) Critical Damage Increases +47",
    "232": "(Lightning) Critical Damage Rate Increases +12%",
    // Earth Seeds
    "234": "(Earth) Strength Increases +11",
    "235": "(Earth) Agility Increases +5",
    "236": "(Earth) Health Increases +38",
    "237": "(Earth) Energy Increases +17"
  }
  
  const sockets = [socket1, socket2, socket3, socket4, socket5]
  
  sockets.forEach(socket => {
    if (socket && socket !== "65535" && socket !== "0") {
      if (socket === "65534") {
        options.push("Empty Socket")
      } else if (socketOptions[socket]) {
        options.push(socketOptions[socket])
      }
    }
  })
  
  return options
}

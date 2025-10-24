/**
 * MU Online Item Database - TypeScript Format
 * Converted from Item.txt with additional metadata
 */

import itemsFullData from './items-full.json'

export interface ItemData {
  id: number              // Encoded ID (group * 512 + index)
  group: number           // Item group/type
  index: number           // Item index within group
  slot: number            // Equipment slot
  skill: number           // Skill requirement
  width: number           // Grid width (X)
  height: number          // Grid height (Y)
  serial: number
  option: number
  drop: number
  name: string            // Item name
  level: number           // Base level
  dmgMin: number          // Minimum damage
  dmgMax: number          // Maximum damage
  attackSpeed: number     // Attack speed
  durability: number      // Durability
  magicDurability: number // Magic durability
  magicPower: number      // Magic power
  reqLevel: number        // Required level
  reqStrength: number     // Required strength
  reqDexterity: number    // Required dexterity
  reqEnergy: number       // Required energy
  reqVitality: number     // Required vitality
  reqCommand: number      // Required command
  setType: number         // Set type
  classes: number[]       // Which classes can use (C0-C6)
  image?: string          // Image path (optional)
  category?: string       // Category for organization
}

// Full item database imported from items-full.json
export const ITEMS_DATABASE: ItemData[] = itemsFullData as ItemData[]

// Helper function to get item by ID
export function getItemById(id: number): ItemData | undefined {
  return ITEMS_DATABASE.find(item => item.id === id)
}

// Helper function to get item by group and index
export function getItemByGroupIndex(group: number, index: number): ItemData | undefined {
  return ITEMS_DATABASE.find(item => item.group === group && item.index === index)
}

// Helper function to get item by name
export function getItemByName(name: string): ItemData | undefined {
  return ITEMS_DATABASE.find(item => item.name === name)
}

/**
 * Get item group from itemId
 * ItemId format: (group * 512) + index
 */
export function getItemGroup(itemId: number): number {
  return Math.floor(itemId / 512)
}

/**
 * Get item index from itemId
 * ItemId format: (group * 512) + index
 */
export function getItemIndex(itemId: number): number {
  return itemId % 512
}

/**
 * Get item image path by group and index
 * Images should be organized as: /items/{group}/{index}.gif
 * 
 * Example: Group 0 (Blades), Index 5 -> /items/0/5.gif
 */
export function getItemImagePath(group: number, index: number): string {
  return `/items/${group}/${index}.gif`
}

/**
 * Get item image path by itemId
 * Convenience function that extracts group and index from itemId
 */
export function getItemImagePathById(itemId: number): string {
  const group = getItemGroup(itemId)
  const index = getItemIndex(itemId)
  return getItemImagePath(group, index)
}

/**
 * Check if an item image exists (always returns true now since we use ID-based paths)
 * You can optionally implement actual file existence checking if needed
 */
export function hasItemImage(itemId: number): boolean {
  // With ID-based approach, we assume all items have potential images
  // You can enhance this to check actual file existence if needed
  return true
}


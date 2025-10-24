/**
 * Utility functions for handling character classes and race mappings
 */

/**
 * Maps race numbers to class names
 * @param race - The race number from the database
 * @returns The corresponding class name
 */
export const getRaceToClass = (race: number): string => {
  const raceMap: { [key: number]: string } = {
    0: "Dark Wizard",
    1: "Soul Master",
    3: "Grand Master",
    7: "Soul Wizard",
    15: "Darkness Wizard",

    16: "Dark Knight",
    17: "Blade Knight",
    19: "Blade Master",
    23: "Dragon Knight",
    31: "Ignition Knight",

    32: "Fairy Elf",
    33: "Muse Elf",
    35: "High Elf",
    39: "Noble Elf",
    47: "Royal Elf",

    48: "Magic Gladiator",
    50: "Duel Master",

    64: "Dark Lord",
    
    80: "Summoner",

    96: "Rage Fighter",

    112: "Grow Lancer",

    128: "Rune Wizard",

    144: "Slayer"
  }
  return raceMap[race] || "Unknown"
}

/**
 * Maps class names to their corresponding image paths
 * @param className - The class name
 * @returns The path to the class image
 */
export const getClassImage = (className: string): string => {
  switch (className) {
    case "Dark Knight":
      return "/class/knight.jpg"
    case "Blade Knight":
      return "/class/knight.jpg"
    case "Blade Master":
      return "/class/knight.jpg"
    case "Dragon Knight":
      return "/class/knight.jpg"
    case "Ignition Knight":
      return "/class/knight.jpg"
    
    case "Dark Wizard":
      return "/class/wizard.jpg"
    case "Soul Master":
      return "/class/wizard.jpg"
    case "Grand Master":
      return "/class/wizard.jpg"
    case "Soul Wizard":
      return "/class/wizard.jpg"
    case "Darkness Wizard":
      return "/class/wizard.jpg"
    
    case "Fairy Elf":
      return "/class/elf.jpg"
    case "Muse Elf":
      return "/class/elf.jpg"
    case "High Elf":
      return "/class/elf.jpg"
    case "Noble Elf":
      return "/class/elf.jpg"
    case "Royal Elf":
      return "/class/elf.jpg"
    
    case "Magic Gladiator":
      return "/class/magic_glad.jpg"
    case "Duel Master":
      return "/class/magic_glad.jpg"
    
    case "Dark Lord":
      return "/class/darklord.jpg"
    
    case "Summoner":
      return "/class/summoner.jpg"
    
    case "Rage Fighter":
      return "/class/rage_fighter.jpg"
    
    case "Rune Wizard":
      return "/class/rune_wizard.jpg"

    case "Grow Lancer":
      return "/class/grow_lancer.jpg"
    
    case "Slayer":
      return "/class/slayer.jpg"

    case "Gun Crusher":
      return "/class/gun_crusher.jpg"

    case "Light Wizard":
      return "/class/light_wizard.jpg"
    
    case "Lemuria Mage":
      return "/class/mage.jpg"
    
    case "Illusion Knight":
      return "/class/illusion.jpg"
    
    case "Alchemist":
      return "/class/alch.jpg"
    
    default:
      return "/class/knight.jpg"
  }
}

/**
 * Maps world numbers to world names
 * @param world - The world number from the database
 * @returns The corresponding world name
 */
export const getWorldName = (world: number): string => {
  const worldMap: { [key: number]: string } = {
    0: "Lorencia",
    1: "Dungeon", 
    2: "Devias",
    3: "Noria",
    4: "Losttower",
    6: "Stadium",
    7: "Atlans",
    8: "Tarkan",
    9: "Devil Square",
    10: "Icarus",
    11: "Blood Castle 1",
    12: "Blood Castle 2",
    13: "Blood Castle 3",
    14: "Blood Castle 4",
    15: "Blood Castle 5",
    16: "Blood Castle 6",
    17: "Blood Castle 7",
    18: "Chaos Castle 1",
    19: "Chaos Castle 2",
    20: "Chaos Castle 3",
    21: "Chaos Castle 4",
    22: "Chaos Castle 5",
    23: "Chaos Castle 6",
    24: "Kalima 1",
    25: "Kalima 2",
    26: "Kalima 3",
    27: "Kalima 4",
    28: "Kalima 5",
    29: "Kalima 6",
    30: "Valley Of Loren",
    31: "Land Of Trials",
    32: "Devil Square",
    33: "Aida",
    34: "Crywolf",
    35: "CrywolfSecondZone",
    36: "Kalima 7",
    37: "Kanturu",
    38: "Kanturu Core",
    39: "Kanturu Boss",
    40: "Event Zone",
    41: "Barracks",
    42: "Refuge",
    45: "Illusion Temple 1",
    46: "Illusion Temple 2",
    47: "Illusion Temple 3",
    48: "Illusion Temple 4",
    49: "Illusion Temple 5",
    50: "Illusion Temple 6",
    51: "Elbeland",
    52: "Blood Castle 8",
    53: "Chaos Castle 7",
    56: "Swamp Of Peace",
    57: "Raklion",
    58: "Raklion Hatchery",
    62: "XMas",
    63: "Vulcanus",
    64: "Vulcanus Duel",
    65: "Dopple Ganger Snow",
    66: "Dopple Ganger Volcan",
    67: "Dopple Ganger Sea",
    68: "Dopple Ganger Crystals",
    69: "Imperial Fortress 1",
    70: "Imperial Fortress 2",
    71: "Imperial Fortress 3",
    72: "Imperial Fortress 4",
    79: "Loren Market",
    80: "Kalrutan 1",
    81: "Kalrutan 2",
    82: "DoubleGoer 1",
    83: "DoubleGoer 2",
    84: "DoubleGoer 3",
    85: "DoubleGoer 4",
    86: "DoubleGoer 5",
    87: "DoubleGoer 6",
    88: "DoubleGoer 7",
    89: "DoubleGoer 8",
    90: "DoubleGoer 9",
    91: "Acheron 1",
    92: "Acheron 2",
    95: "Debenter",
    96: "Debenter 2",
    97: "Chaos Castle Final",
    98: "Illusion Temple Final 1",
    99: "Illusion Temple Final 2",
    100: "Uruk Mountain 1",
    101: "Uruk Mountain 2",
    102: "Tormented Square",
    103: "Tormented Square",
    104: "Tormented Square",
    105: "Tormented Square",
    106: "Tormented Square",
    110: "Nars",
    112: "Ferea",
    113: "Nixies Lake",
    114: "Quest Zone",
    115: "The labyrinth of Dimensions",
    116: "Deep Dungeon 1",
    117: "Deep Dungeon 2",
    118: "Deep Dungeon 3",
    119: "Deep Dungeon 4",
    120: "Deep Dungeon 5",
    121: "Place of Qualification",
    122: "Swamp of Darkness",
    123: "Kubera Mine",
    124: "Kubera Mine",
    125: "Kubera Mine",
    126: "Kubera Mine",
    127: "Kubera Mine",
    128: "Abyss of Atlans 1",
    129: "Abyss of Atlans 2",
    130: "Abyss of Atlans 3",
    131: "Scorched Canyon",
    132: "Red Smoke Icarus",
    133: "Arenil Temple",
    134: "Ashen Aida",
    135: "Old Kethotum",
    136: "Blaze Kethotum",
    137: "Kanturu Undergrounds",
    138: "Ignis Volcano",
    139: "Boss Battle Together",
    140: "Bloody Tarkan",
    141: "Tormenta Island",
    142: "Twisted Karutan",
    143: "Kardamahal UnderGround Temple"
  }
  return worldMap[world] || "Unknown"
}

/**
 * Formats zen amounts for display
 * @param amount - The zen amount to format
 * @returns Formatted zen string
 */
export const formatZen = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toString()
}

/**
 * Script to convert ItemList.xml to JSON format
 * Usage: node scripts/convert-items-new.js > lib/items-full-new.json
 */

const fs = require('fs');
const path = require('path');

// Read ItemList.xml
const xmlPath = path.join(__dirname, '..', 'public', 'ItemList.xml');
const content = fs.readFileSync(xmlPath, 'utf-8');

const items = [];
let currentGroup = 0;

// Parse XML line by line
const lines = content.split('\n');

for (const line of lines) {
  const trimmed = line.trim();
  
  // Check for category/group
  const categoryMatch = trimmed.match(/<Category\s+Index="(\d+)"/);
  if (categoryMatch) {
    currentGroup = parseInt(categoryMatch[1]);
    continue;
  }
  
  // Skip if not an item line
  if (!trimmed.startsWith('<Item ')) continue;
  
  try {
    // Extract attributes from XML
    const getAttr = (attrName) => {
      const match = trimmed.match(new RegExp(`${attrName}="([^"]*)"`));
      return match ? match[1] : '0';
    };
    
    const index = parseInt(getAttr('Index')) || 0;
    const name = getAttr('Name');
    const slot = parseInt(getAttr('Slot')) || 0;
    const skill = parseInt(getAttr('SkillIndex')) || 0;
    const width = parseInt(getAttr('Width')) || 1;
    const height = parseInt(getAttr('Height')) || 1;
    const serial = parseInt(getAttr('Serial')) || 0;
    const option = parseInt(getAttr('Option')) || 0;
    const drop = parseInt(getAttr('Drop')) || 0;
    const level = parseInt(getAttr('DropLevel')) || 0;
    const dmgMin = parseInt(getAttr('MinDamage')) || 0;
    const dmgMax = parseInt(getAttr('MaxDamage')) || 0;
    const attackSpeed = parseInt(getAttr('AttackSpeed')) || 0;
    const durability = parseInt(getAttr('Durability')) || 0;
    const magicDurability = parseInt(getAttr('MagicDurability')) || 0;
    const magicPower = parseInt(getAttr('MagicPower')) || 0;
    const reqLevel = parseInt(getAttr('ReqLevel')) || 0;
    const reqStrength = parseInt(getAttr('ReqStrength')) || 0;
    const reqDexterity = parseInt(getAttr('ReqAgility')) || 0;
    const reqEnergy = parseInt(getAttr('ReqEnergy')) || 0;
    const reqVitality = parseInt(getAttr('ReqVitality')) || 0;
    const reqCommand = parseInt(getAttr('ReqCommand')) || 0;
    const setType = parseInt(getAttr('SetAttrib')) || 0;
    
    // Extract class restrictions (matching the original 7 classes)
    // Original order: C0=DarkWizard, C1=DarkKnight, C2=FairyElf, C3=MagicGladiator, C4=DarkLord, C5=Summoner, C6=RageFighter
    const classes = [
      parseInt(getAttr('DarkWizard')) || 0,
      parseInt(getAttr('DarkKnight')) || 0,
      parseInt(getAttr('FairyElf')) || 0,
      parseInt(getAttr('MagicGladiator')) || 0,
      parseInt(getAttr('DarkLord')) || 0,
      parseInt(getAttr('Summoner')) || 0,
      parseInt(getAttr('RageFighter')) || 0
    ];
    
    const encodedId = (currentGroup * 512) + index;
    
    items.push({
      id: encodedId,
      group: currentGroup,
      index,
      slot,
      skill,
      width,
      height,
      serial,
      option,
      drop,
      name,
      level,
      dmgMin,
      dmgMax,
      attackSpeed,
      durability,
      magicDurability,
      magicPower,
      reqLevel,
      reqStrength,
      reqDexterity,
      reqEnergy,
      reqVitality,
      reqCommand,
      setType,
      classes
    });
  } catch (error) {
    console.error('Error parsing line:', line.substring(0, 80), error.message);
  }
}

// Output as JSON - compact format with one item per line
console.log('[');
items.forEach((item, index) => {
  const comma = index < items.length - 1 ? ',' : '';
  console.log('  ' + JSON.stringify(item) + comma);
});
console.log(']');
console.error(`\n// Converted ${items.length} items from ItemList.xml`);


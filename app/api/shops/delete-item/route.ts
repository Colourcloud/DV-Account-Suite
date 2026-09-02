import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import * as path from 'path'
import { parseStringPromise, Builder } from 'xml2js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('=== DELETE ITEM REQUEST ===')
    console.log('Received body:', JSON.stringify(body, null, 2))
    
    const {
      shopFile,
      tabId,
      itemCat,
      itemIndex,
      itemLevel,
      itemDur,
      itemSkill,
      itemLuck,
      itemOption,
      itemExel,
      itemAncient,
    } = body

    // Path to the shop XML file
    const shopPath = path.join(process.cwd(), 'public', 'shops', shopFile)
    console.log('Shop file path:', shopPath)

    // Read the XML file
    const xmlContent = await fs.readFile(shopPath, 'utf-8')
    console.log('XML file read, length:', xmlContent.length)

    // Parse XML
    const parsedXml = await parseStringPromise(xmlContent)
    console.log('XML parsed successfully')

    // Find the tab
    const tabs = parsedXml.ShopItem.Tab
    console.log('Total tabs found:', tabs ? (Array.isArray(tabs) ? tabs.length : 1) : 0)
    
    if (!tabs || !Array.isArray(tabs)) {
      console.error('Invalid XML structure - tabs:', tabs)
      return NextResponse.json(
        { error: 'Invalid XML structure' },
        { status: 400 }
      )
    }

    // Find the tab with matching Id
    const tab = tabs.find((t: any) => t.$.Id === tabId.toString())
    console.log('Looking for tab with Id:', tabId.toString())
    console.log('Available tab IDs:', tabs.map((t: any) => t.$.Id))
    console.log('Found tab:', tab ? 'Yes' : 'No')
    
    if (!tab || !tab.Item) {
      console.error('Tab not found or has no items. Tab:', tab)
      return NextResponse.json(
        { error: 'Tab not found or has no items' },
        { status: 404 }
      )
    }

    console.log('Tab has', tab.Item.length, 'items')
    
    // Log what we're looking for
    const searchCriteria = {
      ItemCat: itemCat.toString(),
      ItemIndex: itemIndex.toString(),
      ItemLevel: itemLevel.toString(),
      ItemDur: itemDur.toString(),
      ItemSkill: itemSkill.toString(),
      ItemLuck: itemLuck.toString(),
      ItemOption: itemOption.toString(),
      ItemExel: itemExel.toString(),
      ItemAncient: itemAncient.toString(),
    }
    console.log('Searching for item with criteria:', JSON.stringify(searchCriteria, null, 2))

    // Log first few items for comparison
    console.log('First 3 items in tab:')
    tab.Item.slice(0, 3).forEach((item: any, idx: number) => {
      console.log(`Item ${idx + 1}:`, JSON.stringify(item.$, null, 2))
    })

    // Filter out the matching item
    // Compare as numbers to handle zero-padding in XML
    const initialItemCount = tab.Item.length
    tab.Item = tab.Item.filter((item: any) => {
      const matches = (
        parseInt(item.$.ItemCat || '0') === parseInt(itemCat.toString()) &&
        parseInt(item.$.ItemIndex || '0') === parseInt(itemIndex.toString()) &&
        parseInt(item.$.ItemLevel || '0') === parseInt(itemLevel.toString()) &&
        parseInt(item.$.ItemDur || '0') === parseInt(itemDur.toString()) &&
        parseInt(item.$.ItemSkill || '0') === parseInt(itemSkill.toString()) &&
        parseInt(item.$.ItemLuck || '0') === parseInt(itemLuck.toString()) &&
        parseInt(item.$.ItemOption || '0') === parseInt(itemOption.toString()) &&
        parseInt(item.$.ItemExel || '-1') === parseInt(itemExel.toString()) &&
        parseInt(item.$.ItemAncient || '0') === parseInt(itemAncient.toString())
      )
      return !matches
    })

    console.log('Items before:', initialItemCount, 'Items after:', tab.Item.length)

    // Check if item was actually removed
    if (tab.Item.length === initialItemCount) {
      console.error('Item was not found/deleted. No items removed.')
      console.log('Tried to match:', searchCriteria)
      console.log('Available items:', tab.Item.map((item: any) => ({
        ItemCat: item.$.ItemCat,
        ItemIndex: item.$.ItemIndex,
        ItemLevel: item.$.ItemLevel,
        ItemDur: item.$.ItemDur,
        ItemSkill: item.$.ItemSkill,
        ItemLuck: item.$.ItemLuck,
        ItemOption: item.$.ItemOption,
        ItemExel: item.$.ItemExel,
        ItemAncient: item.$.ItemAncient,
      })).slice(0, 5))
      
      return NextResponse.json(
        { 
          error: 'Item not found in shop',
          debug: {
            searchCriteria,
            totalItems: initialItemCount,
            sampleItems: tab.Item.slice(0, 3).map((item: any) => item.$)
          }
        },
        { status: 404 }
      )
    }

    // If tab has no items left, we can either keep it empty or remove it
    // For now, we'll keep it empty

    // Build XML back
    console.log('Building XML back...')
    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'utf-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' },
    })

    const xml = builder.buildObject(parsedXml)
    console.log('XML built, length:', xml.length)

    // Write back to file
    await fs.writeFile(shopPath, xml, 'utf-8')
    console.log('File written successfully')
    console.log('=== DELETE SUCCESSFUL ===')

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully',
    })
  } catch (error) {
    console.error('=== ERROR DELETING ITEM ===')
    console.error('Error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Failed to delete item from shop',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


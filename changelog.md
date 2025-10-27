# [v0.0.3]
- Item editor now has a delete option to delete single items by right click
- Added Skill and Luck to the item creation form
- Made some UI improvments to the warehouse view to better match MU
- Added 5th wing options to the item creator
- Added Harmony Options to the item creator
- Mastery Set items added to the item creator
- Added support for socket items + seeds. Currently it supports level 5 seeds. level 10-20 will be added soon



# [v0.0.2]
- Added warehouse inventory decoder for Base64-encoded item data
- Implemented warehouse grid display (8x15, 120 slots) on character page
- Added item quality visualization (normal, magic, rare, excellent, ancient)
- Added detailed item property display when clicking on warehouse items
- Created warehouse-utils for decoding and parsing MU Online inventory data
- Implemented Item.txt parser to load complete item database with names, sizes, and stats
- Fixed Buffer to string conversion for warehouse data from MySQL
- Added item information display (name, size, requirements) in warehouse tooltips
- Fixed item ID encoding (Group × 512 + Index) for proper item name lookup
- Implemented multi-cell item rendering (items now span multiple grid slots based on size)
- Fixed item level decoding - field[5] contains the direct level value (+0 to +15)
- Fixed item database to only store by encoded ID (prevents conflicts between groups)
- Added item image support with fallback to text display
- Created items-data.ts with TypeScript item format and image mappings
- Warehouse now displays item images when available (with +level badge overlay)
- Updated warehouse styling: uniform blue tone for all items with lighter hover effect
- Implemented bitfield decoding for Excellent attributes (0-63 for 6 options)
- Excellent Options (6): Excellent Dmg+10%, Dmg+Lv/20, Dmg+2%, Speed+7, Mana/8, Life/8
- Corrected Option field[6]: represents luck damage level (0-7, each step = +4 damage)
- Luck now shows calculated damage bonus: "✓ Yes (+28 dmg)" for option level 7
- Excellent options show as expandable list with human-readable descriptions
- Added hover card on items inside warehouse to show detailed information

# [v0.0.1]
- Connect the Nextjs application to the MariaDB database
- Build out the general UI for the application
- Implemented basic account information being displayed on the page from the database
- Implemented basic character information being displayed on the page from the database
- Added the ability to edit characters and pushing those changes to the database
- Get the correct class codes for all classes and display them in the UI
- Get the correct map ID for characters and display them in the UI
- Added checks to see if a character is Banned, Offline or Online and display it in the UI
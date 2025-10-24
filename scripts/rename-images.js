const fs = require('fs');
const path = require('path');

// Function to rename images in a directory
function renameImagesInDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            console.log(`Processing directory: ${item}`);
            renameImagesInDirectory(itemPath);
        } else if (stat.isFile() && item.endsWith('.gif')) {
            // Check if the file matches the pattern X-NUMBER.gif
            const match = item.match(/^(\d+)-(\d+)\.gif$/);
            if (match) {
                const folderName = match[1];
                const number = match[2];
                const newName = `${number}.gif`;
                const oldPath = itemPath;
                const newPath = path.join(dirPath, newName);
                
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed: ${item} -> ${newName}`);
                } catch (error) {
                    console.error(`Error renaming ${item}:`, error.message);
                }
            }
        }
    });
}

// Main execution
const publicItemsPath = path.join(__dirname, '..', 'public', 'items');

console.log('Starting image renaming process...');
console.log(`Target directory: ${publicItemsPath}`);

if (!fs.existsSync(publicItemsPath)) {
    console.error(`Directory does not exist: ${publicItemsPath}`);
    process.exit(1);
}

try {
    renameImagesInDirectory(publicItemsPath);
    console.log('Image renaming completed successfully!');
} catch (error) {
    console.error('Error during renaming process:', error.message);
    process.exit(1);
}

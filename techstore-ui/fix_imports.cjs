const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Valdes-Hack/Desktop/Hack-ElectonicProjet/Front-End/techstore-ui/src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if useTheme is used
    if (content.includes('useTheme()')) {
        // Check if useTheme is already imported
        if (!content.includes('useTheme')) {
            // It's used but not imported? Wait, if it includes useTheme(), it includes useTheme.
            // Let's check for the import specifically
        }
        if (!content.includes('from \'../../context/ThemeContext\'') && !content.includes('from "../../context/ThemeContext"')) {
            // Add import after the first import React line
            content = content.replace(/import React[^;]*;\r?\n/, match => {
                return match + "import { useTheme } from '../../context/ThemeContext';\n";
            });
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed import in ${file}`);
        }
    }
});

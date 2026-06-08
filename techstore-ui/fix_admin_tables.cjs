const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/Valdes-Hack/Desktop/Hack-ElectonicProjet/Front-End/techstore-ui/src/pages/admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // Replace 1
    if (content.includes("flex-1 rounded-[2.5rem] border overflow-hidden flex flex-col")) {
        content = content.replace(
            /flex-1 rounded-\[2\.5rem\] border overflow-hidden flex flex-col/g,
            "w-full max-w-full rounded-[2.5rem] border flex flex-col"
        );
        modified = true;
    }

    // Replace 2
    if (content.includes("overflow-x-auto custom-scrollbar flex-1")) {
        content = content.replace(
            /overflow-x-auto custom-scrollbar flex-1/g,
            "overflow-x-auto w-full custom-scrollbar rounded-[2.5rem]"
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed mobile table in ${file}`);
    }
});

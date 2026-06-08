const fs = require('fs');
const path = require('path');

const file1 = 'C:/Users/Valdes-Hack/Desktop/Hack-ElectonicProjet/Front-End/techstore-ui/src/components/product/ProductCard.jsx';
let content1 = fs.readFileSync(file1, 'utf8');
content1 = content1.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { getFullImageUrl } from '../../utils/imageUtils';");
content1 = content1.replace(
    /const getFullUrl = \(url\) => \{[\s\S]*?return `\$\{baseUrl\.replace\('\/api\/v1', ''\)\}\/uploads\/products\/\$\{url\}`;[\s\S]*?\};/,
    ""
);
content1 = content1.replace(/getFullUrl\(/g, "getFullImageUrl(");
fs.writeFileSync(file1, content1);

const file2 = 'C:/Users/Valdes-Hack/Desktop/Hack-ElectonicProjet/Front-End/techstore-ui/src/pages/public/ProductDetail.jsx';
let content2 = fs.readFileSync(file2, 'utf8');
content2 = content2.replace("import ProductCard from '../../components/product/ProductCard';", "import ProductCard from '../../components/product/ProductCard';\nimport { getFullImageUrl } from '../../utils/imageUtils';");
content2 = content2.replace(
    /const getFullUrl = \(url\) => \{[\s\S]*?return `\$\{baseUrl\.replace\('\/api\/v1', ''\)\}\/uploads\/products\/\$\{url\}`;[\s\S]*?\};/,
    ""
);
content2 = content2.replace(/getFullUrl\(/g, "getFullImageUrl(");
fs.writeFileSync(file2, content2);

const file3 = 'C:/Users/Valdes-Hack/Desktop/Hack-ElectonicProjet/Front-End/techstore-ui/src/pages/admin/Products.jsx';
let content3 = fs.readFileSync(file3, 'utf8');
if (!content3.includes('getFullImageUrl')) {
    content3 = content3.replace("import AdminService from '../../services/admin.service';", "import AdminService from '../../services/admin.service';\nimport { getFullImageUrl } from '../../utils/imageUtils';");
    content3 = content3.replace(
        /src=\{p\.images\?\.\[imgIdxMap\[p\.id\]\]\?\.url\?\.startsWith\('http'\)[\s\S]*?\? p\.images\[imgIdxMap\[p\.id\]\]\.url[\s\S]*?: `\$\{import\.meta\.env\.VITE_API_URL\}\/uploads\/products\/\$\{p\.images\?\.\[imgIdxMap\[p\.id\]\]\?\.url\}`\}/,
        "src={getFullImageUrl(p.images?.[imgIdxMap[p.id]]?.url)}"
    );
    fs.writeFileSync(file3, content3);
}

console.log("Images fixed!");

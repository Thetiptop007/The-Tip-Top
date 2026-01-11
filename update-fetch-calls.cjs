const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/Admin/Customers.jsx',
  'src/pages/Admin/Settings.jsx',
  'src/pages/Admin/DeliveryAgents.jsx',
  'src/pages/Admin/MenuItems.jsx',
  'src/pages/Admin/Orders.jsx'
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Replace fetch('/api/v1/... with fetch(getApiUrl('api/v1/...
  const pattern1 = /fetch\('\/api\/v1\//g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, "fetch(getApiUrl('api/v1/");
    changed = true;
  }
  
  // Replace fetch(`/api/v1/... with fetch(getApiUrl(`api/v1/...
  const pattern2 = /fetch\(`\/api\/v1\//g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, "fetch(getApiUrl(`api/v1/");
    changed = true;
  }
  
  // Fix closing parentheses for string literals
  content = content.replace(/getApiUrl\('api\/v1\/([^']+)'\)/g, "getApiUrl('api/v1/$1'))");
  
  // Fix closing parentheses for template literals  
  content = content.replace(/getApiUrl\(`api\/v1\/([^`]+)`\)/g, "getApiUrl(`api/v1/$1`))");
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
  }
});

console.log('\n✨ Done!');

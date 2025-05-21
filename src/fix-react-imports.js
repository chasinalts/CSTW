const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript and TSX files
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to fix React imports in a file
function fixReactImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace named imports from 'react' with default import
    const namedImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]react['"];?/g;
    
    content = content.replace(namedImportRegex, (match, namedImports) => {
      return `import React from 'react';\n// Original named imports: ${namedImports}`;
    });
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Main function
function main() {
  const srcDir = path.join(__dirname);
  const tsFiles = findTsFiles(srcDir);
  
  console.log(`Found ${tsFiles.length} TypeScript files to process`);
  
  tsFiles.forEach(filePath => {
    fixReactImports(filePath);
  });
  
  console.log('Done fixing React imports');
}

main();

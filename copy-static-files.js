// copy-static-files.js
import fs from 'fs';
import path from 'path';

// Create public/js directory if it doesn't exist
if (!fs.existsSync('public/js')) {
  fs.mkdirSync('public/js', { recursive: true });
}

// Copy all JS files from js/ to public/js/
const jsFiles = fs.readdirSync('js');
jsFiles.forEach(file => {
  if (file.endsWith('.js')) {
    fs.copyFileSync(
      path.join('js', file),
      path.join('public/js', file)
    );
    console.log('Copied js/' + file + ' to public/js/' + file);
  }
});

// Copy CSS files if needed
if (fs.existsSync('css') && !fs.existsSync('public/css')) {
  fs.mkdirSync('public/css', { recursive: true });

  const cssFiles = fs.readdirSync('css');
  cssFiles.forEach(file => {
    if (file.endsWith('.css')) {
      fs.copyFileSync(
        path.join('css', file),
        path.join('public/css', file)
      );
      console.log('Copied css/' + file + ' to public/css/' + file);
    }
  });
}

console.log('Static files copied successfully!');

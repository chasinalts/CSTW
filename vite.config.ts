import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Get all HTML files in the root directory
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// Create input object for all HTML files
const input = {};
htmlFiles.forEach(file => {
  input[file.replace('.html', '')] = resolve(__dirname, file);
});

// Add index.html by default
input.index = resolve(__dirname, 'index.html');

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input,
      output: {
        // Ensure JS files maintain their directory structure
        entryFileNames: (chunkInfo) => {
          // For JS files in the js directory, keep them in js/
          if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('/js/')) {
            return 'js/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  // Copy static assets that aren't imported in JS
  publicDir: 'public',
});

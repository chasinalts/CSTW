#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist/js
mkdir -p dist/css

# Copy HTML files
cp *.html dist/

# Copy JS files
cp js/*.js dist/js/

# Copy CSS files
cp css/*.css dist/css/

# Copy any other static assets if needed
# cp -r images dist/

echo "Files copied to dist directory. Ready for deployment."

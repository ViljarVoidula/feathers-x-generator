const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sourceDir = './src';
const destDir = './dist';

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Find all .hbs files in the source directory and its subdirectories
const files = glob.sync('**/*.hbs', {
  cwd: sourceDir,
  nodir: true,
  absolute: true,
});

// Copy each file to the destination directory, preserving folder structure
files.forEach((file) => {
  const relativePath = path.relative(sourceDir, file);
  const destPath = path.join(destDir, relativePath);
  const destFolder = path.dirname(destPath);

  // Create destination folder if it doesn't exist
  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  // Copy file to destination folder
  fs.copyFileSync(file, destPath);
});

console.log('All .hbs files have been copied to folderB.');

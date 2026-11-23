const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'showcase');
const destDir = path.resolve(__dirname, '..', 'dist', 'showcase');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  console.log(`Copied showcase/ -> dist/showcase/`);
} else {
  console.warn('showcase/ directory not found, skipping copy.');
}

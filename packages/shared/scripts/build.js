const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const esmFile = path.join(distDir, 'index.js');
const cjsFile = path.join(distDir, 'index.cjs');

if (fs.existsSync(esmFile)) {
  let content = fs.readFileSync(esmFile, 'utf8');
  // Convert ESM export var / export const to exports.
  content = content.replace(/export var (\w+);/g, 'var $1; exports.$1 = $1;');
  content = content.replace(/export const (\w+) =/g, 'const $1 = exports.$1 =');
  fs.writeFileSync(cjsFile, content, 'utf8');
  console.log('Successfully generated dist/index.cjs for CommonJS consumers');
}

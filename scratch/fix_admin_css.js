const fs = require('fs');
const file = 'd:/Code/Credify/Client/src/styles/admin.css';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/transition:\s*all\s+(var\(--transition-fast\)|0\.2s\s+ease-in-out|0\.2s\s+ease|0\.15s\s+ease);/g, 
  'transition: background-color $1, border-color $1, color $1, box-shadow $1, transform $1;');
fs.writeFileSync(file, content);
console.log("Replaced transitions in admin.css");

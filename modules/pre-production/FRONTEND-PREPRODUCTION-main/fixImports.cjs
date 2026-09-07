const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('downloadCsvAsExcel(')) {
        // 1. Add import
        if (!content.includes("import { downloadCsvAsExcel }")) {
          const relativePath = path.relative(path.dirname(fullPath), path.join(__dirname, 'src/utils/downloadExcel'));
          const importStatement = `import { downloadCsvAsExcel } from '${relativePath.replace(/\\/g, '/')}';\n`;
          
          const lastImportIndex = content.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
            const nextLineIndex = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
          } else {
            content = importStatement + content;
          }
          changed = true;
        }

        // 2. Add dateStr or d if needed
        if (content.includes('${dateStr}') && !content.includes('const dateStr =')) {
           const dateStrDef = `const d = new Date();\n        const dateStr = \`\${d.getDate()}-\${d.getMonth() + 1}-\${d.getFullYear()}\`;\n    `;
           content = content.replace('downloadCsvAsExcel(', dateStrDef + 'downloadCsvAsExcel(');
           changed = true;
        } else if (content.includes('d.getDate()') && !content.includes('const d = new Date()') && !content.includes('const d = new Date;')) {
           const dateDef = `const d = new Date();\n    `;
           content = content.replace('downloadCsvAsExcel(', dateDef + 'downloadCsvAsExcel(');
           changed = true;
        }
        
        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Fixed', fullPath);
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'src/pages'));
console.log('Done fixing imports and variables.');

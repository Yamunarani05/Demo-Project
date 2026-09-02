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
      
      if (content.includes('new Blob') && content.includes('text/csv') && content.includes('csvContent')) {
        console.log('Processing', fullPath);
        
        // Extract the filename from link.setAttribute("download", <filename>) or link.download = <filename>
        let filenameMatch = content.match(/link\.setAttribute\s*\(\s*['"]download['"]\s*,\s*([^)]+)\s*\)/) || content.match(/link\.download\s*=\s*([^;\n]+)/);
        
        if (filenameMatch) {
          const filenameExp = filenameMatch[1].trim();
          
          // Regex to match the entire blob to removeChild block
          const replaceRegex = /const\s+blob\s*=\s*new\s+Blob[\s\S]*?(?:document\.body\.removeChild\s*\(\s*link\s*\)\s*;?|})\s*(?=\n|$)/g;
          
          if (replaceRegex.test(content)) {
            // we will replace the block with our utility call
            content = content.replace(replaceRegex, `// Using XLSX utility instead of raw CSV\n    downloadCsvAsExcel(csvContent, ${filenameExp});`);
            
            // we need to add the import statement if not already there
            if (!content.includes('downloadCsvAsExcel')) {
              // find the depth for the import path
              const relativePath = path.relative(path.dirname(fullPath), path.join(__dirname, 'src/utils/downloadExcel'));
              const importStatement = `import { downloadCsvAsExcel } from '${relativePath.replace(/\\/g, '/')}';\n`;
              // insert after the last import
              const lastImportIndex = content.lastIndexOf('import ');
              if (lastImportIndex !== -1) {
                const nextLineIndex = content.indexOf('\n', lastImportIndex);
                content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
              } else {
                content = importStatement + content;
              }
            }
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log('Fixed', fullPath);
          }
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'src/pages'));
console.log('Done.');

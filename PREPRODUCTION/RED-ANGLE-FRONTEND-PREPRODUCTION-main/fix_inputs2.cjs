const fs = require('fs');
const filePath = 'e:/Redangle/RED-ANGLE-FRONTEND-PREPRODUCTION/src/ClientFlow/InvoicePreviewModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The lines containing data-html2canvas-ignore="true" for inputs
const targetStrings = [
  'data-html2canvas-ignore="true"'
];

let newContent = content;
let searchPos = 0;

while (true) {
  const ignorePos = newContent.indexOf('data-html2canvas-ignore="true"', searchPos);
  if (ignorePos === -1) break;

  // Check if it's inside an input tag by finding the nearest preceding '<'
  let tagStart = -1;
  for (let i = ignorePos; i >= 0; i--) {
    if (newContent[i] === '<') {
      tagStart = i;
      break;
    }
  }
  
  if (tagStart !== -1 && newContent.slice(tagStart, tagStart + 6) === '<input') {
    // Find the end of the input tag '/>'
    let tagEnd = -1;
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = ignorePos; i < newContent.length; i++) {
      const char = newContent[i];
      if ((char === '"' || char === "'") && newContent[i-1] !== '\\') {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = char;
        } else if (quoteChar === char) {
          inQuotes = false;
        }
      }
      
      if (!inQuotes && char === '/' && newContent[i+1] === '>') {
        tagEnd = i + 2;
        break;
      }
    }
    
    if (tagEnd !== -1) {
      // Check if it's already wrapped
      const beforeStr = newContent.slice(Math.max(0, tagStart - 20), tagStart);
      if (!beforeStr.includes('!hideActions && (')) {
        const inputStr = newContent.slice(tagStart, tagEnd);
        const wrapped = `{/*!hideActions*/!hideActions && (\n${inputStr}\n)}`;
        
        newContent = newContent.slice(0, tagStart) + wrapped + newContent.slice(tagEnd);
        searchPos = tagStart + wrapped.length;
        console.log('Wrapped input around index', tagStart);
        continue;
      }
    }
  }
  
  searchPos = ignorePos + 'data-html2canvas-ignore="true"'.length;
}

fs.writeFileSync(filePath, newContent);
console.log('Done!');

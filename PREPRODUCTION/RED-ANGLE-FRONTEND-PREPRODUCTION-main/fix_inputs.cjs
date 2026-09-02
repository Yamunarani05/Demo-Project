const fs = require('fs');
const filePath = 'e:/Redangle/RED-ANGLE-FRONTEND-PREPRODUCTION/src/ClientFlow/InvoicePreviewModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

let newContent = '';
let i = 0;
while (i < content.length) {
  const nextInput = content.indexOf('<input', i);
  if (nextInput === -1) {
    newContent += content.slice(i);
    break;
  }
  
  // Find matching />
  let j = nextInput;
  let inQuotes = false;
  let quoteChar = '';
  let foundEnd = false;
  while (j < content.length) {
    const char = content[j];
    if ((char === '"' || char === "'") && content[j-1] !== '\\') {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (quoteChar === char) {
        inQuotes = false;
      }
    }
    
    if (!inQuotes && char === '/' && content[j+1] === '>') {
      j += 2;
      foundEnd = true;
      break;
    }
    j++;
  }
  
  if (foundEnd) {
    const inputStr = content.slice(nextInput, j);
    // Check if it's already wrapped
    const beforeStr = content.slice(Math.max(0, nextInput - 20), nextInput);
    if (!beforeStr.includes('!hideActions && (')) {
      newContent += content.slice(i, nextInput);
      newContent += `{/*!hideActions*/!hideActions && (\n${inputStr}\n)}`;
      i = j;
    } else {
      newContent += content.slice(i, j);
      i = j;
    }
  } else {
    newContent += content.slice(i, nextInput + 6);
    i = nextInput + 6;
  }
}

fs.writeFileSync(filePath, newContent);
console.log('Done replacing inputs!');

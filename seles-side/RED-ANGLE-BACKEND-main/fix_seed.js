const fs = require('fs');

const file = 'e:/Redangle/Sales/RED-ANGLE-BACKEND/prisma/seed.ts';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  // Remove duplicate price on line 737
  if (i + 1 === 737) {
    lines[i] = lines[i].replace(', price: 12000, price: 12000', ', price: 12000');
  }

  // Lines to remove price from
  const linesToRemovePrice = [
    613, 614, 615, 647, 648, 650, 675, 676, 677, 680, 706, 707, 708, 709, 710, 712, 719
  ];
  
  if (linesToRemovePrice.includes(i + 1)) {
    lines[i] = lines[i].replace(/,\s*price:\s*\d+/, '');
  }
}

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed seed.ts');

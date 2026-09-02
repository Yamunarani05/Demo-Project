const fs = require('fs');

const filePath = 'e:/Redangle/RED-ANGLE-FRONTEND-PREPRODUCTION/src/ClientFlow/InvoicePreviewModal.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const inputRegex = /<input\s+type="text"\s+data-html2canvas-ignore="true"[^>]*?\/>/g;

content = content.replace(inputRegex, (match) => {
    return `{/*!hideActions*/!hideActions && (\n${match}\n)}`;
});

fs.writeFileSync(filePath, content);
console.log('Inputs hidden successfully');

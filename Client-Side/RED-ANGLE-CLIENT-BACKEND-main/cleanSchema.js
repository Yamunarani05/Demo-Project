const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

const lines = content.split('\n');
let newLines = [];
let inBlock = false;
let blockType = '';
let blockName = '';
let seenFields = new Set();

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('model ') || trimmed.startsWith('enum ')) {
        inBlock = true;
        blockType = trimmed.startsWith('model') ? 'model' : 'enum';
        blockName = trimmed.split(' ')[1];
        seenFields = new Set();
        newLines.push(line);
        continue;
    }

    if (inBlock && trimmed === '}') {
        inBlock = false;
        newLines.push(line);
        continue;
    }

    if (inBlock) {
        if (trimmed === '' || trimmed.startsWith('@@')) {
            newLines.push(line);
            continue;
        }

        let fieldName = trimmed.split(/\s+/)[0];
        
        // For enums, fieldName is the value itself
        if (blockType === 'enum') {
            if (!seenFields.has(fieldName)) {
                seenFields.add(fieldName);
                newLines.push(line);
            }
            continue;
        }

        // For models, fieldName is the first token
        if (!seenFields.has(fieldName)) {
            seenFields.add(fieldName);
            newLines.push(line);
        }
    } else {
        // Outside of blocks
        if (trimmed.startsWith('generator') || trimmed.startsWith('datasource')) {
            newLines.push(line);
            inBlock = true;
            seenFields = new Set();
        } else {
            // Wait, what if there's an entire duplicate model? 
            // We should just drop duplicate models completely.
            // Oh wait, `inBlock = false` covers outside blocks
            // The script currently pushes everything outside blocks
            newLines.push(line);
        }
    }
}

// deduplicate models completely
const blockContent = newLines.join('\n');
const parsedBlocks = [];
const blocksSet = new Set();
let finalLines = [];
let currentBlock = [];
let currentBlockName = null;

for (const line of newLines) {
    const t = line.trim();
    if (t.startsWith('model ') || t.startsWith('enum ') || t.startsWith('generator ') || t.startsWith('datasource ')) {
        currentBlockName = t.split(' ')[1];
        currentBlock = [line];
    } else if (currentBlockName && t === '}') {
        currentBlock.push(line);
        if (!blocksSet.has(currentBlockName)) {
            blocksSet.add(currentBlockName);
            finalLines.push(...currentBlock);
            finalLines.push(''); // add empty line
        }
        currentBlockName = null;
    } else if (currentBlockName) {
        currentBlock.push(line);
    } else {
        if(t !== '') finalLines.push(line); // keep comments etc, ignore empty lines outside
    }
}

fs.writeFileSync(schemaPath, finalLines.join('\n'));
console.log('Done!');

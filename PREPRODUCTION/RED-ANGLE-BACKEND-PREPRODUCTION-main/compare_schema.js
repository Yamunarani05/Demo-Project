const fs = require('fs');
const initDbStr = fs.readFileSync('./src/config/initDb.ts', 'utf8');

// Simple parser for CREATE TABLE IF NOT EXISTS
const tablesInInitDb = {};
const regex = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)\s*\(([\s\S]*?)\)/g;
let match;
while ((match = regex.exec(initDbStr)) !== null) {
  const tableName = match[1];
  const columnsStr = match[2];
  
const columns = columnsStr.split(',\n').map(c => c.trim()).filter(c => c && !c.startsWith('FOREIGN KEY') && !c.startsWith('PRIMARY KEY') && !c.startsWith('UNIQUE') && !c.startsWith('CONSTRAINT'));
  const parsedCols = columns.map(c => {
    // remove trailing commas
    const cleanC = c.replace(/,$/, '').trim();
    const parts = cleanC.split(/\s+/);
    return { name: parts[0], type: parts.slice(1).join(' ') };
  });
  
  tablesInInitDb[tableName] = parsedCols;
}

const dumpedStr = fs.readFileSync('schema_dump.json', 'utf16le');
// strip dotenv output from dumpedStr
const jsonStart = dumpedStr.indexOf('{');
const dbSchema = JSON.parse(dumpedStr.slice(jsonStart));

console.log("=== MISSING TABLES IN initDb.ts ===");
for (const table in dbSchema) {
  if (!tablesInInitDb[table]) {
    console.log(table);
  }
}

console.log("\n=== MISSING/DIFFERING COLUMNS IN initDb.ts ===");
for (const table in dbSchema) {
  if (tablesInInitDb[table]) {
    const initCols = tablesInInitDb[table].map(c => c.name);
    const dbCols = dbSchema[table].map(c => c.column);
    
    for (const dbCol of dbCols) {
      if (!initCols.includes(dbCol)) {
        console.log(`Table ${table} is missing column: ${dbCol}`);
      }
    }
  }
}

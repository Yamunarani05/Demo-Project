const fs = require('fs');
const initDbStr = fs.readFileSync('./src/config/initDb.ts', 'utf8');

const tablesInInitDb = {};
const regex = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)\s*\(([\s\S]*?)\)/g;
let match;
while ((match = regex.exec(initDbStr)) !== null) {
  const tableName = match[1];
  const columnsStr = match[2];
  
  const columns = columnsStr.split(/,\r?\n/).map(c => c.trim()).filter(c => c && !c.startsWith('FOREIGN KEY') && !c.startsWith('PRIMARY KEY') && !c.startsWith('UNIQUE') && !c.startsWith('CONSTRAINT'));
  const parsedCols = columns.map(c => {
    const cleanC = c.replace(/,$/, '').trim();
    const parts = cleanC.split(/\s+/);
    return { name: parts[0], type: parts.slice(1).join(' ') };
  });
  
  tablesInInitDb[tableName] = parsedCols;
}

const dumpStr = fs.readFileSync('dump.sql', 'utf8');
const dbTables = {};
const tableRegex = /CREATE TABLE public\.([a-z0-9_]+)\s*\(([\s\S]*?)\);/g;
while ((match = tableRegex.exec(dumpStr)) !== null) {
  const tableName = match[1];
  const columnsStr = match[2];
  
  const columns = columnsStr.split(/,\r?\n/).map(c => c.trim());
  const parsedCols = {};
  for (const c of columns) {
    if (!c || c.startsWith('CONSTRAINT')) continue;
    const cleanC = c.replace(/,$/, '').trim();
    const parts = cleanC.split(/\s+/);
    parsedCols[parts[0]] = parts.slice(1).join(' ');
  }
  dbTables[tableName] = parsedCols;
}

let alterSql = '-- Run this script on your production database to add missing columns\n\n';

for (const table in dbTables) {
  if (!tablesInInitDb[table]) {
    alterSql += `-- Table ${table} is missing entirely in initDb.ts!\n`;
    alterSql += `CREATE TABLE IF NOT EXISTS ${table} (\n`;
    const cols = Object.keys(dbTables[table]);
    const colDefs = cols.map(c => `    ${c} ${dbTables[table][c]}`);
    alterSql += colDefs.join(',\n');
    alterSql += `\n);\n\n`;
    continue;
  }
  
  const initCols = tablesInInitDb[table].map(c => c.name);
  const dbCols = Object.keys(dbTables[table]);
  
  let hasMissing = false;
  for (const dbCol of dbCols) {
    if (!initCols.includes(dbCol) && dbCol !== 'id') {
       if (!hasMissing) {
          alterSql += `-- Missing columns for ${table}\n`;
          hasMissing = true;
       }
       let typeDef = dbTables[table][dbCol];
       alterSql += `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${dbCol} ${typeDef};\n`;
    }
  }
  if (hasMissing) alterSql += '\n';
}

fs.writeFileSync('alter_production.sql', alterSql);
console.log("Generated alter_production.sql successfully.");

const fs = require('fs');

const initDbStr = fs.readFileSync('./src/config/initDb.ts', 'utf8');
const dumpStr = fs.readFileSync('dump.sql', 'utf8');

const dbTables = {};
const tableRegex = /CREATE TABLE public\.([a-z0-9_]+)\s*\(([\s\S]*?)\);/g;
let match;
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

let newInitDbStr = initDbStr;

// Find all CREATE TABLE blocks
const initRegex = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)\s*\(([\s\S]*?)\)/g;
const replacements = [];
while ((match = initRegex.exec(initDbStr)) !== null) {
  const tableName = match[1];
  const columnsStr = match[2];
  
  if (!dbTables[tableName]) continue; // shouldn't happen unless dropped
  
  const initColsList = columnsStr.split(/,\r?\n/).map(c => c.trim()).filter(c => c && !c.startsWith('FOREIGN KEY') && !c.startsWith('PRIMARY KEY') && !c.startsWith('UNIQUE') && !c.startsWith('CONSTRAINT'));
  const initColNames = initColsList.map(c => {
    const cleanC = c.replace(/,$/, '').trim();
    return cleanC.split(/\s+/)[0];
  });
  
  let addedCols = [];
  for (const dbCol of Object.keys(dbTables[tableName])) {
    if (!initColNames.includes(dbCol) && dbCol !== 'id') {
       let def = dbTables[tableName][dbCol];
       addedCols.push(`        ${dbCol} ${def}`);
    }
  }
  
  if (addedCols.length > 0) {
    // replace the last line (before closing paren) with the new columns
    // We can just append to columnsStr
    const newColumnsStr = columnsStr + ',\n' + addedCols.join(',\n');
    replacements.push({
      oldStr: `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsStr})`,
      newStr: `CREATE TABLE IF NOT EXISTS ${tableName} (${newColumnsStr})`
    });
  }
}

for (const rep of replacements) {
  newInitDbStr = newInitDbStr.replace(rep.oldStr, rep.newStr);
}

// Add completely missing tables before the assign_teams table or at the end
let missingTablesSql = '';
const existingTablesInInit = [];
let match2;
const initRegex2 = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)/g;
while ((match2 = initRegex2.exec(initDbStr)) !== null) {
  existingTablesInInit.push(match2[1]);
}

for (const table in dbTables) {
  if (!existingTablesInInit.includes(table)) {
    missingTablesSql += `\n    // Missing table ${table} added automatically\n`;
    missingTablesSql += `    await client.query(\`\n      CREATE TABLE IF NOT EXISTS ${table} (\n`;
    const colDefs = Object.keys(dbTables[table]).map(c => `        ${c} ${dbTables[table][c]}`);
    missingTablesSql += colDefs.join(',\n');
    missingTablesSql += `\n      )\n    \`);\n`;
  }
}

if (missingTablesSql) {
  // insert before the catch block of ensureTablesExist
  newInitDbStr = newInitDbStr.replace(/  } catch \(err\) {/g, missingTablesSql + '\n  } catch (err) {');
}

fs.writeFileSync('./src/config/initDb.ts', newInitDbStr);
console.log("Patched initDb.ts successfully.");

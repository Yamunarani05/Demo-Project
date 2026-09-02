const fs = require('fs');

const initDbStr = fs.readFileSync('./src/config/initDb.ts', 'utf8');
const schemaDumpStr = fs.readFileSync('./schema_dump.json', 'utf8');
const schemaDump = JSON.parse(schemaDumpStr);

const tablesInInit = [];
const regex = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)/g;
let match;
while ((match = regex.exec(initDbStr)) !== null) {
  tablesInInit.push(match[1]);
}

for (const table in schemaDump) {
  if (!tablesInInit.includes(table)) {
    console.log(`Table missing in initDb.ts: ${table}`);
  }
}

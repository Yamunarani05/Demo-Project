const fs = require('fs');

const initDbStr = fs.readFileSync('./src/config/initDb.ts', 'utf8');
const alterSql = fs.readFileSync('alter_production.sql', 'utf8');

// The alterSql has comments and statements. We need to format them for initDb.ts
// which means wrapping the CREATE TABLES and ALTER TABLES in client.query()
// Wait, we can just dump the entire alterSql directly into a single client.query(`...`) block!
// Because postgres handles multiple statements in a single query string just fine.

let toAppend = `\n    // Automatically generated schema sync from pre-production database\n`;
toAppend += `    try {\n      await client.query(\`\n`;
toAppend += alterSql.replace(/`/g, '\\`'); // escape backticks just in case
toAppend += `\n      \`);\n    } catch(err) { console.error("Schema sync failed: ", err); }\n`;

const targetStr = "console.log(`✅ All tables verified & created successfully in";
const newInitDbStr = initDbStr.replace(targetStr, toAppend + '\n    ' + targetStr);

fs.writeFileSync('./src/config/initDb.ts', newInitDbStr);
console.log("Appended alter statements to initDb.ts successfully.");

const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');

async function clean() {
    await client.connect();
    
    // We update all rows that have the detail block
    // We take whatever was before the first block, and append whatever is in the LAST block
    await client.query(`
        UPDATE assigned_projects 
        SET admin_notes = TRIM(SPLIT_PART(COALESCE(admin_notes, ''), '=== Client Pre-production Details ===', 1)) || 
            '\n\n=== Client Pre-production Details ===' || 
            SPLIT_PART(COALESCE(admin_notes, ''), '=== Client Pre-production Details ===', array_length(string_to_array(COALESCE(admin_notes, ''), '=== Client Pre-production Details ==='), 1))
        WHERE admin_notes LIKE '%=== Client Pre-production Details ===%=== Client Pre-production Details ===%';
    `);
    
    console.log("Database cleaned!");
    await client.end();
}

clean().catch(console.error);

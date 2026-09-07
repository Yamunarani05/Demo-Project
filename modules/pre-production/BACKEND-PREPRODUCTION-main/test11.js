const { Client } = require('pg');
const client = new Client('postgresql://postgres:password@localhost:6000/Redangle-Preproduction');
async function test() {
    await client.connect();
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'event_details'`);
    console.log(res.rows.map(r => r.column_name));
    client.end();
}
test();

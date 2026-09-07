require('dotenv').config();
const { syncCompletedLeads } = require('./src/services/externalLead.service');

syncCompletedLeads().then((count) => {
  console.log(`Successfully synced ${count} leads`);
  process.exit(0);
}).catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});

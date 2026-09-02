const fs = require('fs');
const data = JSON.parse(fs.readFileSync('event_details.json', 'utf8'));
const obj = data[0];
const keys = [];
for (const key in obj) {
  if (key.includes('upload_notes') && obj[key] !== null) {
    keys.push(key);
  }
}
fs.writeFileSync('notes_keys.json', JSON.stringify(keys, null, 2));

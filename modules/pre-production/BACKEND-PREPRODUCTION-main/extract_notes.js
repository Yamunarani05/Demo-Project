const fs = require('fs');
const data = JSON.parse(fs.readFileSync('event_details.json', 'utf8'));
const obj = data[0];
const notes = {};
for (const key in obj) {
  if (key.includes('upload_notes') && obj[key] !== null) {
    notes[key] = obj[key];
  }
}
fs.writeFileSync('notes_output.json', JSON.stringify(notes, null, 2));

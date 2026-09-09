export interface ParsedLeadRow {
  clientName: string;
  phone: string;
  email?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  budget?: number;
  notes?: string;
}

export function parseCsvText(text: string): ParsedLeadRow[] {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length < 2) return [];

  // Header row
  const headers = lines[0].split(/,|\t/).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows: ParsedLeadRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV split respecting quotes
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''));
    if (values.length === 0 || values.every(v => !v)) continue;

    const rowObj: any = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });

    const clientName = rowObj['client name'] || rowObj['name'] || rowObj['clientname'] || rowObj['lead name'] || values[0] || '';
    const phone = rowObj['phone'] || rowObj['contact'] || rowObj['contact number'] || rowObj['mobile'] || values[1] || '';
    const email = rowObj['email'] || rowObj['email address'] || '';
    const eventType = rowObj['event type'] || rowObj['type'] || rowObj['event'] || 'Wedding';
    const eventDate = rowObj['event date'] || rowObj['date'] || new Date().toISOString().split('T')[0];
    const location = rowObj['location'] || rowObj['city'] || 'Local';
    const budget = Number(rowObj['budget'] || rowObj['estimated budget'] || 100000);
    const notes = rowObj['notes'] || rowObj['remarks'] || 'Imported lead';

    if (clientName) {
      rows.push({
        clientName,
        phone: phone || '9999999999',
        email,
        eventType,
        eventDate,
        location,
        budget,
        notes,
      });
    }
  }

  return rows;
}

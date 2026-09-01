import { Pool } from "pg";

type SalesLeadForSync = {
  leadId: number;
  leadSerialNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  eventType?: string | null;
  eventDate?: Date | string | null;
  priority?: string | null;
  status?: string | null;
  createdTime?: Date | string | null;
};

const buildPrePostConnectionString = () => {
  if (process.env.PRE_POST_DATABASE_URL) {
    return process.env.PRE_POST_DATABASE_URL;
  }

  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `/${process.env.PRE_POST_DB_NAME || "Redangle"}`;
  return url.toString();
};

const prePostPool = new Pool({
  connectionString: buildPrePostConnectionString(),
});

const fullName = (lead: SalesLeadForSync) =>
  [lead.firstName, lead.lastName]
    .map(value => String(value || "").trim())
    .filter(Boolean)
    .join(" ");

export const syncLeadToPrePostDb = async (lead: SalesLeadForSync | null | undefined) => {
  if (!lead) return;

  const externalId = lead.leadSerialNumber || String(lead.leadId);
  const existing = await prePostPool.query(
    `
      SELECT external_id
      FROM external_leads
      WHERE external_id = $1
         OR lead_serial_number = $1
         OR external_id = $2
      LIMIT 1
    `,
    [externalId, String(lead.leadId)]
  );
  const upsertExternalId = existing.rows[0]?.external_id || externalId;

  await prePostPool.query(
    `
      INSERT INTO external_leads (
        external_id,
        lead_serial_number,
        lead_name,
        email,
        phone,
        location,
        event_type,
        event_date,
        priority,
        status,
        created_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
      ON CONFLICT (external_id)
      DO UPDATE SET
        lead_serial_number = EXCLUDED.lead_serial_number,
        lead_name = EXCLUDED.lead_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        event_type = EXCLUDED.event_type,
        event_date = EXCLUDED.event_date,
        priority = EXCLUDED.priority,
        status = EXCLUDED.status,
        updated_at = NOW()
    `,
    [
      upsertExternalId,
      lead.leadSerialNumber || externalId,
      fullName(lead),
      lead.email || null,
      lead.contactNumber || null,
      lead.address || null,
      lead.eventType || null,
      lead.eventDate || null,
      lead.priority || null,
      lead.status || "new",
      lead.createdTime || new Date(),
    ]
  );
};

import { pool } from "./src/config/db";

async function testQuery() {
  try {
    const result = await pool.query(`
      SELECT
        e.external_id AS id,
        e.lead_serial_number AS "serialNumber",
        e.lead_name AS "leadName",
        e.email,
        e.phone,
        e.location,
        e.event_type AS "eventType",
        e.flow_type AS "flowType",
        e.current_phase AS "currentPhase",
        e.phase_status AS "phaseStatus",
        e.phase_owner AS "phaseOwner",
        e.pre_production_step AS "preProductionStep",
        e.status,
        e.created_at AS "createdAt",
        COALESCE(ed.preferred_date, e.event_date) AS "eventDate",
        CASE WHEN COALESCE(e.current_phase, '') = 'event' THEN at.event_photographer ELSE at.photographer END AS photographer,
        CASE WHEN COALESCE(e.current_phase, '') = 'event' THEN at.event_videographer ELSE at.videographer END AS videographer,
        CASE WHEN COALESCE(e.current_phase, '') = 'event' THEN at.event_drone ELSE at.drone END AS drone
      FROM (
        SELECT DISTINCT ON (COALESCE(lead_serial_number, external_id::text)) *
        FROM external_leads
        ORDER BY COALESCE(lead_serial_number, external_id::text), created_at DESC, id DESC
      ) e
      LEFT JOIN event_details ed
        ON ed.external_lead_id = e.external_id::text
        OR ed.external_lead_id = e.lead_serial_number
      LEFT JOIN assign_teams at
        ON at.external_lead_id = e.external_id::text
        OR at.external_lead_id = e.lead_serial_number
    `);
    console.log("Success! Rows:", result.rows.length);
  } catch (err) {
    console.error("Query Error:", err.message);
  } finally {
    process.exit(0);
  }
}

testQuery();

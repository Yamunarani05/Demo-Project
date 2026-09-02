import { ensureEventUploadColumnsQuery } from "./src/queries/eventDetails.query";
import { ensureAssignTeamColumnsQuery } from "./src/queries/assignTeam.query";

async function runMigrations() {
  try {
    await ensureEventUploadColumnsQuery();
    await ensureAssignTeamColumnsQuery();
    console.log("Migrations applied successfully!");
  } catch (err) {
    console.error("Migration error:", err.message);
  } finally {
    process.exit(0);
  }
}

runMigrations();

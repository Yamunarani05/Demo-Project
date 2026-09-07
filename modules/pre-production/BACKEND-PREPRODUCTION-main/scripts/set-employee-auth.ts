import dotenv from "dotenv";
dotenv.config();
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const email = (process.argv[2] || "event@gmail.com").toLowerCase().trim();
const password = process.argv[3] || "123456";

const roleMap: Record<string, string> = {
  Photographer: "photographer",
  Videographer: "videographer",
  "Save the Date Post": "employee-1",
  "Save the Date Video": "employee-2",
  "Retouch Photo": "employee-4",
  "Data Manager": "data-manager",
  CRM: "crm",
  "Pre-production CRM": "pre-production-crm",
  "Post-production CRM": "post-production-crm",
  "Event CRM": "post-production-crm",
  "Event Coordinator": "event-coordinator",
  Drone: "drone",
  "Operational Manager": "operational-manager",
  "Traditional Video Editor": "traditional-video-editor",
  "Retouch Editor": "retouch-editor",
  "Album Designer": "album-designer",
  "Magazine Designer": "magazine-designer",
  "Candid Video Editor": "candid-video-editor",
  "Frame Designer": "frame-designer",
};

function normalizeRoles(roles: unknown, fallbackRole: unknown): string[] {
  const raw =
    Array.isArray(roles) && roles.length > 0
      ? roles
      : [fallbackRole].filter(Boolean);
  return Array.from(
    new Set(
      raw
        .map((r) => {
          const label = String(r || "").trim();
          return (
            roleMap[label] ||
            label.toLowerCase().replace(/_/g, "-").replace(/\s+/g, "-")
          );
        })
        .filter(Boolean)
    )
  );
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const emp = await pool.query(
      `SELECT employee_id, first_name, last_name, email, role, roles
       FROM employees WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    if (emp.rows.length === 0) {
      console.error(`No employee found with email: ${email}`);
      process.exit(1);
    }

    const empRow = emp.rows[0];
    const name = [empRow.first_name, empRow.last_name].filter(Boolean).join(" ");
    const userRoles = normalizeRoles(empRow.roles, empRow.role);
    const primaryRole = userRoles[0] || "photographer";
    const hash = await bcrypt.hash(password, 10);

    const existing = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, roles, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())`,
        [name, email, hash, primaryRole, userRoles]
      );
      console.log(`Created user for ${email}`);
    } else {
      await pool.query(
        `UPDATE users
         SET password_hash = $1, is_active = true, name = $2, role = $3, roles = $4
         WHERE LOWER(email) = $5`,
        [hash, name, primaryRole, userRoles, email]
      );
      console.log(`Updated password for ${email}`);
    }

    const user = await pool.query(
      `SELECT email, role, roles, is_active FROM users WHERE LOWER(email) = $1`,
      [email]
    );
    console.log("User record:", user.rows[0]);
    console.log(`Login with email: ${email}  password: ${password}`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const preprodPool = new Pool({
  host: process.env.DB_PREPRODUCTION_HOST || "localhost",
  port: Number(process.env.DB_PREPRODUCTION_PORT) || 6000,
  user: process.env.DB_PREPRODUCTION_USER || "postgres",
  password: process.env.DB_PREPRODUCTION_PASSWORD || "password",
  database: process.env.DB_PREPRODUCTION_NAME || "Redangle-Preproduction",
});

preprodPool.on("error", (err) => {
  console.error("Client Backend: PreProduction DB Pool Error:", err.message);
});

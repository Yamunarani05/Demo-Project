import { ensureDatabaseExists, ensureTablesExist } from './src/config/initDb';
async function run() {
  process.env.DB_NAME = 'test_empty_db_redangle';
  await ensureDatabaseExists();
  await ensureTablesExist();
  console.log('SUCCESS');
  process.exit(0);
}
run();

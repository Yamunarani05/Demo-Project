import { createPixstudioTableQuery } from './src/queries/pixstudio.query';

async function init() {
    console.log("Creating table...");
    await createPixstudioTableQuery();
    console.log("Table created.");
    process.exit(0);
}

init();

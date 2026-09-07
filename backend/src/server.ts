import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import { seedInitialData } from './models/db';

const PORT = env.PORT || 5000;

async function startServer() {
  console.log('⚡ Initializing LUMINA Photography Management Backend...');

  // 1. Probe PostgreSQL connectivity
  const isPostgresReady = await testConnection();

  // 2. Ensure initial memory store is hydrated for fallback resilience
  seedInitialData();

  if (isPostgresReady) {
    console.log('🐘 PostgreSQL connected successfully. Production database online.');
  } else {
    console.log('ℹ️ Running in dual-mode with seeded store. Run `npm run migrate && npm run seed` to initialize PostgreSQL tables.');
  }

  // 3. Start HTTP server
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 LUMINA Backend API Server running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📡 Dashboard Stats: http://localhost:${PORT}/api/dashboard/stats`);
    console.log(`📡 Sales Overview: http://localhost:${PORT}/api/sales/overview`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown
  const handleShutdown = () => {
    console.log('\n🛑 Gracefully shutting down server...');
    server.close(() => {
      console.log('Server closed. Goodbye!');
      process.exit(0);
    });
  };

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

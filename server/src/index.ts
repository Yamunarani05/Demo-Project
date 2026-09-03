import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';

// Existing Landing Page Routes
import healthRoute from './routes/health';
import contactRoute from './routes/contact';
import demoRoute from './routes/demo';
import newsletterRoute from './routes/newsletter';

// Great Master Photography Management Platform Routes
import authRoute from './routes/auth';
import studiosRoute from './routes/studios';
import clientsRoute from './routes/clients';
import shootsRoute from './routes/shoots';
import photographersRoute from './routes/photographers';
import galleriesRoute from './routes/galleries';
import deliverablesRoute from './routes/deliverables';
import paymentsRoute from './routes/payments';
import dashboardRoute from './routes/dashboard';
import calendarRoute from './routes/calendar';
import notificationsRoute from './routes/notifications';
import activityLogsRoute from './routes/activityLogs';
import searchRoute from './routes/search';
import masterRoute from './routes/master';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for API calls
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Root Health & Great Master info
app.get('/', (req, res) => {
  res.json({
    platform: 'GREAT MASTER',
    description: 'Multi-Studio Photography Management SaaS API',
    status: 'ONLINE',
    version: '1.0.0',
  });
});

// Landing Page API Routes
app.use('/api/health', healthRoute);
app.use('/api/contact', contactRoute);
app.use('/api/demo-request', demoRoute);
app.use('/api/newsletter', newsletterRoute);

// Great Master Photography Management Routes
app.use('/api/auth', authRoute);
app.use('/api/studios', studiosRoute);
app.use('/api/clients', clientsRoute);
app.use('/api/shoots', shootsRoute);
app.use('/api/photographers', photographersRoute);
app.use('/api/galleries', galleriesRoute);
app.use('/api/deliverables', deliverablesRoute);
app.use('/api/payments', paymentsRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/calendar', calendarRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/activity-logs', activityLogsRoute);
app.use('/api/search', searchRoute);

// Master Admin Routes (unified master and backwards-compatible sales/master-admin endpoints)
app.use('/api/master', masterRoute);
app.use('/api/master-admin', masterRoute);
app.use('/api/master-admin/sales', masterRoute);

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err?.message || 'Server error' });
});

// Start Server
async function startServer() {
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 GREAT MASTER Backend API listening on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📡 Dashboard API: http://localhost:${PORT}/api/dashboard/super-admin`);
  });
}

startServer();

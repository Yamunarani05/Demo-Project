import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { sendError } from './utils/response';

// Routes
import healthRoute from './routes/health';
import authRoute from './routes/auth';
import mastersRoute from './routes/masters';
import clientsRoute from './routes/clients';
import projectsRoute from './routes/projects';
import shootsRoute from './routes/shoots';
import salesRoute from './routes/sales';
import invoicesRoute from './routes/invoices';
import paymentsRoute from './routes/payments';
import dashboardRoute from './routes/dashboard';
import notificationsRoute from './routes/notifications';
import activityLogsRoute from './routes/activityLogs';
import greatMasterRoute from './routes/greatMaster';
import productsRoute from './routes/products';
import preProductionRoute from './routes/preProduction';

// Existing Landing Page & Studio Portal Routes
import contactRoute from './routes/contact';
import demoRoute from './routes/demo';
import newsletterRoute from './routes/newsletter';
import calendarRoute from './routes/calendar';
import photographersRoute from './routes/photographers';
import galleriesRoute from './routes/galleries';
import deliverablesRoute from './routes/deliverables';
import searchRoute from './routes/search';
import masterRoute from './routes/master';

const app = express();

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible API usage across subdomains
}));

// Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      env.CLIENT_URL,
    ],
    credentials: true,
  })
);

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Request Logger
app.use((req: Request, res: Response, next) => {
  if (env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root Info Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    platform: 'LUMINA SaaS',
    edition: 'Enterprise Photography Business Management System',
    status: 'ONLINE',
    version: '2.0.0',
    database: 'PostgreSQL',
    docs: '/api-docs',
  });
});

// Consolidated Domain Modules
import masterAdminModuleRoutes from './modules/master-admin/masterAdmin.routes';
import clientModuleRoutes from './modules/client/client.routes';
import salesModuleRoutes from './modules/sales/sales.routes';
import preProductionModuleRoutes from './modules/pre-production/preProduction.routes';
import productionModuleRoutes from './modules/production/production.routes';
import postProductionModuleRoutes from './modules/post-production/postProduction.routes';
import financeModuleRoutes from './modules/finance/finance.routes';

// API Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/masters', mastersRoute);
app.use('/api/studios', mastersRoute);
app.use('/api/clients', clientModuleRoutes);
app.use('/api/client', clientModuleRoutes);
app.use('/api/projects', projectsRoute);
app.use('/api/shoots', shootsRoute);
app.use('/api/sales', salesModuleRoutes);
app.use('/api/invoices', financeModuleRoutes);
app.use('/api/payments', financeModuleRoutes);
app.use('/api/finance', financeModuleRoutes);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/notifications', notificationsRoute);
app.use('/api/activity-logs', activityLogsRoute);
app.use('/api/great-master', greatMasterRoute);
app.use('/api/products', productsRoute);
app.use('/api/pre-production', preProductionModuleRoutes);
app.use('/api/production', productionModuleRoutes);
app.use('/api/post-production', postProductionModuleRoutes);
app.use('/api/master-admin', masterAdminModuleRoutes);

// Backwards-compatible routes for existing frontend modules
app.use('/api/master', masterRoute);
app.use('/api/photographers', photographersRoute);
app.use('/api/galleries', galleriesRoute);
app.use('/api/deliverables', deliverablesRoute);
app.use('/api/calendar', calendarRoute);
app.use('/api/search', searchRoute);
app.use('/api/contact', contactRoute);
app.use('/api/demo-request', demoRoute);
app.use('/api/newsletter', newsletterRoute);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND', 404);
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;

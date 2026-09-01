import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from "path";
import { spawn } from 'child_process';
import router from './src/routes';
import { applySalesDBUpdates } from './src/config/applyUpdates';

dotenv.config({ path: path.resolve(process.cwd(), 'backend.env') });

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
console.log("SERVER STARTED RESTARTING...");
// Triggering restart for prisma client update
app.use(

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          process.env.BASE_URL + ":" + PORT,
        ],
        scriptSrc: ["'self'"], 
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors({
  origin: [
    process.env.FRONTEND_URL as string, 
    process.env.CLIENT_FRONTEND_URL as string, 
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177'
  ],
  credentials: true,
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use("/uploads", express.static("uploads"));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    status: 'success',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use(router);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Apply DB updates without deleting data
  applySalesDBUpdates().then(() => {
    // Run seed script once after the backend starts
    console.log("Triggering database seed script...");
  
  const isCompiled = __dirname.includes('dist');
  const command = isCompiled ? 'node' : 'npm';
  const args = isCompiled ? ['dist/prisma/seed.js'] : ['run', 'seed'];
  
  const seedProcess = spawn(command, args, { stdio: 'inherit', shell: true });
  seedProcess.on('close', (code) => {
    console.log(`Database seeding process finished with code ${code}`);
  });
  });
});

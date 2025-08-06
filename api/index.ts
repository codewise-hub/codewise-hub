import express from 'express';
import { registerRoutes } from '../server/routes';

const app = express();
app.use(express.json());

// Register all API routes
registerRoutes(app);

// Export for Vercel
export default app;
import { Router } from 'express';
import { errorHandler } from '../middleware/errorHandler';
import partRoutes from './part.routes';

const router = Router();

// Mount routes
router.use('/parts', partRoutes);

// Error handling middleware must be last
router.use(errorHandler);

export default router; 
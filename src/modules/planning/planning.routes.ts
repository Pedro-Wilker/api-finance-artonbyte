import { Router } from 'express';
import { simulateFinancing } from './controllers/planning.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);
router.post('/financing/simulate', simulateFinancing);

export default router;
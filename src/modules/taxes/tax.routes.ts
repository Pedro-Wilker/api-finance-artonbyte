import { Router } from 'express';
import { calculateTaxes } from './controllers/tax.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);

router.post('/calculate', calculateTaxes);

export default router;
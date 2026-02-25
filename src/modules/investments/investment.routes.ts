import { Router } from 'express';
import { createInvestment, listPortfolio } from './controllers/investment.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);
router.get('/', listPortfolio);
router.post('/', createInvestment);

export default router;
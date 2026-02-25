import { Router } from 'express';
import { createTransaction, listTransactions, getMonthlySummary } from './controllers/transaction.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);

router.post('/', createTransaction);
router.get('/', listTransactions);
router.get('/summary/monthly', getMonthlySummary);

export default router;
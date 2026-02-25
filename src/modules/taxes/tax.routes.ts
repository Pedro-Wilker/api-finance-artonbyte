import { Router } from 'express';
import { getIRPFReport } from './controllers/tax.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);

router.get('/irpf/report', getIRPFReport);

export default router;